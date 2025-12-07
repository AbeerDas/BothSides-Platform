import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DebateView } from "@/components/DebateView";
import { PerspectivePills } from "@/components/PerspectivePills";
import { LoadingScreen } from "@/components/LoadingScreen";
import { NavBar } from "@/components/NavBar";
import { ArrowRight, Scale, Dices } from "lucide-react";
import { Card } from "@/components/ui/card";
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

const RANDOM_TOPICS = [
  "Remote work is more productive than office work",
  "Social media does more harm than good",
  "Universal basic income should be implemented",
  "AI will create more jobs than it destroys",
  "College education is overrated",
];

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
        body: { statement, type: 'initial', perspectives: perspectives.length > 0 ? perspectives : undefined }
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
        slug, statement, summary: data.summary,
        arguments_data: { for: data.arguments.for, against: data.arguments.against },
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
    setIsLoading(true);
    try {
      let current: Argument = side === "for" ? debate.argumentsFor[path[0]] : debate.argumentsAgainst[path[0]];
      for (let i = 1; i < path.length; i++) { current = current.refutations![path[i]]; }
      const { data, error } = await supabase.functions.invoke('generate-arguments', {
        body: { statement: debate.statement, type: 'refute', parentArgument: current.text, targetSide: side === "for" ? "against" : "for" }
      });
      if (error) throw error;
      const newDebate = JSON.parse(JSON.stringify(debate));
      let target: Argument = side === "for" ? newDebate.argumentsFor[path[0]] : newDebate.argumentsAgainst[path[0]];
      for (let i = 1; i < path.length; i++) { target = target.refutations![path[i]]; }
      if (!target.refutations) { target.refutations = []; }
      target.refutations.push({ title: data.title, subheading: data.subheading, text: data.text, sources: data.sources, refutations: [] });
      setDebate(newDebate);
      if (currentDebateSlug) {
        await supabase.from('debates').update({ arguments_data: { for: newDebate.argumentsFor, against: newDebate.argumentsAgainst } as any }).eq("slug", currentDebateSlug);
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
    setCurrentDebateSlug(null);
  };

  const handleRandomTopic = () => {
    const topic = RANDOM_TOPICS[Math.floor(Math.random() * RANDOM_TOPICS.length)];
    setStatement(topic);
  };

  if (isGenerating) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background greek-pattern">
      <NavBar />
      <div className="container mx-auto py-8 max-w-6xl px-4 md:px-12">
        <div className="space-y-12">
          {!debate && (
            <>
              <div className="text-center space-y-4 pt-4 animate-fade-in">
                <Scale className="h-12 w-12 mx-auto text-greek-gold animate-float" strokeWidth={1.5} />
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">The Art of Dialectic</h1>
                <p className="font-body text-base text-muted-foreground max-w-2xl mx-auto">Explore both sides of any argument</p>
              </div>

              <Card className="p-6 md:p-8 bg-card border border-border pillar-shadow max-w-3xl mx-auto">
                <div className="space-y-4">
                  <h3 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                    <span className="text-greek-gold">⟢</span> What's Your Take?
                  </h3>
                  <Textarea value={statement} onChange={e => setStatement(e.target.value)} placeholder="Enter a statement to explore both sides..." className="min-h-[100px] font-body text-base resize-none" />
                  <Button variant="ghost" size="sm" onClick={handleRandomTopic} className="gap-2 text-muted-foreground">
                    <Dices className="h-4 w-4" /> Random topic
                  </Button>
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-serif font-semibold text-foreground mb-2 block">Add Perspectives (Optional)</label>
                    <PerspectivePills perspectives={perspectives} onChange={setPerspectives} />
                  </div>
                  <Button onClick={generateInitialArguments} disabled={!statement.trim()} size="lg" className="w-full font-sans text-sm uppercase tracking-wider bg-amber-800 hover:bg-amber-700 text-white">
                    Generate <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Card>

              {publicDebates.length > 0 && (
                <div className="space-y-6 pt-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl font-bold text-foreground">Recent Debates in the Agora</h2>
                    <Button variant="outline" onClick={() => navigate("/public")} className="text-xs uppercase tracking-wider">View All</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {publicDebates.map(d => (
                      <Card key={d.id} className="p-4 bg-card border border-border hover:border-greek-gold cursor-pointer group" onClick={() => navigate(`/debate/${d.slug}`)}>
                        <h3 className="font-serif font-semibold text-foreground line-clamp-2 group-hover:text-greek-gold transition-colors">{d.statement}</h3>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                          <span>{d.username}</span>
                          <span>{formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {debate && (
            <DebateView debate={debate} onRefute={handleRefute} onReset={resetDebate} onAddArgument={async (side) => {
              setAddingArgumentSide(side);
              try {
                const { data, error } = await supabase.functions.invoke('generate-arguments', {
                  body: { statement: debate.statement, type: 'add-argument', side, existingArguments: side === 'for' ? debate.argumentsFor : debate.argumentsAgainst }
                });
                if (error) throw error;
                const updatedDebate = { ...debate, ...(side === 'for' ? { argumentsFor: [...debate.argumentsFor, data] } : { argumentsAgainst: [...debate.argumentsAgainst, data] }) };
                setDebate(updatedDebate);
                if (currentDebateSlug) {
                  await supabase.from('debates').update({ arguments_data: { for: updatedDebate.argumentsFor, against: updatedDebate.argumentsAgainst } as any }).eq("slug", currentDebateSlug);
                }
              } catch (error: any) {
                toast.error("Failed to add argument");
              } finally {
                setAddingArgumentSide(null);
              }
            }} addingArgumentSide={addingArgumentSide} />
          )}
        </div>
      </div>
    </div>
  );
};
export default Index;
