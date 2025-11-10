import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DebateView } from "@/components/DebateView";
import { PerspectivePills } from "@/components/PerspectivePills";
import { PushbackSection } from "@/components/PushbackSection";
import { LoadingScreen } from "@/components/LoadingScreen";
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
      
      setTimeout(() => {
        setDebate(data);
        setIsGenerating(false);
      }, 1500);
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
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvidence = async (side: "for" | "against", path: number[]) => {
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
          type: 'evidence',
          parentArgument: current.text
        }
      });

      if (error) throw error;
      
      // Evidence is handled inline in ArgumentCard, no need to update debate
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportDebate = () => {
    if (!debate) return;

    const formatArguments = (args: Argument[], indent = 0): string => {
      return args.map((arg, idx) => {
        const prefix = '  '.repeat(indent);
        let text = '';
        
        if (arg.title) {
          text += `${prefix}${idx + 1}. **${arg.title}**\n`;
        }
        if (arg.subheading) {
          text += `${prefix}   _${arg.subheading}_\n`;
        }
        text += `${prefix}   ${arg.text}\n`;
        
        if (arg.sources.length > 0) {
          text += arg.sources.map((s, i) => 
            `${prefix}   [${i + 1}] ${s.title}: ${s.url}`
          ).join('\n') + '\n';
        }
        
        if (arg.refutations && arg.refutations.length > 0) {
          text += `${prefix}   Refutations:\n`;
          text += formatArguments(arg.refutations, indent + 2);
        }
        
        return text;
      }).join('\n');
    };

    const markdown = `# Debate: ${debate.statement}

## Summary
${debate.summary}

## Arguments For
${formatArguments(debate.argumentsFor)}

## Arguments Against
${formatArguments(debate.argumentsAgainst)}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debate-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="space-y-8">
          <div className="text-center space-y-4 pb-6">
            <div className="flex items-center justify-center gap-3">
              <Scale className="h-8 w-8 text-foreground" />
              <h1 className="font-serif font-bold text-4xl md:text-5xl text-foreground uppercase tracking-tight">
                DIALECTIC
              </h1>
            </div>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore both sides of any statement through structured, source-backed reasoning
            </p>
          </div>

          {!debate && (
            <div className="space-y-6 animate-fade-in">
              <Card className="p-6 bg-card border border-border">
                <div className="space-y-4">
                  <h3 className="text-lg font-serif font-semibold text-foreground uppercase tracking-wide">
                    Your Opinion
                  </h3>
                  <Textarea
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    placeholder="Universal Basic Income should be mandatory, Michael Jordan > Lebron, etc."
                    className="min-h-[100px] font-body text-base resize-none"
                  />
                </div>

                <div className="space-y-4 mt-6">
                  <label className="text-sm font-serif font-semibold text-foreground uppercase tracking-wide">
                    Perspective
                  </label>
                  <PerspectivePills perspectives={perspectives} onChange={setPerspectives} />
                </div>

                <Button
                  onClick={generateInitialArguments}
                  disabled={!statement.trim()}
                  className="w-full font-sans text-sm uppercase tracking-wider mt-6"
                  size="lg"
                >
                  Generate Debate
                </Button>
              </Card>
            </div>
          )}

          {!debate && <PushbackSection statement={statement} />}

          {debate && (
            <div className="animate-fade-in">
              <DebateView 
                debate={debate}
                onRefute={handleRefute}
                onEvidence={handleEvidence}
                onReset={resetDebate}
                onExport={exportDebate}
                onAddArgument={async (side: "for" | "against") => {
                  setIsLoading(true);
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
                  } catch (error: any) {
                    console.error('Error:', error);
                  } finally {
                    setIsLoading(false);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
