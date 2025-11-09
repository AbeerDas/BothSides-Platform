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

export const DebateView = ({ debate, onRefute, onEvidence, onReset, onExport }: DebateViewProps) => {
  const [expandedPanel, setExpandedPanel] = useState<"for" | "against" | null>(null);

  const togglePanel = (panel: "for" | "against") => {
    setExpandedPanel(expandedPanel === panel ? null : panel);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-6 bg-card shadow-elegant">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h2 className="text-3xl font-bold text-foreground">{debate.statement}</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{debate.summary}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2 hover:scale-105 transition-transform duration-200"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="gap-2 hover:scale-105 transition-transform duration-200"
            >
              <RotateCcw className="h-4 w-4" />
              New Debate
            </Button>
          </div>
        </div>
      </Card>

      <div className="relative flex gap-4 min-h-[600px]">
        {/* For Panel */}
        <div
          className={cn(
            "transition-all duration-500 ease-in-out rounded-xl overflow-hidden",
            expandedPanel === "for" && "w-full",
            expandedPanel === "against" && "w-0 opacity-0",
            expandedPanel === null && "w-1/2"
          )}
        >
          <Card
            className={cn(
              "h-full bg-for-bg/50 border-2 border-for-border shadow-panel cursor-pointer transition-all duration-300 overflow-hidden",
              expandedPanel === "for" && "cursor-default",
              expandedPanel !== "for" && "hover:shadow-xl hover:border-for-accent"
            )}
            onClick={() => expandedPanel !== "for" && togglePanel("for")}
          >
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-2 bg-for-border rounded-full" />
                  <h3 className="text-2xl font-bold text-foreground">Arguments For</h3>
                </div>
                {expandedPanel === "for" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedPanel(null);
                    }}
                    className="gap-2 hover:bg-for-hover"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Collapse
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {debate.arguments.for.map((arg, idx) => (
                  <ArgumentCard
                    key={idx}
                    title={arg.title}
                    subheading={arg.subheading}
                    text={arg.text}
                    sources={arg.sources}
                    side="for"
                    onRefute={() => onRefute(arg.text, "for", [idx])}
                    onEvidence={() => onEvidence(arg.text, "for", [idx])}
                    refutations={arg.refutations}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Against Panel */}
        <div
          className={cn(
            "transition-all duration-500 ease-in-out rounded-xl overflow-hidden",
            expandedPanel === "against" && "w-full",
            expandedPanel === "for" && "w-0 opacity-0",
            expandedPanel === null && "w-1/2"
          )}
        >
          <Card
            className={cn(
              "h-full bg-against-bg/50 border-2 border-against-border shadow-panel cursor-pointer transition-all duration-300 overflow-hidden",
              expandedPanel === "against" && "cursor-default",
              expandedPanel !== "against" && "hover:shadow-xl hover:border-against-accent"
            )}
            onClick={() => expandedPanel !== "against" && togglePanel("against")}
          >
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-2 bg-against-border rounded-full" />
                  <h3 className="text-2xl font-bold text-foreground">Arguments Against</h3>
                </div>
                {expandedPanel === "against" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedPanel(null);
                    }}
                    className="gap-2 hover:bg-against-hover"
                  >
                    Collapse
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {debate.arguments.against.map((arg, idx) => (
                  <ArgumentCard
                    key={idx}
                    title={arg.title}
                    subheading={arg.subheading}
                    text={arg.text}
                    sources={arg.sources}
                    side="against"
                    onRefute={() => onRefute(arg.text, "against", [idx])}
                    onEvidence={() => onEvidence(arg.text, "against", [idx])}
                    refutations={arg.refutations}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};