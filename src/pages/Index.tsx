import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DebateView } from "@/components/DebateView";
import { PerspectivePills } from "@/components/PerspectivePills";
import { SkeletonDebateView } from "@/components/SkeletonDebate";
import { MainLayout } from "@/components/MainLayout";
import { ArrowRight, Scale, Dices } from "lucide-react";
import { toast } from "sonner";

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

const RANDOM_TOPICS = [
  "Remote work is more productive than office work",
  "Social media does more harm than good",
  "Universal basic income should be implemented",
  "AI will create more jobs than it destroys",
  "College education is overrated",
  "LeBron James is better than Michael Jordan",
  "Cryptocurrency will replace traditional currency",
  "Space exploration is worth the investment",
  "Veganism is the most ethical diet choice",
  "Nuclear energy is the solution to climate change",
  "Standardized testing should be abolished",
  "Violent video games cause real-world violence",
  "Social media influencers have too much power",
  "Cancel culture has gone too far",
  "The metaverse will transform how we live",
  "4-day work weeks should become standard",
  "Billionaires should not exist",
  "Privacy is dead in the digital age",
  "Genetic engineering should be used on humans",
  "Automation will lead to mass unemployment",
  "The Olympics should be held in one permanent location",
  "Zoos are cruel and should be banned",
  "Homework does more harm than good",
  "The death penalty should be abolished",
  "Minimum wage should be $20/hour",
  "Fast fashion should be banned",
  "Voting should be mandatory",
  "Plastic surgery should have age restrictions",
  "Self-driving cars will never be safe",
  "Traditional marriage is outdated",
  "Cursive handwriting should still be taught",
  "Celebrities should stay out of politics",
  "NFTs are worthless",
  "Countries should have open borders",
  "Philosophy should be taught in elementary school",
  "Professional athletes are overpaid",
  "True altruism doesn't exist",
  "Beauty standards are harmful to society",
  "College athletes should be paid",
  "Streaming killed the music industry",
  "Tipping culture should be abolished",
  "Democracy is the best form of government",
  "Free will is an illusion",
  "Aliens definitely exist",
  "Art made by AI isn't real art"
];

const Index = () => {
  const [statement, setStatement] = useState("");
  const [debate, setDebate] = useState<DebateData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [perspectives, setPerspectives] = useState<string[]>([]);
  const [addingArgumentSide, setAddingArgumentSide] = useState<"for" | "against" | null>(null);
  const [currentDebateSlug, setCurrentDebateSlug] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const generateInitialArguments = async () => {
    if (!statement.trim()) return;
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-arguments', {
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
      const { error: saveError } = await supabase.from('debates').insert({
        slug,
        statement,
        summary: data.summary,
        arguments_data: {
          for: data.arguments.for,
          against: data.arguments.against
        },
        user_id: user?.id || null
      });

      if (saveError) {
        console.error('Error saving debate:', saveError);
        toast.error("Debate generated but couldn't save to history");
      } else {
        setCurrentDebateSlug(slug);
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
      let current: Argument = side === "for" 
        ? debate.argumentsFor[path[0]] 
        : debate.argumentsAgainst[path[0]];

      for (let i = 1; i < path.length; i++) {
        current = current.refutations![path[i]];
      }

      const { data, error } = await supabase.functions.invoke('generate-arguments', {
        body: {
          statement: debate.statement,
          type: 'refute',
          parentArgument: current.text,
          targetSide: side === "for" ? "against" : "for"
        }
      });

      if (error) throw error;

      const newDebate = JSON.parse(JSON.stringify(debate));
      let target: Argument = side === "for" 
        ? newDebate.argumentsFor[path[0]] 
        : newDebate.argumentsAgainst[path[0]];

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
        await supabase
          .from('debates')
          .update({
            arguments_data: {
              for: newDebate.argumentsFor,
              against: newDebate.argumentsAgainst
            } as any
          })
          .eq("slug", currentDebateSlug);
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
    navigate("/");
  };

  const handleRandomTopic = () => {
    const topic = RANDOM_TOPICS[Math.floor(Math.random() * RANDOM_TOPICS.length)];
    setStatement(topic);
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {!debate && !isGenerating && (
          <>
            <div className="text-center space-y-3 pt-4 animate-fade-in">
              <Scale className="h-10 w-10 mx-auto text-greek-gold animate-float" strokeWidth={1.5} />
              <h1 className="font-serif text-2xl md:text-3xl font-medium text-foreground">
                Explore All Sides of an Argument
              </h1>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="p-6 md:p-8 bg-card/60 backdrop-blur-md border border-border/30 shadow-xl space-y-4">
                <h3 className="text-base font-serif font-medium text-foreground flex items-center gap-2">
                  <span className="text-greek-gold">⟢</span> What's Your Take?
                </h3>
                <Textarea
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="LeBron is better than Michael Jordan, UBI should be implemented, Social media does more harm than good..."
                  className="min-h-[100px] font-body text-base resize-none bg-background/50"
                />

                {/* Perspective pills display */}
                {perspectives.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
                    {perspectives.map(perspective => (
                      <div 
                        key={perspective} 
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary text-foreground text-xs font-sans border border-border rounded-sm"
                      >
                        <span>{perspective}</span>
                        <button 
                          onClick={() => setPerspectives(perspectives.filter(p => p !== perspective))} 
                          className="hover:text-destructive transition-colors"
                        >
                          <span className="text-xs">×</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <PerspectivePills perspectives={perspectives} onChange={setPerspectives} />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRandomTopic}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Dices className="h-4 w-4" /> Random topic
                    </Button>
                    <Button
                      onClick={generateInitialArguments}
                      disabled={!statement.trim()}
                      size="sm"
                      className="ml-auto font-sans text-xs uppercase tracking-wider text-white font-medium bg-amber-800 hover:bg-amber-700"
                    >
                      Generate <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {isGenerating && <SkeletonDebateView />}

        {debate && !isGenerating && (
          <DebateView
            debate={debate}
            onRefute={handleRefute}
            onReset={resetDebate}
            onAddArgument={async (side) => {
              setAddingArgumentSide(side);
              try {
                const { data, error } = await supabase.functions.invoke('generate-arguments', {
                  body: {
                    statement: debate.statement,
                    type: 'add-argument',
                    side,
                    existingArguments: side === 'for' 
                      ? debate.argumentsFor 
                      : debate.argumentsAgainst
                  }
                });

                if (error) throw error;

                const updatedDebate = {
                  ...debate,
                  ...(side === 'for' 
                    ? { argumentsFor: [...debate.argumentsFor, data] }
                    : { argumentsAgainst: [...debate.argumentsAgainst, data] })
                };

                setDebate(updatedDebate);

                if (currentDebateSlug) {
                  await supabase
                    .from('debates')
                    .update({
                      arguments_data: {
                        for: updatedDebate.argumentsFor,
                        against: updatedDebate.argumentsAgainst
                      } as any
                    })
                    .eq("slug", currentDebateSlug);
                }
              } catch (error: any) {
                toast.error("Failed to add argument");
              } finally {
                setAddingArgumentSide(null);
              }
            }}
            addingArgumentSide={addingArgumentSide}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
