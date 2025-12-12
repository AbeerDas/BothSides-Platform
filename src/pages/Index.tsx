import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DebateView } from "@/components/DebateView";
import { PerspectivePills } from "@/components/PerspectivePills";
import { SkeletonDebateView } from "@/components/SkeletonDebate";
import { MainLayout } from "@/components/MainLayout";
import { MobileInput } from "@/components/MobileInput";
import { ArrowRight, Scale, Dices, X } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
interface Source {
  title: string;
  url: string;
}
interface Argument {
  title?: string;
  subheading?: string;
  text: string;
  sources: Source[];
  refutations?: Argument[];
}
interface DebateData {
  statement: string;
  summary: string;
  argumentsFor: Argument[];
  argumentsAgainst: Argument[];
}
const RANDOM_TOPICS = ["Remote work is more productive than office work", "Social media does more harm than good", "Universal basic income should be implemented", "AI will create more jobs than it destroys", "College education is overrated", "LeBron James is better than Michael Jordan", "Cryptocurrency will replace traditional currency", "Space exploration is worth the investment", "Veganism is the most ethical diet choice", "Nuclear energy is the solution to climate change"];
const Index = () => {
  const [statement, setStatement] = useState("");
  const [debate, setDebate] = useState<DebateData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [perspectives, setPerspectives] = useState<string[]>([]);
  const [addingArgumentSide, setAddingArgumentSide] = useState<"for" | "against" | null>(null);
  const [currentDebateSlug, setCurrentDebateSlug] = useState<string | null>(null);
  const [currentDebateId, setCurrentDebateId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Determine what view to show (but don't return early before all hooks)
  const showMobileHome = isMobile && !debate && !isGenerating;
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const generateInitialArguments = async () => {
    if (!statement.trim()) return;
    setIsGenerating(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-arguments', {
        body: {
          statement,
          type: 'initial',
          perspectives: perspectives.length > 0 ? perspectives : undefined
        }
      });
      if (error) throw error;
      const debateData = {
        statement,
        summary: data.summary,
        argumentsFor: data.arguments.for,
        argumentsAgainst: data.arguments.against
      };
      setDebate(debateData);
      const slug = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Generate tags
      let tags: string[] = [];
      try {
        const {
          data: tagData
        } = await supabase.functions.invoke('generate-tags', {
          body: {
            statement,
            summary: data.summary
          }
        });
        if (tagData?.tags) {
          tags = tagData.tags;
        }
      } catch (tagError) {
        console.error('Error generating tags:', tagError);
      }
      const {
        data: insertedData,
        error: saveError
      } = await supabase.from('debates').insert({
        slug,
        statement,
        summary: data.summary,
        arguments_data: {
          for: data.arguments.for,
          against: data.arguments.against
        },
        user_id: user?.id || null,
        tags
      }).select('id').single();
      if (saveError) {
        console.error('Error saving debate:', saveError);
        toast.error("Debate generated but couldn't save to history");
      } else {
        setCurrentDebateSlug(slug);
        setCurrentDebateId(insertedData?.id || null);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Failed to generate debate");
    } finally {
      setIsGenerating(false);
    }
  };
  const handleRefute = async (side: "for" | "against", path: number[]) => {
    if (!debate) return;
    try {
      let current: Argument = side === "for" ? debate.argumentsFor[path[0]] : debate.argumentsAgainst[path[0]];
      for (let i = 1; i < path.length; i++) {
        current = current.refutations![path[i]];
      }
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-arguments', {
        body: {
          statement: debate.statement,
          type: 'refute',
          parentArgument: current.text,
          targetSide: side === "for" ? "against" : "for"
        }
      });
      if (error) throw error;
      const newDebate = JSON.parse(JSON.stringify(debate));
      let target: Argument = side === "for" ? newDebate.argumentsFor[path[0]] : newDebate.argumentsAgainst[path[0]];
      for (let i = 1; i < path.length; i++) {
        target = target.refutations![path[i]];
      }
      if (!target.refutations) {
        target.refutations = [];
      }
      target.refutations.push({
        title: data.title,
        subheading: data.subheading,
        text: data.text,
        sources: data.sources,
        refutations: []
      });
      setDebate(newDebate);
      if (currentDebateSlug) {
        await supabase.from('debates').update({
          arguments_data: {
            for: newDebate.argumentsFor,
            against: newDebate.argumentsAgainst
          } as any
        }).eq("slug", currentDebateSlug);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Failed to generate refutation");
    }
  };
  const resetDebate = () => {
    setDebate(null);
    setStatement("");
    setPerspectives([]);
    setCurrentDebateSlug(null);
    setCurrentDebateId(null);
    navigate("/");
  };
  const handleRandomTopic = () => {
    const topic = RANDOM_TOPICS[Math.floor(Math.random() * RANDOM_TOPICS.length)];
    setStatement(topic);
  };
  const handleAddArgument = async (side: "for" | "against") => {
    if (!debate) return;
    setAddingArgumentSide(side);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-arguments', {
        body: {
          statement: debate.statement,
          type: 'add-argument',
          side,
          existingArguments: side === 'for' ? debate.argumentsFor : debate.argumentsAgainst
        }
      });
      if (error) throw error;
      const updatedDebate = {
        ...debate,
        ...(side === 'for' ? {
          argumentsFor: [...debate.argumentsFor, data]
        } : {
          argumentsAgainst: [...debate.argumentsAgainst, data]
        })
      };
      setDebate(updatedDebate);
      if (currentDebateSlug) {
        await supabase.from('debates').update({
          arguments_data: {
            for: updatedDebate.argumentsFor,
            against: updatedDebate.argumentsAgainst
          } as any
        }).eq("slug", currentDebateSlug);
      }
    } catch (error: any) {
      toast.error("Failed to add argument");
    } finally {
      setAddingArgumentSide(null);
    }
  };

  return (
    <MainLayout withPadding={showMobileHome ? false : true}>
      {showMobileHome ? (
        // Mobile home view
        <>
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <Scale className="h-12 w-12 text-greek-gold mb-6" strokeWidth={1.5} />
            <h1 className="font-serif text-2xl font-medium text-foreground text-center">
              What's Your Take?
            </h1>
          </div>
          
          <MobileInput 
            statement={statement} 
            setStatement={setStatement} 
            perspectives={perspectives} 
            setPerspectives={setPerspectives} 
            onGenerate={generateInitialArguments} 
            isGenerating={isGenerating} 
          />
        </>
      ) : (
        // Desktop view
        <div className={cn("max-w-5xl mx-auto space-y-8 flex-1 flex flex-col", isMobile && "pb-24")}>
          {!debate && !isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-3 mb-8 animate-fade-in">
                <Scale className="h-10 w-10 mx-auto text-greek-gold animate-float" strokeWidth={1.5} />
                <h1 className="font-serif text-2xl md:text-3xl font-medium text-foreground">
                  Explore All Sides of an Argument
                </h1>
              </div>

              {/* Perplexity-style unified input - the input IS the container */}
              <div className="w-full max-w-2xl mx-auto">
                <div className="relative border border-border/60 bg-card shadow-xl transition-all duration-200">
                  {/* Perspective pills inside the input area */}
                  {perspectives.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 pb-0 animate-in fade-in duration-300">
                      {perspectives.map(perspective => (
                        <div key={perspective} className="inline-flex items-center gap-2 px-3 py-1 bg-secondary text-foreground text-xs font-sans border border-border">
                          <span>{perspective}</span>
                          <button onClick={() => setPerspectives(perspectives.filter(p => p !== perspective))} className="hover:text-destructive transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Textarea 
                    value={statement} 
                    onChange={e => setStatement(e.target.value)} 
                    placeholder="LeBron is better than Michael Jordan..." 
                    className="min-h-[100px] font-body text-base resize-none border-0 bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4" 
                  />

                  {/* Bottom toolbar - seamlessly integrated */}
                  <div className="flex items-center justify-between px-4 pb-4 pt-2">
                    <div className="flex items-center gap-40">
                      <Button variant="ghost" size="sm" onClick={handleRandomTopic} className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 h-9">
                        <Dices className="h-4 w-4" />
                        <span className="hidden sm:inline text-xs">Random</span>
                      </Button>
                      <PerspectivePills perspectives={perspectives} onChange={setPerspectives} />
                    </div>
                    
                    <Button onClick={generateInitialArguments} disabled={!statement.trim()} size="sm" className="font-sans text-xs uppercase tracking-wider text-white font-medium bg-amber-800 hover:bg-amber-700 h-9 px-4">
                      Generate <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isGenerating && <SkeletonDebateView />}

          {debate && !isGenerating && (
            <DebateView 
              debate={debate} 
              onRefute={handleRefute} 
              onReset={resetDebate} 
              onAddArgument={handleAddArgument} 
              addingArgumentSide={addingArgumentSide} 
              debateId={currentDebateId || undefined} 
            />
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default Index;