import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight, MessageSquare } from "lucide-react";
import { useState } from "react";
import { CitationTooltip } from "./CitationTooltip";
import { cn } from "@/lib/utils";

interface Source {
  title: string;
  url: string;
}

interface ArgumentCardProps {
  title?: string;
  subheading?: string;
  text: string;
  sources: Source[];
  side: "for" | "against";
  onRefute: () => void;
  onEvidence?: () => void;
  refutations?: Array<{
    title?: string;
    subheading?: string;
    text: string;
    sources: Source[];
    refutations?: any[];
  }>;
  depth?: number;
}

export const ArgumentCard = ({ 
  title,
  subheading,
  text, 
  sources, 
  side, 
  onRefute,
  onEvidence,
  refutations = [],
  depth = 0 
}: ArgumentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasRefutations = refutations.length > 0;

  return (
    <div className={cn("space-y-3", depth > 0 && "ml-8 border-l-2 border-border pl-6")}>
      <Card 
        className={cn(
          "p-6 transition-all duration-200 border shadow-card",
          side === "for" ? "bg-for-bg border-for-border" : "bg-against-bg border-against-border"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {title && (
              <h3 className="font-serif font-semibold text-lg text-foreground uppercase tracking-wide">{title}</h3>
            )}
            {subheading && (
              <p className="text-sm font-body text-muted-foreground italic border-l-2 border-border pl-3">{subheading}</p>
            )}
            <p className="text-base font-body leading-relaxed text-foreground">{text}</p>
            
            {sources.length > 0 && (
              <div className="pt-3 border-t border-border space-y-2">
                <p className="text-xs uppercase tracking-wider font-sans text-muted-foreground">Sources</p>
                <div className="flex flex-col gap-2">
                  {sources.map((source, idx) => (
                    <CitationTooltip key={idx} source={source} index={idx + 1} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {hasRefutations && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-9 w-9 p-0 font-sans"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefute}
              className="gap-2 whitespace-nowrap font-sans text-xs uppercase tracking-wider"
            >
              <MessageSquare className="h-4 w-4" />
              Refute
            </Button>
            {onEvidence && depth === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEvidence}
                className="gap-2 whitespace-nowrap font-sans text-xs uppercase tracking-wider"
              >
                Evidence
              </Button>
            )}
          </div>
        </div>
      </Card>

      {hasRefutations && isExpanded && (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
          {refutations.map((refutation, idx) => (
            <ArgumentCard
              key={idx}
              title={refutation.title}
              subheading={refutation.subheading}
              text={refutation.text}
              sources={refutation.sources}
              side={side}
              onRefute={() => {}}
              refutations={refutation.refutations}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};