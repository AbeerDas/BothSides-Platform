import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArgumentCard } from "./ArgumentCard";
import { ConclusionSection } from "./ConclusionSection";
import { Download, RotateCcw, ChevronLeft, ChevronRight, RefreshCw, ChevronDown, Share2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
type ComplexityLevel = "academic" | "default" | "simple";
export const DebateView = ({
  debate,
  onRefute,
  onReset,
  onAddArgument,
  addingArgumentSide
}: DebateViewProps) => {
  const [expandedSide, setExpandedSide] = useState<"for" | "against" | null>(null);
  const [lensOptions, setLensOptions] = useState<string[]>([]);
  const [loadingLenses, setLoadingLenses] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [customLens, setCustomLens] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [tempDebate, setTempDebate] = useState<DebateData | null>(null);
  const [complexityLevel, setComplexityLevel] = useState<ComplexityLevel>("default");
  const [changingComplexity, setChangingComplexity] = useState(false);

  // Fetch lens options when debate loads
  useEffect(() => {
    const fetchLensOptions = async () => {
      setLoadingLenses(true);
      try {
        const {
          data,
          error
        } = await supabase.functions.invoke("generate-arguments", {
          body: {
            type: "generate-lenses",
            statement: debate.statement
          }
        });
        if (!error && data?.lenses) {
          setLensOptions(data.lenses);
        }
      } catch (err) {
        console.error("Failed to fetch lens options:", err);
      } finally {
        setLoadingLenses(false);
      }
    };
    fetchLensOptions();
  }, [debate.statement]);
  const handleRegenerateWithLens = async (lens: string) => {
    setRegenerating(true);
    setShowCustomInput(false);
    setCustomLens("");
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("generate-arguments", {
        body: {
          statement: debate.statement,
          type: "initial",
          perspectives: [lens]
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Set temporary debate (not saved to DB)
      setTempDebate({
        statement: debate.statement,
        summary: data.summary,
        argumentsFor: data.arguments.for,
        argumentsAgainst: data.arguments.against
      });
      toast.success(`Regenerated with "${lens}" lens (not saved)`);
    } catch (err) {
      console.error("Failed to regenerate:", err);
      toast.error("Failed to regenerate debate");
    } finally {
      setRegenerating(false);
    }
  };
  const handleComplexityChange = async (level: ComplexityLevel) => {
    if (level === complexityLevel) return;
    setChangingComplexity(true);
    try {
      const complexityPrompt = level === "simple" ? "Explain like I'm 12 years old - use simple language, everyday examples, and avoid jargon" : level === "academic" ? "Use academic language, technical terminology, and scholarly references" : null;
      if (!complexityPrompt) {
        // Reset to original
        setTempDebate(null);
        setComplexityLevel("default");
        return;
      }
      const {
        data,
        error
      } = await supabase.functions.invoke("generate-arguments", {
        body: {
          statement: debate.statement,
          type: "initial",
          perspectives: [complexityPrompt]
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTempDebate({
        statement: debate.statement,
        summary: data.summary,
        argumentsFor: data.arguments.for,
        argumentsAgainst: data.arguments.against
      });
      setComplexityLevel(level);
      toast.success(level === "simple" ? "Simplified version generated" : "Academic version generated");
    } catch (err) {
      console.error("Failed to change complexity:", err);
      toast.error("Failed to change complexity level");
    } finally {
      setChangingComplexity(false);
    }
  };
  const handleCustomLensSubmit = () => {
    if (customLens.trim()) {
      handleRegenerateWithLens(customLens.trim());
    }
  };
  const clearTempDebate = () => {
    setTempDebate(null);
    setComplexityLevel("default");
  };
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };
  const currentDebate = tempDebate || debate;
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
    addText(`BOTHSIDES: ${currentDebate.statement}`, 16, true);
    y += 5;
    addText("Summary", 13, true);
    addText(currentDebate.summary);
    y += 5;
    addText("Arguments FOR", 13, true);
    currentDebate.argumentsFor.forEach((arg, idx) => {
      addText(`${idx + 1}. ${arg.title || 'Argument'}`, 11, true);
      addText(arg.text);
    });
    y += 5;
    addText("Arguments AGAINST", 13, true);
    currentDebate.argumentsAgainst.forEach((arg, idx) => {
      addText(`${idx + 1}. ${arg.title || 'Argument'}`, 11, true);
      addText(arg.text);
    });
    doc.save(`bothsides-${Date.now()}.pdf`);
  };
  const handleExpandFor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSide(expandedSide === "for" ? null : "for");
  };
  const handleExpandAgainst = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSide(expandedSide === "against" ? null : "against");
  };
  return <div className="space-y-8 animate-page-in">
      <ConclusionSection statement={currentDebate.statement} argumentsFor={currentDebate.argumentsFor} argumentsAgainst={currentDebate.argumentsAgainst} />

      <div className="border border-border bg-card p-4 md:p-6 space-y-4 animate-fade-in pillar-shadow">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-serif font-bold text-xl md:text-2xl text-foreground tracking-wide">
              {currentDebate.statement}
            </h2>
            {tempDebate && <Button variant="ghost" size="sm" onClick={clearTempDebate} className="text-xs shrink-0">
                Back to Original
              </Button>}
          </div>
          <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
            {currentDebate.summary}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2 font-sans text-xs uppercase tracking-wider transition-all duration-200 w-full sm:w-auto hover:bg-accent">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>

            {/* Lens Regeneration Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={regenerating || loadingLenses} className="gap-2 font-sans text-xs uppercase tracking-wider transition-all duration-200 w-full sm:w-auto hover:bg-accent">
                  <RefreshCw className={cn("h-4 w-4", regenerating && "animate-spin")} />
                  {regenerating ? "Regenerating..." : "New Lens"}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {loadingLenses ? <DropdownMenuItem disabled>
                    Loading perspectives...
                  </DropdownMenuItem> : <>
                    {lensOptions.map((lens, idx) => <DropdownMenuItem key={idx} onClick={() => handleRegenerateWithLens(lens)} className="cursor-pointer">
                        {lens}
                      </DropdownMenuItem>)}
                    <DropdownMenuSeparator />
                    {showCustomInput ? <div className="p-2 space-y-2">
                        <Input placeholder="Enter custom lens..." value={customLens} onChange={e => setCustomLens(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCustomLensSubmit()} className="text-sm" autoFocus />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleCustomLensSubmit} disabled={!customLens.trim()} className="flex-1 text-xs bg-greek-gold hover:bg-greek-gold/90 text-foreground">
                            Apply
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => {
                      setShowCustomInput(false);
                      setCustomLens("");
                    }} className="text-xs">
                            Cancel
                          </Button>
                        </div>
                      </div> : <DropdownMenuItem onClick={e => {
                  e.preventDefault();
                  setShowCustomInput(true);
                }} className="cursor-pointer text-muted-foreground">
                        Other (custom lens)...
                      </DropdownMenuItem>}
                  </>}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Complexity Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={changingComplexity} className="gap-2 font-sans text-xs uppercase tracking-wider transition-all duration-200 w-full sm:w-auto hover:bg-accent">
                  <BookOpen className={cn("h-4 w-4", changingComplexity && "animate-pulse")} />
                  {changingComplexity ? "Loading..." : complexityLevel === "simple" ? "Simple" : complexityLevel === "academic" ? "Academic" : "Complexity"}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleComplexityChange("academic")} className={cn("cursor-pointer", complexityLevel === "academic" && "bg-accent")}>
                  📚 Academic Version
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleComplexityChange("default")} className={cn("cursor-pointer", complexityLevel === "default" && "bg-accent")}>
                  ✔️ Default
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleComplexityChange("simple")} className={cn("cursor-pointer", complexityLevel === "simple" && "bg-accent")}>
                  🧒 Explain Like I'm 12
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 font-sans text-xs uppercase tracking-wider transition-all duration-200 w-full sm:w-auto hover:bg-accent">
              <Share2 className="h-4 w-4" />
              Share
            </Button>

            <Button variant="outline" size="sm" onClick={onReset} className="gap-2 font-sans text-xs uppercase tracking-wider transition-all duration-200 w-full sm:w-auto text-foreground font-semibold border-greek-gold bg-amber-800 hover:bg-amber-700">
              <RotateCcw className="h-4 w-4" />
              New Debate
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-8">
        {/* FOR Panel */}
        <div className={cn("transition-all duration-300 ease-in-out relative", expandedSide === "for" ? "lg:w-full" : expandedSide === "against" ? "lg:hidden" : "lg:flex-1")}>
          <div className="border border-for-border bg-for-bg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-2xl text-foreground uppercase tracking-wide flex items-center gap-2">
                <span className="text-greek-gold bg-popover-foreground">⟢</span> FOR
              </h2>
              
              <button onClick={handleExpandFor} className="flex items-center gap-1 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
                {expandedSide === "for" ? <>
                    <ChevronLeft className="h-4 w-4" />
                    <span>Show Both</span>
                    <ChevronRight className="h-4 w-4" />
                  </> : <>
                    <span>Expand</span>
                    <ChevronRight className="h-4 w-4" />
                  </>}
              </button>
            </div>

            <div className="space-y-4">
              {currentDebate.argumentsFor?.map((arg, idx) => <ArgumentCard key={idx} title={arg.title} subheading={arg.subheading} text={arg.text} sources={arg.sources} side="for" onRefute={subPath => onRefute("for", subPath)} refutations={arg.refutations} path={[idx]} />)}
            </div>
            
            {addingArgumentSide === "for" && <div className="text-sm font-body text-muted-foreground italic animate-fade-in">
                Generating argument<span className="animate-pulse">...</span>
              </div>}
            
            <Button onClick={e => {
            e.stopPropagation();
            onAddArgument("for");
          }} variant="outline" className="w-full font-sans text-xs uppercase tracking-wider mt-4 hover:bg-for-hover" disabled={addingArgumentSide === "for" || !!tempDebate}>
              + Add Argument
            </Button>
          </div>
        </div>

        {/* AGAINST Panel */}
        <div className={cn("transition-all duration-300 ease-in-out relative", expandedSide === "against" ? "lg:w-full" : expandedSide === "for" ? "lg:hidden" : "lg:flex-1")}>
          <div className="border border-against-border bg-against-bg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-2xl text-foreground uppercase tracking-wide flex items-center gap-2">
                <span className="text-greek-terracotta">ᯓ</span> AGAINST
              </h2>
              
              <button onClick={handleExpandAgainst} className="flex items-center gap-1 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
                {expandedSide === "against" ? <>
                    <ChevronLeft className="h-4 w-4" />
                    <span>Show Both</span>
                    <ChevronRight className="h-4 w-4" />
                  </> : <>
                    <ChevronLeft className="h-4 w-4" />
                    <span>Expand</span>
                  </>}
              </button>
            </div>

            <div className="space-y-4">
              {currentDebate.argumentsAgainst?.map((arg, idx) => <ArgumentCard key={idx} title={arg.title} subheading={arg.subheading} text={arg.text} sources={arg.sources} side="against" onRefute={subPath => onRefute("against", subPath)} refutations={arg.refutations} path={[idx]} />)}
            </div>
            
            {addingArgumentSide === "against" && <div className="text-sm font-body text-muted-foreground italic animate-fade-in">
                Generating argument<span className="animate-pulse">...</span>
              </div>}
            
            <Button onClick={e => {
            e.stopPropagation();
            onAddArgument("against");
          }} variant="outline" className="w-full font-sans text-xs uppercase tracking-wider mt-4 hover:bg-against-hover" disabled={addingArgumentSide === "against" || !!tempDebate}>
              + Add Argument
            </Button>
          </div>
        </div>
      </div>
    </div>;
};