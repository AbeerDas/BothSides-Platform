import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Scale, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
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
}

type Stance = "for" | "against" | "balanced";

export const ConclusionSection = ({
  statement,
  argumentsFor,
  argumentsAgainst
}: ConclusionSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [conclusion, setConclusion] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [stance, setStance] = useState<Stance>("balanced");
  const [reasoning, setReasoning] = useState<string[]>([]);

  useEffect(() => {
    // Auto-generate conclusion when component mounts
    if (!conclusion) {
      generateConclusion();
    }
  }, []);

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
      
      // Determine stance based on conclusion content
      const lowerConclusion = data.conclusion.toLowerCase();
      if (lowerConclusion.includes("lean towards supporting") || 
          lowerConclusion.includes("stronger case for") ||
          lowerConclusion.includes("evidence favors")) {
        setStance("for");
      } else if (lowerConclusion.includes("lean towards opposing") || 
                 lowerConclusion.includes("stronger case against") ||
                 lowerConclusion.includes("evidence suggests against")) {
        setStance("against");
      } else {
        setStance("balanced");
      }

      // Extract key reasoning points
      const sentences = data.conclusion.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
      setReasoning(sentences.slice(0, 3));
    } catch (error) {
      console.error('Error generating conclusion:', error);
      setConclusion("Unable to generate conclusion at this time.");
    } finally {
      setIsLoading(false);
    }
  };

  const StanceIcon = stance === "for" 
    ? CheckCircle2 
    : stance === "against" 
      ? XCircle 
      : MinusCircle;

  const stanceColor = stance === "for"
    ? "text-for-accent"
    : stance === "against"
      ? "text-against-accent"
      : "text-greek-gold";

  const stanceLabel = stance === "for"
    ? "Leans For"
    : stance === "against"
      ? "Leans Against"
      : "Balanced";

  return (
    <Card className="border border-border bg-card overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="w-full p-5 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Scale className="h-5 w-5 text-greek-gold" />
          <h3 className="font-serif font-medium text-base text-foreground">
            Final Conclusion
          </h3>
          {!isLoading && conclusion && (
            <span className={cn("text-xs font-sans uppercase tracking-wider flex items-center gap-1", stanceColor)}>
              <StanceIcon className="h-3.5 w-3.5" />
              {stanceLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 animate-fade-in space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-full bg-muted/50 animate-pulse" />
              <div className="h-4 w-5/6 bg-muted/50 animate-pulse" />
              <div className="h-4 w-4/5 bg-muted/50 animate-pulse" />
            </div>
          ) : (
            <>
              {/* Stance Indicator */}
              <div className={cn(
                "flex items-center gap-3 p-3 border-l-4",
                stance === "for" && "border-for-accent bg-for-bg/50",
                stance === "against" && "border-against-accent bg-against-bg/50",
                stance === "balanced" && "border-greek-gold bg-muted/30"
              )}>
                <StanceIcon className={cn("h-5 w-5", stanceColor)} />
                <div>
                  <p className={cn("text-sm font-medium", stanceColor)}>{stanceLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    Based on analysis of {argumentsFor.length + argumentsAgainst.length} arguments
                  </p>
                </div>
              </div>

              {/* Main Conclusion */}
              <p className="text-sm font-body leading-relaxed text-foreground">
                {conclusion}
              </p>

              {/* Key Reasoning Points */}
              {reasoning.length > 0 && (
                <div className="pt-2 space-y-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                    Key Points
                  </p>
                  <ul className="space-y-1">
                    {reasoning.map((point, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
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
