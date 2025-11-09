import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { DebateView } from "@/components/DebateView";
import { PerspectivePills } from "@/components/PerspectivePills";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Scale } from "lucide-react";

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
  const { toast } = useToast();

  const generateInitialArguments = async () => {
    if (!statement.trim()) {
      toast({
        title: "Statement required",
        description: "Please enter a statement to debate.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-arguments", {
        body: { 
          statement, 
          type: "initial",
          perspectives: perspectives.length > 0 ? perspectives : undefined
        },
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
            refutations: [],
          })),
          against: data.arguments.against.map((arg: any) => ({
            title: arg.title,
            subheading: arg.subheading,
            text: arg.text,
            sources: arg.sources,
            refutations: [],
          })),
        },
      });
    } catch (error: any) {
      console.error("Error generating arguments:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate arguments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefute = async (argument: string, side: "for" | "against", path: number[]) => {
    if (!debate) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-arguments", {
        body: {
          statement: debate.statement,
          type: "refute",
          parentArgument: argument,
          targetSide: side === "for" ? "against" : "for",
        },
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
        refutations: [],
      });
    } catch (error: any) {
      console.error("Error generating refutation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate refutation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportDebate = () => {
    if (!debate) return;

    const formatArguments = (args: Argument[], indent = 0): string => {
      return args
        .map((arg, idx) => {
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
            text += arg.sources
              .map((s, i) => `${prefix}   [${i + 1}] ${s.title}: ${s.url}`)
              .join("\n") + "\n";
          }

          if (arg.refutations && arg.refutations.length > 0) {
            text += `${prefix}   Refutations:\n`;
            text += formatArguments(arg.refutations, indent + 2);
          }

          return text;
        })
        .join("\n");
    };

    const markdown = `# Debate: ${debate.statement}

## Summary
${debate.summary}

## Arguments For
${formatArguments(debate.arguments.for)}

## Arguments Against
${formatArguments(debate.arguments.against)}
`;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debate-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Your debate has been exported as a markdown file.",
    });
  };

  const handleEvidence = async (argument: string, side: "for" | "against", path: number[]) => {
    if (!debate) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-arguments", {
        body: {
          statement: debate.statement,
          type: "evidence",
          parentArgument: argument,
        },
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
        refutations: [],
      });

      setDebate(newDebate);
    } catch (error: any) {
      console.error("Error generating evidence:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate evidence. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetDebate = () => {
    setDebate(null);
    setStatement("");
    setPerspectives([]);
  };

  if (debate) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto py-8 px-4">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Dialectic</h1>
            </div>
            
            {isLoading && (
              <Card className="p-4 bg-muted/50 shadow-elegant animate-pulse">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Generating response...</p>
                </div>
              </Card>
            )}
          </div>

          <DebateView
            debate={debate}
            onRefute={handleRefute}
            onEvidence={handleEvidence}
            onReset={resetDebate}
            onExport={exportDebate}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Scale className="h-16 w-16 text-primary" />
            <h1 className="text-6xl font-bold text-foreground">Dialectic</h1>
          </div>
          <p className="text-2xl text-muted-foreground leading-relaxed">
            Strengthen your reasoning by exploring the strongest opposing arguments
          </p>
        </div>

        <Card className="p-8 space-y-6 shadow-panel">
          <div className="space-y-3">
            <label htmlFor="statement" className="text-base font-semibold text-foreground">
              Your Statement
            </label>
            <Textarea
              id="statement"
              placeholder="e.g., AI will eliminate more jobs than it creates"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="min-h-[120px] text-base resize-none transition-all duration-200 focus:shadow-card"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <label className="text-base font-semibold text-foreground">
              Perspectives <span className="text-sm font-normal text-muted-foreground">(optional)</span>
            </label>
            <PerspectivePills perspectives={perspectives} onChange={setPerspectives} />
            <p className="text-xs text-muted-foreground">
              Select perspectives to guide the AI's argumentation style
            </p>
          </div>

          <Button
            onClick={generateInitialArguments}
            disabled={isLoading || !statement.trim()}
            size="lg"
            className="w-full hover:scale-105 transition-transform duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Statement...
              </>
            ) : (
              "Generate Debate"
            )}
          </Button>
        </Card>
      </div>
    </main>
  );
};

export default Index;