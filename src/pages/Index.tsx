import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { DebateView } from "@/components/DebateView";
import { PerspectivePills } from "@/components/PerspectivePills";
import { PushbackSection } from "@/components/PushbackSection";
import { supabase } from "@/integrations/supabase/client";
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
  arguments: {
    for: Argument[];
    against: Argument[];
  };
}
const Index = () => {
  const [statement, setStatement] = useState("");
  const [debate, setDebate] = useState<DebateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [perspectives, setPerspectives] = useState<string[]>([]);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const loadingPhrases = ["Analyzing top sources...", "Structuring best arguments...", "Evaluating opposing claims...", "Refining citations..."];
  useState(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentPhrase(prev => (prev + 1) % loadingPhrases.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  });
  const generateInitialArguments = async () => {
    if (!statement.trim()) {
      toast.error("Please enter a statement to debate.");
      return;
    }
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("generate-arguments", {
        body: {
          statement,
          type: "initial",
          perspectives: perspectives.length > 0 ? perspectives : undefined
        }
      });
      if (error) throw error;
      setDebate({
        statement,
        summary: data.summary,
        arguments: {
          for: data.arguments.for.map((arg: any) => ({
            title: arg.title,
            subheading: arg.subheading,
            text: arg.text,
            sources: arg.sources,
            refutations: []
          })),
          against: data.arguments.against.map((arg: any) => ({
            title: arg.title,
            subheading: arg.subheading,
            text: arg.text,
            sources: arg.sources,
            refutations: []
          }))
        }
      });
    } catch (error: any) {
      console.error("Error generating arguments:", error);
      toast.error(error.message || "Failed to generate arguments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleRefute = async (argument: string, side: "for" | "against", path: number[]) => {
    if (!debate) return;
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("generate-arguments", {
        body: {
          statement: debate.statement,
          type: "refute",
          parentArgument: argument,
          targetSide: side === "for" ? "against" : "for"
        }
      });
      if (error) throw error;

      // Deep clone the debate to modify
      const newDebate = JSON.parse(JSON.stringify(debate));

      // Navigate to the argument using the path
      let current = newDebate.arguments[side][path[0]];
      for (let i = 1; i < path.length; i++) {
        current = current.refutations[path[i]];
      }

      // Add the refutation
      if (!current.refutations) {
        current.refutations = [];
      }
      current.refutations.push({
        title: data.title,
        subheading: data.subheading,
        text: data.text,
        sources: data.sources,
        refutations: []
      });
      setDebate(newDebate);
    } catch (error: any) {
      console.error("Error generating refutation:", error);
      toast.error(error.message || "Failed to generate refutation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const exportDebate = () => {
    if (!debate) return;
    const formatArguments = (args: Argument[], indent = 0): string => {
      return args.map((arg, idx) => {
        const prefix = "  ".repeat(indent);
        let text = "";
        if (arg.title) {
          text += `${prefix}${idx + 1}. **${arg.title}**\n`;
        }
        if (arg.subheading) {
          text += `${prefix}   _${arg.subheading}_\n`;
        }
        text += `${prefix}   ${arg.text}\n`;
        if (arg.sources.length > 0) {
          text += arg.sources.map((s, i) => `${prefix}   [${i + 1}] ${s.title}: ${s.url}`).join("\n") + "\n";
        }
        if (arg.refutations && arg.refutations.length > 0) {
          text += `${prefix}   Refutations:\n`;
          text += formatArguments(arg.refutations, indent + 2);
        }
        return text;
      }).join("\n");
    };
    const markdown = `# Debate: ${debate.statement}

## Summary
${debate.summary}

## Arguments For
${formatArguments(debate.arguments.for)}

## Arguments Against
${formatArguments(debate.arguments.against)}
`;
    const blob = new Blob([markdown], {
      type: "text/markdown"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debate-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Your debate has been exported as a markdown file.");
  };
  const handleEvidence = async (argument: string, side: "for" | "against", path: number[]) => {
    if (!debate) return;
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("generate-arguments", {
        body: {
          statement: debate.statement,
          type: "evidence",
          parentArgument: argument
        }
      });
      if (error) throw error;

      // Deep clone the debate to modify
      const newDebate = JSON.parse(JSON.stringify(debate));

      // Navigate to the argument using the path
      let current = newDebate.arguments[side][path[0]];
      for (let i = 1; i < path.length; i++) {
        current = current.refutations[path[i]];
      }

      // Add the evidence as a refutation (since it's supporting, same structure)
      if (!current.refutations) {
        current.refutations = [];
      }
      current.refutations.push({
        title: data.title,
        subheading: data.subheading,
        text: data.text,
        sources: data.sources,
        refutations: []
      });
      setDebate(newDebate);
    } catch (error: any) {
      console.error("Error generating evidence:", error);
      toast.error(error.message || "Failed to generate evidence. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const resetDebate = () => {
    setDebate(null);
    setStatement("");
    setPerspectives([]);
  };
  return <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-6 border-b-4 pb-8">
          <h1 className="text-6xl font-serif font-bold text-foreground tracking-tight uppercase">DIALECTIC</h1>
          <p className="text-xl font-body text-muted-foreground max-w-3xl mx-auto leading-relaxed">Refine your arguments on any topic to help you on your debate</p>
        </header>

        {!debate ? <>
            <Card className="p-8 bg-card border-2 border-border shadow-elegant">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="statement" className="text-lg font-serif font-semibold text-foreground block uppercase tracking-wide">YOUR STATEMENT</label>
                  <Textarea id="statement" value={statement} onChange={e => setStatement(e.target.value)} placeholder="e.g., Universal Basic Income should be implemented globally" className="min-h-[120px] text-lg font-body resize-none border-2" />
                </div>

                <div className="space-y-3">
                  <label className="text-lg font-serif font-semibold text-foreground block uppercase tracking-wide">AI PERSPECTIVE</label>
                  <p className="text-sm font-body text-muted-foreground">
                    Select viewpoints to inform the AI's arguments
                  </p>
                  <PerspectivePills perspectives={perspectives} onChange={setPerspectives} />
                </div>

                <Button onClick={generateInitialArguments} disabled={isLoading || !statement.trim()} size="lg" className="w-full text-lg font-sans uppercase tracking-wider py-6 bg-sky-800 hover:bg-sky-700">
                  {isLoading ? loadingPhrases[currentPhrase] : "Generate Debate"}
                </Button>
              </div>
            </Card>

            <PushbackSection statement={statement} />
          </> : <>
            <PushbackSection statement={statement} />
            
            {isLoading && <Card className="p-4 bg-muted border border-border animate-in fade-in duration-200">
                <p className="text-sm font-body text-muted-foreground italic text-center">
                  {loadingPhrases[currentPhrase]}
                </p>
              </Card>}
            
            <DebateView debate={debate} onRefute={handleRefute} onEvidence={handleEvidence} onReset={resetDebate} onExport={exportDebate} />
          </>}
      </div>
    </div>;
};
export default Index;