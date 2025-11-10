import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArgumentCard } from "./ArgumentCard";
import { Download, RotateCcw } from "lucide-react";
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
  argumentsFor: Argument[];
  argumentsAgainst: Argument[];
}
interface DebateViewProps {
  debate: DebateData;
  onRefute: (side: "for" | "against", path: number[]) => void;
  onReset: () => void;
  onExport: () => void;
  onAddArgument: (side: "for" | "against") => void;
  addingArgumentSide: "for" | "against" | null;
}
export const DebateView = ({
  debate,
  onRefute,
  onReset,
  onExport,
  onAddArgument,
  addingArgumentSide
}: DebateViewProps) => {
  const [expandedSide, setExpandedSide] = useState<"for" | "against" | null>(null);
  const [hoveredSide, setHoveredSide] = useState<"for" | "against" | null>(null);
  return <div className="space-y-8">
      <div className="border border-border bg-card p-6 space-y-4 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <h2 className="font-serif font-bold text-2xl text-foreground tracking-wide">
              {debate.statement}
            </h2>
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              {debate.summary}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onExport} className="gap-2 whitespace-nowrap font-sans text-xs uppercase tracking-wider transition-all duration-200">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={onReset} className="gap-2 whitespace-nowrap font-sans text-xs uppercase tracking-wider transition-all duration-200 bg-sky-800 hover:bg-sky-900 text-white hover:text-white border-sky-800">
              <RotateCcw className="h-4 w-4" />
              New Debate
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-8">
        {/* FOR Panel */}
        <div 
          className={cn(
            "transition-all duration-700 ease-in-out relative group cursor-pointer", 
            expandedSide === "for" ? "lg:w-full" : expandedSide === "against" ? "lg:hidden" : "lg:flex-1",
            hoveredSide === "against" && !expandedSide && "lg:flex-[0.48]"
          )} 
          onMouseEnter={() => !expandedSide && setHoveredSide("for")} 
          onMouseLeave={() => setHoveredSide(null)} 
          onClick={() => setExpandedSide(expandedSide === "for" ? null : "for")}
        >
          {hoveredSide === "for" && !expandedSide && <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-3 py-1 text-xs font-sans rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Expand
            </div>}
          <div className="border border-for-border bg-for-bg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-2xl text-foreground uppercase tracking-wide">⟢ FOR</h2>
            </div>

            <div className="space-y-4">
              {debate.argumentsFor?.map((arg, idx) => <ArgumentCard key={idx} title={arg.title} subheading={arg.subheading} text={arg.text} sources={arg.sources} side="for" onRefute={subPath => onRefute("for", subPath)} refutations={arg.refutations} path={[idx]} />)}
            </div>
            
            {addingArgumentSide === "for" && <div className="text-sm font-body text-muted-foreground italic animate-fade-in">
                Generating argument<span className="animate-pulse">...</span>
              </div>}
            
            <Button onClick={e => {
            e.stopPropagation();
            onAddArgument("for");
          }} variant="outline" className="w-full font-sans text-xs uppercase tracking-wider mt-4" disabled={addingArgumentSide === "for"}>
              + Add Argument
            </Button>
          </div>
        </div>

        {/* AGAINST Panel */}
        <div 
          className={cn(
            "transition-all duration-700 ease-in-out relative group cursor-pointer", 
            expandedSide === "against" ? "lg:w-full" : expandedSide === "for" ? "lg:hidden" : "lg:flex-1",
            hoveredSide === "for" && !expandedSide && "lg:flex-[0.48]"
          )} 
          onMouseEnter={() => !expandedSide && setHoveredSide("against")} 
          onMouseLeave={() => setHoveredSide(null)} 
          onClick={() => setExpandedSide(expandedSide === "against" ? null : "against")}
        >
          {hoveredSide === "against" && !expandedSide && <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-3 py-1 text-xs font-sans rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Expand
            </div>}
          <div className="border border-against-border bg-against-bg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-2xl text-foreground uppercase tracking-wide">ᯓ AGAINST
            </h2>
            </div>

            <div className="space-y-4">
              {debate.argumentsAgainst?.map((arg, idx) => <ArgumentCard key={idx} title={arg.title} subheading={arg.subheading} text={arg.text} sources={arg.sources} side="against" onRefute={subPath => onRefute("against", subPath)} refutations={arg.refutations} path={[idx]} />)}
            </div>
            
            {addingArgumentSide === "against" && <div className="text-sm font-body text-muted-foreground italic animate-fade-in">
                Generating argument<span className="animate-pulse">...</span>
              </div>}
            
            <Button onClick={e => {
            e.stopPropagation();
            onAddArgument("against");
          }} variant="outline" className="w-full font-sans text-xs uppercase tracking-wider mt-4" disabled={addingArgumentSide === "against"}>
              + Add Argument
            </Button>
          </div>
        </div>
      </div>
    </div>;
};