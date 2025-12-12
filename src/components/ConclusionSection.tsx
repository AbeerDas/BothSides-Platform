import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Argument {
  title?: string;
  subheading?: string;
  text: string;
  sources: Array<{
    title: string;
    url: string;
  }>;
  refutations?: Argument[];
}

interface ConclusionSectionProps {
  statement: string;
  argumentsFor: Argument[];
  argumentsAgainst: Argument[];
  debateSlug?: string;
}

type Stance = "for" | "against";

export const ConclusionSection = ({
  statement,
  argumentsFor,
  argumentsAgainst,
  debateSlug
}: ConclusionSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [conclusion, setConclusion] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [stance, setStance] = useState<Stance>("for");
  const [reasoning, setReasoning] = useState<string[]>([]);
  const previousArgsRef = useRef<string>("");

  // Create a hash of arguments to detect changes
  const getArgsHash = () => {
    return JSON.stringify({ 
      for: argumentsFor.map(a => a.text), 
      against: argumentsAgainst.map(a => a.text), 
      statement 
    });
  };

  useEffect(() => {
    const currentHash = getArgsHash();
    // Only regenerate if arguments actually changed
    if (currentHash !== previousArgsRef.current) {
      previousArgsRef.current = currentHash;
      generateConclusion();
    }
  }, [argumentsFor, argumentsAgainst, statement]);

  const generateConclusion = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-conclusion', {
        body: {
          statement,
          argumentsFor,
          argumentsAgainst
        }
      });

      if (error) throw error;

      setConclusion(data.conclusion);
      
      // Parse stance from the conclusion text
      const lowerConclusion = data.conclusion.toLowerCase();
      const firstSentence = data.conclusion.split(/[.!?]/)[0].toLowerCase();
      
      // Check first sentence for explicit stance indicators
      if (firstSentence.includes("i oppose") || 
          firstSentence.includes("i reject") ||
          firstSentence.includes("against") ||
          firstSentence.includes("not support") ||
          firstSentence.includes("disagree")) {
        setStance("against");
      } else {
        // Default to "for" since the prompt asks for explicit stance
        setStance("for");
      }

      // Extract key reasoning points
      const sentences = data.conclusion.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
      setReasoning(sentences.slice(0, 3));

      // Save conclusion to database if we have a slug
      if (debateSlug) {
        await supabase
          .from('debates')
          .update({ summary: data.conclusion })
          .eq('slug', debateSlug);
      }
    } catch (error) {
      console.error('Error generating conclusion:', error);
      setConclusion("Unable to generate conclusion at this time.");
    } finally {
      setIsLoading(false);
    }
  };

  const StanceIcon = stance === "for" ? CheckCircle2 : XCircle;
  const stanceColor = stance === "for" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  const stanceLabel = stance === "for" ? "For" : "Against";
  const stanceBg = stance === "for" ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5";

  return (
    <Card className="border border-border bg-card overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="w-full p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-serif font-medium text-sm text-foreground">
            Final Conclusion
          </h3>
          {!isLoading && conclusion && (
            <span className={cn("text-[10px] font-sans uppercase tracking-wider flex items-center gap-1 px-2 py-0.5 border", stanceBg, stanceColor)}>
              <StanceIcon className="h-3 w-3" />
              {stanceLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 animate-fade-in space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted/50 animate-shimmer rounded" />
              <div className="h-3 w-5/6 bg-muted/50 animate-shimmer rounded" />
              <div className="h-3 w-4/5 bg-muted/50 animate-shimmer rounded" />
            </div>
          ) : (
            <>
              {/* Stance Indicator */}
              <div className={cn(
                "flex items-center gap-3 p-2.5 border-l-4",
                stance === "for" && "border-green-500 bg-green-500/5",
                stance === "against" && "border-red-500 bg-red-500/5"
              )}>
                <StanceIcon className={cn("h-4 w-4", stanceColor)} />
                <div>
                  <p className={cn("text-xs font-medium", stanceColor)}>
                    {stance === "for" ? "Supports the Statement" : "Opposes the Statement"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Based on {argumentsFor.length + argumentsAgainst.length} arguments analyzed
                  </p>
                </div>
              </div>

              {/* Main Conclusion */}
              <p className="text-xs font-body leading-relaxed text-foreground">
                {conclusion}
              </p>

              {/* Key Reasoning Points */}
              {reasoning.length > 0 && (
                <div className="pt-1 space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans">
                    Key Points
                  </p>
                  <ul className="space-y-0.5">
                    {reasoning.map((point, idx) => (
                      <li key={idx} className="text-[10px] text-muted-foreground flex items-start gap-2">
                        <span className="text-greek-gold mt-0.5">•</span>
                        <span>{point.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
};