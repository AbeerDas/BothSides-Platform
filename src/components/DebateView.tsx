import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArgumentCard } from "./ArgumentCard";
import { Download, RotateCcw } from "lucide-react";

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
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-6 bg-card">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h2 className="text-2xl font-bold text-foreground">{debate.statement}</h2>
            <p className="text-muted-foreground leading-relaxed">{debate.summary}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              New Debate
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-for-border rounded-full" />
            <h3 className="text-lg font-semibold text-foreground">Arguments For</h3>
          </div>
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

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-against-border rounded-full" />
            <h3 className="text-lg font-semibold text-foreground">Arguments Against</h3>
          </div>
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
    </div>
  );
};