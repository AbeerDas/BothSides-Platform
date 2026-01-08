import { useState, useRef, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Send, RotateCcw, Trophy, Loader2, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FeedbackModal } from "@/components/FeedbackModal";
import { PracticeHistorySheet } from "@/components/PracticeHistorySheet";
import { MarkdownContent } from "@/components/MarkdownContent";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FeedbackData {
  overallScore: number;
  categories: {
    name: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
  strengths: string[];
  improvements: string[];
  tips: string[];
  summary: string;
}

interface PracticeDebate {
  id: string;
  title: string;
  messages: Message[];
  latest_score: number | null;
  created_at: string;
  updated_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/debate-chat`;
const FEEDBACK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-feedback`;

const SAMPLE_CLAIMS = [
  "Social media has done more harm than good to society.",
  "Remote work is better than office work for productivity.",
  "AI will create more jobs than it destroys.",
  "Climate change is the most pressing issue of our time.",
  "Universal basic income should be implemented globally.",
  "Space exploration is a waste of resources.",
  "Electric vehicles are not as environmentally friendly as people think.",
  "Traditional education is becoming obsolete.",
];

export default function DebatePractice() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [debates, setDebates] = useState<PracticeDebate[]>([]);
  const [currentDebateId, setCurrentDebateId] = useState<string | null>(null);
  const [debatesLoading, setDebatesLoading] = useState(false);
  const [editingFromIndex, setEditingFromIndex] = useState<number | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // Check auth status
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadDebates();
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadDebates();
      } else {
        setDebates([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadDebates = async () => {
    setDebatesLoading(true);
    try {
      const { data, error } = await supabase
        .from("practice_debates")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure proper typing
      const transformedData: PracticeDebate[] = (data || []).map(debate => ({
        ...debate,
        messages: (debate.messages as unknown as Message[]) || [],
      }));
      
      setDebates(transformedData);
    } catch (error) {
      console.error("Failed to load debates:", error);
    } finally {
      setDebatesLoading(false);
    }
  };

  const saveDebate = useCallback(async (newMessages: Message[], score?: number) => {
    if (!user || newMessages.length < 2) return;

    const title = newMessages[0]?.content.slice(0, 50) + (newMessages[0]?.content.length > 50 ? "..." : "");
    
    try {
      if (currentDebateId) {
        await supabase
          .from("practice_debates")
          .update({ 
            messages: newMessages as unknown as any,
            latest_score: score ?? undefined,
            title 
          })
          .eq("id", currentDebateId);
      } else {
        const { data, error } = await supabase
          .from("practice_debates")
          .insert({
            user_id: user.id,
            messages: newMessages as unknown as any,
            latest_score: score ?? null,
            title,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setCurrentDebateId(data.id);
        }
      }
      loadDebates();
    } catch (error) {
      console.error("Failed to save debate:", error);
    }
  }, [user, currentDebateId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (messagesToSend: Message[]) => {
    setIsLoading(true);
    let assistantContent = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: messagesToSend }),
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

      // Save after streaming completes
      const finalMessages = [...messagesToSend, { role: "assistant" as const, content: assistantContent }];
      saveDebate(finalMessages);
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
    
    let newMessages: Message[];
    if (editingFromIndex !== null) {
      // Truncate messages and continue from edit point
      newMessages = [...messages.slice(0, editingFromIndex), userMessage];
      setEditingFromIndex(null);
    } else {
      newMessages = [...messages, userMessage];
    }
    
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
    
    setFeedbackLoading(true);
    setFeedbackOpen(true);
    
    try {
      const resp = await fetch(FEEDBACK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages }),
      });

      if (!resp.ok) {
        throw new Error("Failed to get feedback");
      }

      const data = await resp.json();
      setFeedbackData(data);
      
      // Save score to database
      if (user && data.overallScore) {
        saveDebate(messages, data.overallScore);
      }
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to generate feedback");
      setFeedbackOpen(false);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
    setHasStarted(false);
    setCurrentDebateId(null);
    setFeedbackData(null);
    setEditingFromIndex(null);
  };

  const handleSelectDebate = (debate: PracticeDebate) => {
    setMessages(debate.messages);
    setCurrentDebateId(debate.id);
    setHasStarted(true);
    setFeedbackData(null);
    setEditingFromIndex(null);
  };

  const handleDeleteDebate = async (id: string) => {
    try {
      await supabase.from("practice_debates").delete().eq("id", id);
      if (currentDebateId === id) {
        handleReset();
      }
      loadDebates();
      toast.success("Debate deleted");
    } catch (error) {
      console.error("Failed to delete debate:", error);
      toast.error("Failed to delete debate");
    }
  };

  const handleEditFromMessage = (index: number) => {
    const message = messages[index];
    if (message.role === "user") {
      setInput(message.content);
      setEditingFromIndex(index);
      textareaRef.current?.focus();
      toast.info("Edit your message. Messages after this point will be replaced.");
    }
  };

  const handleClearInput = () => {
    setInput("");
    setEditingFromIndex(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleSampleClaim = () => {
    const randomClaim = SAMPLE_CLAIMS[Math.floor(Math.random() * SAMPLE_CLAIMS.length)];
    setInput(randomClaim);
    adjustTextareaHeight();
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
            <div className="flex items-center gap-3">
              {user && (
                <PracticeHistorySheet
                  debates={debates}
                  currentDebateId={currentDebateId}
                  onSelectDebate={handleSelectDebate}
                  onDeleteDebate={handleDeleteDebate}
                  onNewDebate={handleReset}
                  isLoading={debatesLoading}
                />
              )}
              <div>
                <h1 className="font-serif text-lg font-medium text-foreground">
                  Debate Practice
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sharpen your arguments against an AI opponent
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasStarted && messages.length >= 4 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGetFeedback}
                  disabled={isLoading || feedbackLoading}
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
                  {!user && (
                    <p className="text-xs text-muted-foreground mt-4 bg-muted/50 px-3 py-2 rounded-lg">
                      Sign in to save your debates and track progress
                    </p>
                  )}
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <motion.div
                        key={`${index}-${message.content.slice(0, 20)}`}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ 
                          duration: 0.2,
                          ease: "easeOut"
                        }}
                        className={cn(
                          "flex",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-lg px-4 py-2.5 group relative",
                            message.role === "user"
                              ? "bg-primary text-white"
                              : "bg-muted text-foreground"
                          )}
                        >
                          {message.role === "user" ? (
                            <p className="text-sm font-body whitespace-pre-wrap text-white">
                              {message.content}
                            </p>
                          ) : (
                            <MarkdownContent content={message.content} />
                          )}
                          {message.role === "assistant" && isLoading && index === messages.length - 1 && !message.content && (
                            <span className="inline-flex items-center">
                              <Loader2 className="h-3 w-3 animate-spin" />
                            </span>
                          )}
                          {/* Edit button for user messages */}
                          {message.role === "user" && !isLoading && (
                            <button
                              onClick={() => handleEditFromMessage(index)}
                              className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                              title="Edit from here"
                            >
                              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input area */}
        <div className={cn(
          "border-t border-border bg-background",
          isMobile ? "px-3 py-3 pb-safe" : "px-6 py-4"
        )}>
          {editingFromIndex !== null && (
            <div className="max-w-3xl mx-auto mb-2">
              <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-md flex items-center gap-2">
                <span>Editing from message {editingFromIndex + 1}. New messages will replace what comes after.</span>
                <button 
                  onClick={() => setEditingFromIndex(null)} 
                  className="underline hover:no-underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="max-w-3xl mx-auto flex gap-2">
            {/* Clear and Sample buttons */}
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearInput}
                disabled={!input.trim()}
                className="h-[22px] w-11 shrink-0"
                title="Clear input"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSampleClaim}
                disabled={isLoading}
                className="h-[22px] w-11 shrink-0"
                title="Get sample claim"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </Button>
            </div>
            
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

      <FeedbackModal
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        feedbackData={feedbackData}
        isLoading={feedbackLoading}
      />
    </MainLayout>
  );
}