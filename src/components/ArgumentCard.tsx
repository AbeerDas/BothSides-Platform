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
    setTimeout(() => setIsRefuting(false), 3000);
  };
  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };
  return <div className={cn("space-y-3 transition-all duration-300", depth > 0 && "ml-6 md:ml-8 border-l-2 pl-4 md:pl-6", depth > 0 && side === "for" ? "border-for-border" : depth > 0 && "border-against-border")}>
      <Card className={cn("p-5 md:p-6 transition-all duration-300 border shadow-card animate-fade-in relative", side === "for" ? "bg-for-bg border-for-border" : "bg-against-bg border-against-border")}>
        {/* Minimize button - top right */}
        <Button variant="ghost" size="icon" onClick={handleMinimize} className="absolute top-3 right-3 z-10 h-8 w-8 hover:bg-accent" title={isMinimized ? "Expand" : "Minimize"}>
          {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>

        <div className="space-y-4 pr-10">
          <div className="space-y-3">
            {title && <h3 className="font-serif font-semibold text-lg text-foreground tracking-wide">
                {title}
              </h3>}
            {!isMinimized && <>
                {subheading && <p className="text-sm font-body text-muted-foreground italic border-l-2 border-border pl-3">
                    {subheading}
                  </p>}
                <p className="text-base font-body leading-relaxed text-foreground">
                  {text}
                </p>
                
                {sources.length > 0 && <div className="pt-3 border-t border-border space-y-2">
                    <p className="text-xs uppercase tracking-wider font-sans text-muted-foreground">
                      Sources
                    </p>
                    <div className="flex flex-col gap-2">
                      {sources.map((source, idx) => <CitationTooltip key={idx} source={source} index={idx + 1} className="text-slate-50" />)}
                    </div>
                  </div>}
              </>}
          </div>

          {!isMinimized && <div className="pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={handleRefute} disabled={isRefuting} className={cn("gap-2 whitespace-nowrap font-sans text-xs uppercase tracking-wider transition-all duration-200", side === "for" ? "hover:bg-against-bg hover:border-against-border" : "hover:bg-for-bg hover:border-for-border")}>
                <MessageSquare className="h-4 w-4" />
                {isRefuting ? "Generating..." : "Click for Comeback"}
              </Button>
            </div>}
        </div>
      </Card>

      {isRefuting && <div className="ml-6 md:ml-8 text-sm font-body text-muted-foreground italic animate-fade-in flex items-center gap-2">
          <span className="text-greek-gold">⟢</span>
          Generating refutation<span className="animate-pulse">...</span>
        </div>}

      {hasRefutations && isExpanded && !isMinimized && <div className="space-y-3 transition-all duration-300">
          {refutations.map((refutation, idx) => <ArgumentCard key={idx} title={refutation.title} subheading={refutation.subheading} text={refutation.text} sources={refutation.sources} side={side === "for" ? "against" : "for"} onRefute={onRefute} refutations={refutation.refutations} depth={depth + 1} path={[...path, idx]} />)}
        </div>}
    </div>;
};