import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArgumentCard } from "./ArgumentCard";
import { ConclusionSection } from "./ConclusionSection";
import { Download, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";

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
  onAddArgument: (side: "for" | "against") => void;
  addingArgumentSide: "for" | "against" | null;
}

export const DebateView = ({
  debate,
  onRefute,
  onReset,
  onAddArgument,
  addingArgumentSide
}: DebateViewProps) => {
  const [expandedSide, setExpandedSide] = useState<"for" | "against" | null>(null);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const lineHeight = 7;
    let y = margin;

    const addText = (text: string, fontSize = 11, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      
      lines.forEach((line: string) => {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
      y += 3;
    };

    // Title
    addText(`DIALECTIC: ${debate.statement}`, 16, true);
    y += 5;

    // Summary
    addText("Summary", 13, true);
    addText(debate.summary);
    y += 5;

    // Arguments For
    addText("Arguments FOR", 13, true);
    debate.argumentsFor.forEach((arg, idx) => {
      addText(`${idx + 1}. ${arg.title || 'Argument'}`, 11, true);
      addText(arg.text);
    });
    y += 5;

    // Arguments Against
    addText("Arguments AGAINST", 13, true);
    debate.argumentsAgainst.forEach((arg, idx) => {
      addText(`${idx + 1}. ${arg.title || 'Argument'}`, 11, true);
      addText(arg.text);
    });

    doc.save(`dialectic-${Date.now()}.pdf`);
  };

  const handleExpandFor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSide(expandedSide === "for" ? null : "for");
  };

  const handleExpandAgainst = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSide(expandedSide === "against" ? null : "against");
  };

  return (
    <div className="space-y-8">
      <ConclusionSection 
        statement={debate.statement}
        argumentsFor={debate.argumentsFor}
        argumentsAgainst={debate.argumentsAgainst}
      />

      <div className="border border-border bg-card p-4 md:p-6 space-y-4 animate-fade-in pillar-shadow">
        <div className="space-y-3">
          <h2 className="font-serif font-bold text-xl md:text-2xl text-foreground tracking-wide">
            {debate.statement}
          </h2>
          <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
            {debate.summary}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportPDF} 
              className="gap-2 font-sans text-xs uppercase tracking-wider transition-all duration-200 w-full sm:w-auto hover:bg-accent"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onReset} 
              className="gap-2 font-sans text-xs uppercase tracking-wider transition-all duration-200 bg-sky-700 hover:bg-sky-800 text-white hover:text-white border-sky-700 w-full sm:w-auto"
            >
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
            "transition-all duration-300 ease-in-out relative", 
            expandedSide === "for" ? "lg:w-full" : expandedSide === "against" ? "lg:hidden" : "lg:flex-1"
          )}
        >
          <div className="border border-for-border bg-for-bg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-2xl text-foreground uppercase tracking-wide flex items-center gap-2">
                <span className="text-greek-gold">⟢</span> FOR
              </h2>
              
              {/* Expand button */}
              <button
                onClick={handleExpandFor}
                className="flex items-center gap-1 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
              >
                {expandedSide === "for" ? (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    <span>Show Both</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Expand</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {debate.argumentsFor?.map((arg, idx) => (
                <ArgumentCard 
                  key={idx} 
                  title={arg.title} 
                  subheading={arg.subheading} 
                  text={arg.text} 
                  sources={arg.sources} 
                  side="for" 
                  onRefute={subPath => onRefute("for", subPath)} 
                  refutations={arg.refutations} 
                  path={[idx]} 
                />
              ))}
            </div>
            
            {addingArgumentSide === "for" && (
              <div className="text-sm font-body text-muted-foreground italic animate-fade-in">
                Generating argument<span className="animate-pulse">...</span>
              </div>
            )}
            
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onAddArgument("for");
              }} 
              variant="outline" 
              className="w-full font-sans text-xs uppercase tracking-wider mt-4 hover:bg-for-hover" 
              disabled={addingArgumentSide === "for"}
            >
              + Add Argument
            </Button>
          </div>
        </div>

        {/* AGAINST Panel */}
        <div 
          className={cn(
            "transition-all duration-300 ease-in-out relative", 
            expandedSide === "against" ? "lg:w-full" : expandedSide === "for" ? "lg:hidden" : "lg:flex-1"
          )}
        >
          <div className="border border-against-border bg-against-bg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-2xl text-foreground uppercase tracking-wide flex items-center gap-2">
                <span className="text-greek-terracotta">ᯓ</span> AGAINST
              </h2>
              
              {/* Expand button */}
              <button
                onClick={handleExpandAgainst}
                className="flex items-center gap-1 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
              >
                {expandedSide === "against" ? (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    <span>Show Both</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    <span>Expand</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {debate.argumentsAgainst?.map((arg, idx) => (
                <ArgumentCard 
                  key={idx} 
                  title={arg.title} 
                  subheading={arg.subheading} 
                  text={arg.text} 
                  sources={arg.sources} 
                  side="against" 
                  onRefute={subPath => onRefute("against", subPath)} 
                  refutations={arg.refutations} 
                  path={[idx]} 
                />
              ))}
            </div>
            
            {addingArgumentSide === "against" && (
              <div className="text-sm font-body text-muted-foreground italic animate-fade-in">
                Generating argument<span className="animate-pulse">...</span>
              </div>
            )}
            
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onAddArgument("against");
              }} 
              variant="outline" 
              className="w-full font-sans text-xs uppercase tracking-wider mt-4 hover:bg-against-hover" 
              disabled={addingArgumentSide === "against"}
            >
              + Add Argument
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
