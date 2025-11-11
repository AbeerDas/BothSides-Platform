import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minimize2, Maximize2, MessageSquare } from "lucide-react";
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
  path = []
}: ArgumentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRefuting, setIsRefuting] = useState(false);
  const hasRefutations = refutations.length > 0;
  const handleRefute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefuting(true);
    onRefute(path);
    setTimeout(() => setIsRefuting(false), 2000);
  };
  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };
  return <div className={cn("space-y-3 transition-all duration-300", depth > 0 && "ml-8 border-l-2 border-border pl-6")}>
      <Card className={cn("p-6 transition-all duration-300 border shadow-card animate-fade-in relative", side === "for" ? "bg-for-bg border-for-border" : "bg-against-bg border-against-border")}>
        <Button variant="ghost" size="icon" onClick={handleMinimize} className="absolute top-2 right-2 z-10" title={isMinimized ? "Maximize" : "Minimize"}>
          {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>

        <div className="space-y-4 pr-10">
          <div className="space-y-3">
            {title && <h3 className="font-serif font-semibold text-lg text-foreground tracking-wide">{title}</h3>}
            {!isMinimized && <>
                {subheading && <p className="text-sm font-body text-muted-foreground italic border-l-2 border-border pl-3">{subheading}</p>}
                <p className="text-base font-body leading-relaxed text-foreground">{text}</p>
                
                {sources.length > 0 && <div className="pt-3 border-t border-border space-y-2">
                    <p className="text-xs uppercase tracking-wider font-sans text-muted-foreground">Sources</p>
                    <div className="flex flex-col gap-2">
                      {sources.map((source, idx) => <CitationTooltip key={idx} source={source} index={idx + 1} />)}
                    </div>
                  </div>}
              </>}
          </div>

          {!isMinimized && <div className="pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={handleRefute} disabled={isRefuting} className="gap-2 whitespace-nowrap font-sans text-xs uppercase tracking-wider transition-all duration-200">
                <MessageSquare className="h-4 w-4" />
                Refute
              </Button>
            </div>}
        </div>
      </Card>

      {isRefuting && <div className="ml-8 text-sm font-body text-muted-foreground italic animate-fade-in">
          Generating refutation<span className="animate-pulse">...</span>
        </div>}

      {hasRefutations && isExpanded && !isMinimized && <div className="space-y-3 transition-all duration-300">
          {refutations.map((refutation, idx) => <ArgumentCard key={idx} title={refutation.title} subheading={refutation.subheading} text={refutation.text} sources={refutation.sources} side={side === "for" ? "against" : "for"} onRefute={onRefute} refutations={refutation.refutations} depth={depth + 1} path={[...path, idx]} />)}
        </div>}
    </div>;
};