import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

export const ConclusionSection = ({
  statement,
  argumentsFor,
  argumentsAgainst
}: ConclusionSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [conclusion, setConclusion] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const generateConclusion = async () => {
    if (conclusion) {
      setIsExpanded(!isExpanded);
      return;
    }
    setIsLoading(true);
    setIsExpanded(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-conclusion', {
        body: {
          statement,
          argumentsFor,
          argumentsAgainst
        }
      });
      if (error) throw error;
      setConclusion(data.conclusion);
    } catch (error) {
      console.error('Error generating conclusion:', error);
      setConclusion("Unable to generate conclusion at this time.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-border bg-card overflow-hidden">
      <button onClick={generateConclusion} className="w-full p-6 flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-5 w-5 text-greek-gold" />
          <h3 className="font-serif font-medium text-lg text-foreground tracking-wide">What's our Final Conclusion?</h3>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-sm">Click to {conclusion ? (isExpanded ? 'hide' : 'show') : 'generate'}</span>
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {isExpanded && <div className="px-6 pb-6 animate-fade-in">
          {isLoading ? <p className="text-sm font-body text-muted-foreground italic">
              Analyzing all arguments<span className="animate-pulse">...</span>
            </p> : <p className="text-base font-body leading-relaxed text-foreground border-l-4 border-greek-gold pl-4">
              {conclusion}
            </p>}
        </div>}
    </Card>
  );
};
