import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArgumentCard } from "./ArgumentCard";
import { Download, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
interface DebateViewProps {
  debate: DebateData;
  onRefute: (argument: string, side: "for" | "against", path: number[]) => void;
  onEvidence: (argument: string, side: "for" | "against", path: number[]) => void;
  onReset: () => void;
  onExport: () => void;
}
export const DebateView = ({
  debate,
  onRefute,
  onEvidence,
  onReset,
  onExport
}: DebateViewProps) => {
  const [expandedPanel, setExpandedPanel] = useState<"for" | "against" | null>(null);
  const togglePanel = (panel: "for" | "against") => {
    setExpandedPanel(expandedPanel === panel ? null : panel);
  };
  return <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-8 bg-card border-2 border-border shadow-elegant">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <h2 className="text-4xl font-serif font-bold text-foreground tracking-tight border-b-2 border-foreground pb-3">{debate.statement}</h2>
            <p className="text-muted-foreground font-body leading-relaxed text-lg">{debate.summary}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={onExport} className="gap-2 font-sans text-xs uppercase tracking-wider">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={onReset} className="gap-2 font-sans text-xs uppercase tracking-wider">
              <RotateCcw className="h-4 w-4" />
              New Debate
            </Button>
          </div>
        </div>
      </Card>

      <div className="relative flex gap-6 min-h-[600px]">
        {/* For Panel */}
        <div className={cn("transition-all duration-500 ease-in-out overflow-hidden", expandedPanel === "for" && "w-full", expandedPanel === "against" && "w-0 opacity-0", expandedPanel === null && "w-1/2")}>
          <Card className={cn("h-full bg-for-bg border-2 border-for-border shadow-panel cursor-pointer transition-all duration-300 overflow-hidden", expandedPanel === "for" && "cursor-default", expandedPanel !== "for" && "hover:shadow-panel")} onClick={() => expandedPanel !== "for" && togglePanel("for")}>
            <div className="p-8 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-for-border">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-1 bg-for-border" />
                  <h3 className="text-3xl font-serif font-bold text-foreground uppercase tracking-tight">FOR</h3>
                </div>
                {expandedPanel === "for" && <Button variant="ghost" size="sm" onClick={e => {
                e.stopPropagation();
                setExpandedPanel(null);
              }} className="gap-2 font-sans text-xs uppercase tracking-wider">
                    <ChevronLeft className="h-4 w-4" />
                    Collapse
                  </Button>}
              </div>
              <div className="space-y-6">
                {debate.arguments.for.map((arg, idx) => <ArgumentCard key={idx} title={arg.title} subheading={arg.subheading} text={arg.text} sources={arg.sources} side="for" onRefute={() => onRefute(arg.text, "for", [idx])} onEvidence={() => onEvidence(arg.text, "for", [idx])} refutations={arg.refutations} />)}
              </div>
            </div>
          </Card>
        </div>

        {/* Against Panel */}
        <div className={cn("transition-all duration-500 ease-in-out overflow-hidden", expandedPanel === "against" && "w-full", expandedPanel === "for" && "w-0 opacity-0", expandedPanel === null && "w-1/2")}>
          <Card className={cn("h-full bg-against-bg border-2 border-against-border shadow-panel cursor-pointer transition-all duration-300 overflow-hidden", expandedPanel === "against" && "cursor-default", expandedPanel !== "against" && "hover:shadow-panel")} onClick={() => expandedPanel !== "against" && togglePanel("against")}>
            <div className="p-8 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-against-border">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-1 bg-against-border" />
                  <h3 className="text-3xl font-serif font-bold text-foreground uppercase tracking-tight">AGAINST</h3>
                </div>
                {expandedPanel === "against" && <Button variant="ghost" size="sm" onClick={e => {
                e.stopPropagation();
                setExpandedPanel(null);
              }} className="gap-2 font-sans text-xs uppercase tracking-wider">
                    Collapse
                    <ChevronRight className="h-4 w-4" />
                  </Button>}
              </div>
              <div className="space-y-6">
                {debate.arguments.against.map((arg, idx) => <ArgumentCard key={idx} title={arg.title} subheading={arg.subheading} text={arg.text} sources={arg.sources} side="against" onRefute={() => onRefute(arg.text, "against", [idx])} onEvidence={() => onEvidence(arg.text, "against", [idx])} refutations={arg.refutations} />)}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>;
};