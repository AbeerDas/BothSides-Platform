import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DebateView } from "@/components/DebateView";
import { PerspectivePills } from "@/components/PerspectivePills";
import { SkeletonDebateView } from "@/components/SkeletonDebate";
import { MainLayout } from "@/components/MainLayout";
import { MobileInput } from "@/components/MobileInput";
import { StatementDiscoveryModal } from "@/components/StatementDiscoveryModal";
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
const RANDOM_TOPICS = [
  // Original topics
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
  // Technology & AI
  "Self-driving cars will make roads safer",
  "Social media should be banned for children under 16",
  "AI-generated art is real art",
  "Technology is making us less intelligent",
  "Smartphones should be banned in schools",
  "Algorithms should be regulated by governments",
  "Virtual reality will replace physical travel",
  "Open source software is superior to proprietary software",
  "The internet has done more harm than good",
  "Automation will lead to mass unemployment",
  // Society & Culture
  "Cancel culture is harmful to free speech",
  "Billionaires should not exist",
  "Marriage is an outdated institution",
  "Reality TV has a negative impact on society",
  "Social movements are more effective online",
  "Traditional media is dying",
  "Minimalism leads to a happier life",
  "Celebrity culture is harmful to young people",
  "Video games are a legitimate art form",
  "Fast fashion should be banned",
  // Politics & Government
  "Democracy is the best form of government",
  "Voting should be mandatory",
  "The death penalty should be abolished",
  "Capitalism is failing the middle class",
  "Immigration benefits the economy",
  "Political parties do more harm than good",
  "Lobbying should be illegal",
  "Term limits should apply to all elected officials",
  "The electoral college is outdated",
  "Freedom of speech has too many limits",
  // Environment & Sustainability
  "Electric cars are not as green as advertised",
  "Meat consumption should be taxed",
  "Climate activism is effective",
  "Plastic should be banned entirely",
  "Geoengineering is a viable climate solution",
  "Organic food is worth the extra cost",
  "Conservation requires economic sacrifice",
  "Renewable energy can fully replace fossil fuels",
  "Degrowth is necessary for sustainability",
  "Carbon offsets are greenwashing",
  // Economics & Business
  "The gig economy exploits workers",
  "Remote work reduces productivity",
  "A 4-day workweek should be standard",
  "Tipping culture should be eliminated",
  "CEOs are overpaid",
  "Monopolies are inevitable in capitalism",
  "Unions are still necessary in modern economies",
  "Free trade benefits all countries equally",
  "Wealth taxes are effective",
  "Inflation is primarily caused by government spending",
  // Education
  "Standardized testing accurately measures intelligence",
  "Student loan debt should be forgiven",
  "Homeschooling produces better outcomes than public schools",
  "University degrees are overvalued",
  "STEM education is prioritized too much",
  "Arts education is underfunded",
  "Learning coding should be mandatory in schools",
  "Grade inflation is a serious problem",
  "Gap years benefit students",
  "Competition in schools is harmful",
  // Health & Medicine
  "Healthcare should be free for everyone",
  "Alternative medicine has legitimate benefits",
  "Mental health is overmedicalized",
  "Pharmaceutical companies prioritize profits over patients",
  "Preventive care should be emphasized more",
  "The BMI is a useful health metric",
  "Fitness tracking devices improve health outcomes",
  "Intermittent fasting is beneficial for most people",
  "Vaccine mandates are justified",
  "Telemedicine is as effective as in-person care",
  // Philosophy & Ethics
  "Free will is an illusion",
  "Morality is subjective",
  "Humans are inherently good",
  "The trolley problem has a clear answer",
  "Utilitarianism is the best ethical framework",
  "Privacy is more important than security",
  "Zoos are unethical",
  "Ethical consumption under capitalism is possible",
  "Cultural relativism is valid",
  "Lying is sometimes morally required",
  // Sports & Entertainment
  "College athletes should be paid",
  "eSports are real sports",
  "The Olympics are worth the investment",
  "Sports betting should be legal everywhere",
  "Streaming has improved the music industry",
  "Superhero movies have ruined cinema",
  "Talent shows exploit contestants",
  "Live performances are superior to recordings",
  "Sports dynasties are good for their leagues",
  "Performance-enhancing drugs should be allowed in sports",
  // Science & Research
  "Animal testing is necessary for medical progress",
  "CRISPR gene editing should be used on humans",
  "Space colonization is humanity's future",
  "Scientific research is politically biased",
  "Peer review is effective at catching errors",
  "Funding for pure research should increase",
  "Science communication has improved in the social media age",
  "Reproducibility crisis threatens scientific credibility",
  "Private space companies are beneficial for exploration",
  "The scientific method is the only valid way to acquire knowledge"
];
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
  const location = useLocation();
  const isMobile = useIsMobile();

  // Statement discovery modal state
  const [discoveryModalOpen, setDiscoveryModalOpen] = useState(false);
  const [discoveredStatements, setDiscoveredStatements] = useState<{statement: string; context?: string}[]>([]);
  const [isAnalyzingText, setIsAnalyzingText] = useState(false);

  // Determine what view to show (but don't return early before all hooks)
  const showMobileHome = isMobile && !debate && !isGenerating;

  // Check for prefilled statement from navigation (e.g., from News page)
  useEffect(() => {
    if (location.state?.prefillStatement) {
      setStatement(location.state.prefillStatement);
      // Clear the state to avoid re-triggering
      navigate('/', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

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
  const detectIntentAndGenerate = async () => {
    if (!statement.trim()) return;

    // Simple heuristics for intent detection
    const wordCount = statement.trim().split(/\s+/).length;
    const sentenceCount = statement.split(/[.!?]+/).filter((s: string) => s.trim()).length;
    const hasMultipleParagraphs = statement.includes("\n\n") || statement.includes("\r\n\r\n");
    
    // If short (under 40 words), few sentences, no paragraphs -> treat as statement
    const isStatement = wordCount < 40 && sentenceCount <= 3 && !hasMultipleParagraphs;

    if (isStatement) {
      // Direct debate generation
      generateInitialArguments();
    } else {
      // Longer text - extract debatable statements
      setIsAnalyzingText(true);
      setDiscoveryModalOpen(true);
      setDiscoveredStatements([]);

      try {
        const { data, error } = await supabase.functions.invoke('analyze-text', {
          body: { text: statement, type: 'extract-statements' }
        });

        if (error) throw error;

        if (data.statements) {
          setDiscoveredStatements(data.statements);
        }
      } catch (error: any) {
        console.error('Error analyzing text:', error);
        toast.error("Failed to analyze text. Generating debate directly.");
        setDiscoveryModalOpen(false);
        generateInitialArguments();
      } finally {
        setIsAnalyzingText(false);
      }
    }
  };

  const handleSelectDiscoveredStatement = (selectedStatement: string) => {
    setStatement(selectedStatement);
    setDiscoveryModalOpen(false);
    // Trigger generation with the selected statement
    setTimeout(() => {
      generateWithStatement(selectedStatement);
    }, 100);
  };

  const generateInitialArguments = async () => {
    generateWithStatement(statement);
  };

  const generateWithStatement = async (statementToUse: string) => {
    if (!statementToUse.trim()) return;
    setIsGenerating(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-arguments', {
        body: {
          statement: statementToUse,
          type: 'initial',
          perspectives: perspectives.length > 0 ? perspectives : undefined
        }
      });
      if (error) throw error;
      const debateData = {
        statement: statementToUse,
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
            statement: statementToUse,
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
        statement: statementToUse,
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
  return <MainLayout withPadding={showMobileHome ? false : true}>
      {showMobileHome ?
    // Mobile home view
    <>
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <Scale className="h-12 w-12 text-greek-gold mb-6" strokeWidth={1.5} />
            <h1 className="font-serif text-2xl font-medium text-foreground text-center">
              What's Your Take?
            </h1>
          </div>
          
          <MobileInput statement={statement} setStatement={setStatement} perspectives={perspectives} setPerspectives={setPerspectives} onGenerate={detectIntentAndGenerate} isGenerating={isGenerating} />
        </> :
    // Desktop view
    <div className={cn("max-w-5xl mx-auto space-y-8 flex-1 flex flex-col", isMobile && "pb-24")}>
          {!debate && !isGenerating && <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
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
                  {perspectives.length > 0 && <div className="flex flex-wrap gap-2 p-4 pb-0 animate-in fade-in duration-300">
                      {perspectives.map(perspective => <div key={perspective} className="inline-flex items-center gap-2 px-3 py-1 bg-secondary text-foreground text-xs font-sans border border-border">
                          <span>{perspective}</span>
                          <button onClick={() => setPerspectives(perspectives.filter(p => p !== perspective))} className="hover:text-destructive transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </div>)}
                    </div>}

                  <Textarea value={statement} onChange={e => setStatement(e.target.value)} placeholder="LeBron is better than Michael Jordan..." className="min-h-[100px] font-body text-base resize-none border-0 bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4" />

                  {/* Bottom toolbar - seamlessly integrated */}
                  <div className="flex items-center justify-between px-4 pb-4 pt-2">
                    <div className="flex items-center gap-40">
                      <Button variant="ghost" size="sm" onClick={handleRandomTopic} className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 h-9">
                        <Dices className="h-4 w-4" />
                        <span className="hidden sm:inline text-xs">Random</span>
                      </Button>
                      <PerspectivePills perspectives={perspectives} onChange={setPerspectives} className="mr-3" />
                    </div>
                    
                    <Button onClick={detectIntentAndGenerate} disabled={!statement.trim()} size="sm" className="font-sans text-xs uppercase tracking-wider text-white font-medium bg-amber-800 hover:bg-amber-700 h-9 px-4">
                      Generate <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>}

          {isGenerating && <SkeletonDebateView />}

          {debate && !isGenerating && <DebateView debate={debate} onRefute={handleRefute} onReset={resetDebate} onAddArgument={handleAddArgument} addingArgumentSide={addingArgumentSide} debateId={currentDebateId || undefined} />}
        </div>}

      {/* Statement Discovery Modal */}
      <StatementDiscoveryModal
        open={discoveryModalOpen}
        onOpenChange={setDiscoveryModalOpen}
        statements={discoveredStatements}
        isLoading={isAnalyzingText}
        onSelectStatement={handleSelectDiscoveredStatement}
        source="text"
      />
    </MainLayout>;
};
export default Index;