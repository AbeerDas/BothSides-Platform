import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Send, RotateCcw, Trophy, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/debate-chat`;

export default function DebatePractice() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (messagesToSend: Message[], requestFeedback = false) => {
    setIsLoading(true);
    let assistantContent = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: messagesToSend, requestFeedback }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        if (resp.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment.");
        } else if (resp.status === 402) {
          toast.error("Credits required. Please add funds to continue.");
        } else {
          toast.error(errorData.error || "Failed to get response");
        }
        setIsLoading(false);
        return;
      }

      if (!resp.body) {
        throw new Error("No response body");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      // Add empty assistant message to update
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Process remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return newMessages;
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      console.error("Stream error:", error);
      toast.error("Failed to connect to debate partner");
      // Remove empty assistant message on error
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setHasStarted(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await streamChat(newMessages);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGetFeedback = async () => {
    if (messages.length < 2 || isLoading) return;
    
    const feedbackRequest: Message = { 
      role: "user", 
      content: "Please give me feedback on how I've done in this debate so far." 
    };
    const newMessages = [...messages, feedbackRequest];
    setMessages(newMessages);
    
    await streamChat(newMessages, true);
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
    setHasStarted(false);
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  return (
    <MainLayout withPadding={false}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={cn(
          "border-b border-border bg-card/50 backdrop-blur-sm",
          isMobile ? "px-3 py-3" : "px-6 py-4"
        )}>
          <div className="flex items-center justify-between max-w-3xl mx-auto w-full">
            <div>
              <h1 className="font-serif text-lg font-medium text-foreground">
                Debate Practice
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sharpen your arguments against an AI opponent
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasStarted && messages.length >= 4 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGetFeedback}
                  disabled={isLoading}
                  className="text-xs"
                >
                  <Trophy className="h-3.5 w-3.5 mr-1.5" />
                  Feedback
                </Button>
              )}
              {hasStarted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollRef}>
            <div className={cn(
              "max-w-3xl mx-auto",
              isMobile ? "px-3 py-4" : "px-6 py-6"
            )}>
              {!hasStarted ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">🥊</span>
                  </div>
                  <h2 className="font-serif text-xl font-medium text-foreground mb-2">
                    Ready to spar?
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Make a claim below and I'll argue against it. 
                    This is a casual practice space — speak your mind!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-lg px-4 py-2.5",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        <p className="text-sm font-body whitespace-pre-wrap">
                          {message.content}
                          {message.role === "assistant" && isLoading && index === messages.length - 1 && !message.content && (
                            <span className="inline-flex items-center">
                              <Loader2 className="h-3 w-3 animate-spin" />
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input area */}
        <div className={cn(
          "border-t border-border bg-background",
          isMobile ? "px-3 py-3 pb-safe" : "px-6 py-4"
        )}>
          <div className="max-w-3xl mx-auto flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder={hasStarted ? "Your counter-argument..." : "Make your claim..."}
              className={cn(
                "flex-1 resize-none min-h-[44px] max-h-[120px] font-body text-sm",
                "border-border/60 focus:border-primary"
              )}
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-11 w-11 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
