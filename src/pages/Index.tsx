import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DebateView } from "@/components/DebateView";
import { PerspectivePills } from "@/components/PerspectivePills";
import { LoadingScreen } from "@/components/LoadingScreen";
import { NavBar } from "@/components/NavBar";
import { Info, ArrowRight, Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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

interface PublicDebate {
  id: string;
  slug: string;
  statement: string;
  created_at: string;
  user_id: string | null;
  username?: string;
}

const Index = () => {
  const [statement, setStatement] = useState("");
  const [debate, setDebate] = useState<DebateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [perspectives, setPerspectives] = useState<string[]>([]);
  const [addingArgumentSide, setAddingArgumentSide] = useState<"for" | "against" | null>(null);
  const [currentDebateSlug, setCurrentDebateSlug] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [publicDebates, setPublicDebates] = useState<PublicDebate[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    // Load public debates for the landing page
    loadPublicDebates();

    return () => subscription.unsubscribe();
  }, []);

  const loadPublicDebates = async () => {
    try {
      const { data: debates, error } = await supabase
        .from("debates")
        .select("id, slug, statement, created_at, user_id")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      // Fetch usernames for debates with user_ids
      const userIds = debates?.filter(d => d.user_id).map(d => d.user_id) || [];
      const uniqueUserIds = [...new Set(userIds)];

      let usernameMap: Record<string, string> = {};
      if (uniqueUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", uniqueUserIds);

        if (profiles) {
          usernameMap = profiles.reduce((acc, p) => {
            acc[p.id] = p.username || "Anonymous";
            return acc;
          }, {} as Record<string, string>);
        }
      }

      const debatesWithUsernames = debates?.map(d => ({
        ...d,
        username: d.user_id ? usernameMap[d.user_id] || "Anonymous" : "Anonymous"
      })) || [];

      setPublicDebates(debatesWithUsernames);
    } catch (error) {
      console.error("Error loading public debates:", error);
    }
  };

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

      // Save to database
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
      setIsGenerating(false);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Failed to generate debate");
      setIsGenerating(false);
    }
  };

  const handleRefute = async (side: "for" | "against", path: number[]) => {
    if (!debate) return;
    setIsLoading(true);
    try {
      let current: Argument = side === "for" ? debate.argumentsFor[path[0]] : debate.argumentsAgainst[path[0]];
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

      // Save the updated debate to database
      if (currentDebateSlug) {
        const { error: updateError } = await supabase
          .from('debates')
          .update({
            arguments_data: {
              for: newDebate.argumentsFor,
              against: newDebate.argumentsAgainst,
            } as any,
          })
          .eq("slug", currentDebateSlug);

        if (updateError) {
          console.error('Error saving refutation:', updateError);
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Failed to generate refutation");
    } finally {
      setIsLoading(false);
    }
  };

  const resetDebate = () => {
    setDebate(null);
    setStatement("");
    setPerspectives([]);
    setIsGenerating(false);
    setCurrentDebateSlug(null);
  };

  if (isGenerating) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="space-y-16">
          {!debate && (
            <>
              {/* Hero Section with Greek Theme */}
              <div className="text-center space-y-8 pb-8 animate-fade-in">
                <div className="relative inline-block">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-greek-gold/30 text-4xl">
                    ⟡
                  </div>
                  <Scale className="h-16 w-16 mx-auto text-greek-gold animate-float" strokeWidth={1.5} />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-greek-gold/30 text-2xl">
                    ☽ ◇ ☾
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                    The Art of Dialectic
                  </h1>
                  <p className="font-body text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Explore both sides of any argument through the ancient tradition of philosophical discourse
                  </p>
                </div>

                {/* Decorative divider */}
                <div className="flex items-center justify-center gap-3 text-greek-gold/40">
                  <div className="h-px w-20 bg-gradient-to-r from-transparent to-greek-gold/40" />
                  <span className="text-lg">⟢</span>
                  <span className="text-sm font-serif italic text-muted-foreground">Know Thyself</span>
                  <span className="text-lg">⟣</span>
                  <div className="h-px w-20 bg-gradient-to-l from-transparent to-greek-gold/40" />
                </div>
              </div>

              {/* Input Card */}
              <div className="space-y-6 animate-fade-in">
                <Card className="p-6 md:p-8 bg-card border border-border shadow-elegant pillar-shadow">
                  <div className="space-y-4">
                    <h3 className="text-lg font-serif font-semibold text-foreground tracking-wide flex items-center gap-2">
                      <span className="text-greek-gold">⟢</span>
                      What's Your Take?
                    </h3>
                    <p className="text-sm font-body text-muted-foreground">
                      State any opinion or claim you'd like to explore from multiple angles
                    </p>
                    <Textarea 
                      value={statement} 
                      onChange={e => setStatement(e.target.value)} 
                      placeholder="Universal Basic Income should be mandatory, Michael Jordan > Lebron, Stoicism is the best philosophy for modern life..." 
                      className="min-h-[120px] font-body text-base resize-none bg-background border-border focus:border-greek-gold/50" 
                    />
                  </div>

                  <div className="mt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-2 flex-wrap flex-1">
                        <label className="text-sm font-serif font-semibold text-foreground tracking-wide whitespace-nowrap">
                          Perspective
                        </label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-card border-border">
                              <p>Add specific viewpoints (like "Economist" or "Philosopher") to generate arguments from those perspectives.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <PerspectivePills perspectives={perspectives} onChange={setPerspectives} />
                      </div>
                      
                      <Button 
                        onClick={generateInitialArguments} 
                        disabled={!statement.trim()} 
                        className="font-sans text-sm uppercase tracking-wider bg-sky-700 hover:bg-sky-800 text-white md:min-w-[180px] shadow-elegant" 
                        size="lg"
                      >
                        Generate
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Public Debates Section */}
              {publicDebates.length > 0 && (
                <div className="space-y-6 animate-fade-in pt-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                        <span className="text-greek-gold">⟣</span>
                        Recent Debates in the Agora
                      </h2>
                      <p className="font-body text-sm text-muted-foreground">
                        Explore discussions from the community
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/public")}
                      className="font-sans text-xs uppercase tracking-wider hover:bg-accent"
                    >
                      View All
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {publicDebates.map((debate) => (
                      <Card 
                        key={debate.id}
                        className="p-5 bg-card border border-border hover:shadow-panel transition-all duration-300 cursor-pointer group"
                        onClick={() => navigate(`/debate/${debate.slug}`)}
                      >
                        <div className="space-y-3">
                          <h3 className="font-serif font-semibold text-foreground line-clamp-2 group-hover:text-greek-gold transition-colors">
                            {debate.statement}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-muted-foreground font-body">
                            <span>{debate.username}</span>
                            <span>{formatDistanceToNow(new Date(debate.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Philosophy Quote Footer */}
              <div className="text-center pt-8 border-t border-border/50">
                <p className="font-body text-sm text-muted-foreground/70 italic">
                  "It is the mark of an educated mind to be able to entertain a thought without accepting it." — Aristotle
                </p>
              </div>
            </>
          )}

          {debate && (
            <div className="animate-fade-in">
              <DebateView 
                debate={debate} 
                onRefute={handleRefute} 
                onReset={resetDebate} 
                onAddArgument={async (side: "for" | "against") => {
                  setAddingArgumentSide(side);
                  try {
                    const { data, error } = await supabase.functions.invoke('generate-arguments', {
                      body: {
                        statement: debate.statement,
                        type: 'add-argument',
                        side,
                        existingArguments: side === 'for' ? debate.argumentsFor : debate.argumentsAgainst
                      }
                    });
                    if (error) throw error;
                    const newArgument = data;
                    const updatedDebate = {
                      ...debate,
                      ...(side === 'for' 
                        ? { argumentsFor: [...debate.argumentsFor, newArgument] } 
                        : { argumentsAgainst: [...debate.argumentsAgainst, newArgument] }
                      )
                    };
                    setDebate(updatedDebate);

                    // Save to database
                    if (currentDebateSlug) {
                      await supabase
                        .from('debates')
                        .update({
                          arguments_data: {
                            for: updatedDebate.argumentsFor,
                            against: updatedDebate.argumentsAgainst,
                          } as any,
                        })
                        .eq("slug", currentDebateSlug);
                    }
                  } catch (error: any) {
                    console.error('Error:', error);
                    toast.error("Failed to add argument");
                  } finally {
                    setAddingArgumentSide(null);
                  }
                }} 
                addingArgumentSide={addingArgumentSide} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
