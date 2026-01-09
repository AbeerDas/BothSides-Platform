import { useState, useRef, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Send, RotateCcw, Trophy, Loader2, Wand2, HelpCircle, History } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FeedbackModal } from "@/components/FeedbackModal";
import { PracticeHistorySheet } from "@/components/PracticeHistorySheet";
import { MarkdownContent } from "@/components/MarkdownContent";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
const POLISH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/polish-text`;
const HELP_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-help`;

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
  const [polishLoading, setPolishLoading] = useState(false);
  const [helpLoading, setHelpLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

      const finalMessages = [...messagesToSend, { role: "assistant" as const, content: assistantContent }];
      saveDebate(finalMessages);
    } catch (error) {
      console.error("Stream error:", error);
      toast.error("Failed to connect to debate partner");
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

  const handlePolishText = async () => {
    if (!input.trim() || polishLoading) return;
    
    setPolishLoading(true);
    try {
      const resp = await fetch(POLISH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: input }),
      });

      if (!resp.ok) throw new Error("Failed to polish text");
      
      const data = await resp.json();
      setInput(data.polished);
      adjustTextareaHeight();
      toast.success("Text polished!");
    } catch (error) {
      console.error("Polish error:", error);
      toast.error("Failed to polish text");
    } finally {
      setPolishLoading(false);
    }
  };

  const handleHelpMe = async () => {
    if (helpLoading || !hasStarted) return;
    
    setHelpLoading(true);
    try {
      const resp = await fetch(HELP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages }),
      });

      if (!resp.ok) throw new Error("Failed to generate help");
      
      const data = await resp.json();
      setInput(data.suggestion);
      adjustTextareaHeight();
      toast.success("Here's a suggested response!");
    } catch (error) {
      console.error("Help error:", error);
      toast.error("Failed to generate suggestion");
    } finally {
      setHelpLoading(false);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = newHeight + "px";
      // Keep textarea in view
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  };

  return (
    <MainLayout withPadding={false}>
      <TooltipProvider>
        <div className="flex flex-col h-full">
          {/* Sticky Header */}
          <div className={cn(
            "border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-10",
            isMobile ? "px-3 py-2" : "px-6 py-4"
          )}>
            <div className="flex items-center justify-between max-w-3xl mx-auto w-full">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                {user && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <PracticeHistorySheet
                          debates={debates}
                          currentDebateId={currentDebateId}
                          onSelectDebate={handleSelectDebate}
                          onDeleteDebate={handleDeleteDebate}
                          onNewDebate={handleReset}
                          isLoading={debatesLoading}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>View your saved practice debates</TooltipContent>
                  </Tooltip>
                )}
                {!isMobile && (
                  <div className="min-w-0">
                    <h1 className="font-serif text-lg font-medium text-foreground truncate">
                      Debate Practice
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      Sharpen your arguments against an AI opponent
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                {hasStarted && messages.length >= 4 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size={isMobile ? "icon" : "sm"}
                        onClick={handleGetFeedback}
                        disabled={isLoading || feedbackLoading}
                        className={cn(isMobile ? "h-9 w-9" : "text-xs")}
                      >
                        <Trophy className={cn("h-4 w-4", !isMobile && "mr-1.5")} />
                        {!isMobile && "See how you're doing"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Get detailed feedback on your debate performance</TooltipContent>
                  </Tooltip>
                )}
                {hasStarted && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        disabled={isLoading}
                        className="h-9 w-9"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Start a new debate from scratch</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-auto" ref={scrollRef}>
            <div className={cn(
              "max-w-3xl mx-auto",
              isMobile ? "px-3 py-4" : "px-6 py-6"
            )}>
              {!hasStarted ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">🥊</span>
                  </div>
                  <h2 className={cn("font-serif font-medium text-foreground mb-2", isMobile ? "text-xl" : "text-2xl")}>
                    Ready to spar?
                  </h2>
                  <p className={cn("text-muted-foreground max-w-md", isMobile ? "text-sm" : "text-base")}>
                    Make a claim below and I'll argue against it. 
                    This is a casual practice space — speak your mind!
                  </p>
                  {!user && (
                    <p className={cn("text-muted-foreground mt-4 bg-muted/50 px-3 py-2 rounded-lg", isMobile ? "text-xs" : "text-sm")}>
                      Sign in to save your debates and track progress
                    </p>
                  )}
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className={cn("space-y-5", isMobile ? "text-base" : "text-lg")}>
                    {messages.map((message, index) => (
                      <motion.div
                        key={`${index}-${message.content.slice(0, 20)}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className={cn(
                          "flex",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === "user" ? (
                          <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-primary group relative">
                            <p className={cn("font-body whitespace-pre-wrap text-primary-foreground", isMobile ? "text-base" : "text-lg")}>
                              {message.content}
                            </p>
                            {!isLoading && (
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
                        ) : (
                          <div className="max-w-[90%]">
                            <MarkdownContent 
                              content={message.content} 
                              className={cn("text-foreground", isMobile ? "text-base leading-relaxed" : "text-lg leading-relaxed")} 
                            />
                            {isLoading && index === messages.length - 1 && !message.content && (
                              <span className="inline-flex items-center mt-2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              </span>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Sticky Input area */}
          <div 
            ref={inputContainerRef}
            className={cn(
              "border-t border-border bg-background sticky bottom-0 z-10",
              isMobile ? "px-3 py-3 pb-safe" : "px-6 py-4"
            )}
          >
            {editingFromIndex !== null && (
              <div className="max-w-3xl mx-auto mb-2">
                <div className={cn(
                  "text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-md flex items-center gap-2",
                  isMobile ? "text-xs" : "text-sm"
                )}>
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
            <div className="max-w-3xl mx-auto flex gap-2 items-end">
              {/* Help and Polish buttons */}
              <div className="flex flex-col gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleHelpMe}
                      disabled={!hasStarted || helpLoading || isLoading}
                      className="h-[22px] w-11 shrink-0"
                    >
                      {helpLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <HelpCircle className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Generate a suggested counter-argument for you</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePolishText}
                      disabled={!input.trim() || polishLoading}
                      className="h-[22px] w-11 shrink-0"
                    >
                      {polishLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Polish and formalize your text</TooltipContent>
                </Tooltip>
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
                  "flex-1 resize-none min-h-[44px] max-h-[120px] font-body",
                  "border-border/60 focus:border-primary",
                  isMobile ? "text-base" : "text-base"
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
      </TooltipProvider>
    </MainLayout>
  );
}
