import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DebateView } from "@/components/DebateView";
import { PerspectivePills } from "@/components/PerspectivePills";
import { LoadingScreen } from "@/components/LoadingScreen";
import { NavBar } from "@/components/NavBar";
import { Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
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
const Index = () => {
  const [statement, setStatement] = useState("");
  const [debate, setDebate] = useState<DebateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [perspectives, setPerspectives] = useState<string[]>([]);
  const [addingArgumentSide, setAddingArgumentSide] = useState<"for" | "against" | null>(null);
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
      setDebate({
        statement,
        summary: data.summary,
        argumentsFor: data.arguments.for,
        argumentsAgainst: data.arguments.against
      });
      setIsGenerating(false);
    } catch (error: any) {
      console.error('Error:', error);
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
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const resetDebate = () => {
    setDebate(null);
    setStatement("");
    setPerspectives([]);
    setIsGenerating(false);
  };
  if (isGenerating) {
    return <LoadingScreen />;
  }
  return <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="space-y-8">
          {!debate && (
            <div className="text-center space-y-4 pb-6">
              <div className="flex items-center justify-center gap-3">
                <Scale className="h-8 w-8 text-foreground" />
                <h1 className="font-serif font-bold text-4xl md:text-5xl text-foreground uppercase tracking-tight">
                  DIALECTIC
                </h1>
              </div>
              <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">See if your opinion holds up against multiple viewpoints</p>
            </div>
          )}

          {!debate && <div className="space-y-6 animate-fade-in">
              <Card className="p-6 bg-card border border-border">
                <div className="space-y-4">
                  <h3 className="text-lg font-serif font-semibold text-foreground uppercase tracking-wide">State Your Opinion</h3>
                  <p className="text-sm font-body text-muted-foreground">Enter any statement, opinion, or claim you'd like to explore from multiple angles</p>
                  <Textarea value={statement} onChange={e => setStatement(e.target.value)} placeholder="Universal Basic Income should be mandatory, Michael Jordan > Lebron, etc." className="min-h-[100px] font-body text-base resize-none" />
                </div>

                <div className="space-y-4 mt-6">
                  <label className="text-sm font-serif font-semibold text-foreground uppercase tracking-wide">Attach a Perspective (optional)</label>
                  <PerspectivePills perspectives={perspectives} onChange={setPerspectives} />
                </div>

                <Button onClick={generateInitialArguments} disabled={!statement.trim()} className="w-full font-sans text-sm uppercase tracking-wider mt-6 bg-sky-800 hover:bg-sky-900 text-white" size="lg">
                  Generate Debate
                </Button>
              </Card>
            </div>}

          {debate && <div className="animate-fade-in">
              <DebateView debate={debate} onRefute={handleRefute} onReset={resetDebate} onAddArgument={async (side: "for" | "against") => {
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
              const newArgument = data;
              const updatedDebate = {
                ...debate,
                ...(side === 'for' ? {
                  argumentsFor: [...debate.argumentsFor, newArgument]
                } : {
                  argumentsAgainst: [...debate.argumentsAgainst, newArgument]
                })
              };
              setDebate(updatedDebate);
            } catch (error: any) {
              console.error('Error:', error);
            } finally {
              setAddingArgumentSide(null);
            }
          }} addingArgumentSide={addingArgumentSide} />
            </div>}
        </div>
      </div>
    </div>;
};
export default Index;