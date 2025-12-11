import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minimize2, Maximize2, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
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
  onRefute: (path: number[]) => void;
  refutations?: Array<{
    title?: string;
    subheading?: string;
    text: string;
    sources: Source[];
    refutations?: any[];
  }>;
  depth?: number;
  isLoading?: boolean;
  path?: number[];
  forceExpanded?: boolean;
}

export const ArgumentCard = ({
  title,
  subheading,
  text,
  sources,
  side,
  onRefute,
  refutations = [],
  depth = 0,
  isLoading = false,
  path = [],
  forceExpanded = true
}: ArgumentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRefuting, setIsRefuting] = useState(false);
  const hasRefutations = refutations.length > 0;

  useEffect(() => {
    setIsMinimized(!forceExpanded);
  }, [forceExpanded]);

  const handleRefute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefuting(true);
    onRefute(path);
    setTimeout(() => setIsRefuting(false), 3000);
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={cn(
      "space-y-3 transition-all duration-300",
      depth > 0 && "ml-4 md:ml-6 border-l-2 pl-3 md:pl-4",
      depth > 0 && side === "for" ? "border-for-border" : depth > 0 && "border-against-border"
    )}>
      <Card className={cn(
        "p-4 transition-all duration-300 border shadow-sm animate-fade-in relative",
        side === "for" ? "bg-for-bg border-for-border" : "bg-against-bg border-against-border"
      )}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleMinimize} 
          className="absolute top-2 right-2 z-10 h-7 w-7 hover:bg-accent" 
          title={isMinimized ? "Expand" : "Minimize"}
        >
          {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
        </Button>

        <div className="space-y-3 pr-8">
          <div className="space-y-2">
            {title && (
              <h3 className="font-serif font-medium text-base text-foreground">
                {title}
              </h3>
            )}
            {!isMinimized && (
              <>
                {subheading && (
                  <p className="text-xs font-body text-muted-foreground italic border-l-2 border-border pl-2">
                    {subheading}
                  </p>
                )}
                <p className="text-sm font-body leading-relaxed text-foreground">
                  {text}
                </p>
                
                {sources.length > 0 && (
                  <div className="pt-2 border-t border-border space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider font-sans text-muted-foreground">
                      Sources
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {sources.map((source, idx) => (
                        <CitationTooltip key={idx} source={source} index={idx + 1} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {!isMinimized && (
            <div className="pt-3 border-t border-border">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefute} 
                disabled={isRefuting} 
                className={cn(
                  "gap-1.5 whitespace-nowrap font-sans text-[10px] uppercase tracking-wider transition-all duration-200 h-7",
                  side === "for" 
                    ? "hover:bg-against-bg hover:border-against-border" 
                    : "hover:bg-for-bg hover:border-for-border"
                )}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {isRefuting ? "Generating..." : "Comeback"}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {isRefuting && (
        <div className="ml-4 md:ml-6 text-xs font-body text-muted-foreground italic animate-fade-in flex items-center gap-2">
          <span className="text-greek-gold">⟢</span>
          Generating refutation<span className="animate-pulse">...</span>
        </div>
      )}

      {hasRefutations && isExpanded && !isMinimized && (
        <div className="space-y-3 transition-all duration-300">
          {refutations.map((refutation, idx) => (
            <ArgumentCard 
              key={idx} 
              title={refutation.title} 
              subheading={refutation.subheading} 
              text={refutation.text} 
              sources={refutation.sources} 
              side={side === "for" ? "against" : "for"} 
              onRefute={onRefute} 
              refutations={refutation.refutations} 
              depth={depth + 1} 
              path={[...path, idx]}
              forceExpanded={forceExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
};
