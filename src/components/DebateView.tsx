import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArgumentCard } from "./ArgumentCard";
import { ConclusionSection } from "./ConclusionSection";
import { Download, RotateCcw, ChevronLeft, ChevronRight, RefreshCw, ChevronDown, Share2, BookOpen, Heart, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
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
  const [allPointsExpanded, setAllPointsExpanded] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchLensOptions = async () => {
      setLoadingLenses(true);
      try {
        const { data, error } = await supabase.functions.invoke("generate-arguments", {
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
      const { data, error } = await supabase.functions.invoke("generate-arguments", {
        body: {
          statement: debate.statement,
          type: "initial",
          perspectives: [lens]
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
      const complexityPrompt = level === "simple" 
        ? "Explain like I'm 12 years old - use simple language, everyday examples, and avoid jargon" 
        : level === "academic" 
          ? "Use academic language, technical terminology, and scholarly references" 
          : null;
      
      if (!complexityPrompt) {
        setTempDebate(null);
        setComplexityLevel("default");
        return;
      }

      const { data, error } = await supabase.functions.invoke("generate-arguments", {
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

  const toggleAllPoints = () => {
    setAllPointsExpanded(!allPointsExpanded);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ConclusionSection 
        key={`${currentDebate.statement}-${currentDebate.argumentsFor.length}-${currentDebate.argumentsAgainst.length}`}
        statement={currentDebate.statement} 
        argumentsFor={currentDebate.argumentsFor} 
        argumentsAgainst={currentDebate.argumentsAgainst} 
      />

      <div className="border border-border bg-card p-5 space-y-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-serif font-medium text-xl text-foreground">
              {currentDebate.statement}
            </h2>
            {tempDebate && (
              <Button variant="ghost" size="sm" onClick={clearTempDebate} className="text-xs shrink-0">
                Back to Original
              </Button>
            )}
          </div>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            {currentDebate.summary}
          </p>
          
          {/* Action buttons - reordered */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {/* Share */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare} 
                className="gap-1.5 font-sans text-[10px] uppercase tracking-wider hover:bg-accent h-8"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>

              {/* Complexity */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={changingComplexity} 
                    className="gap-1.5 font-sans text-[10px] uppercase tracking-wider hover:bg-accent h-8"
                  >
                    <BookOpen className={cn("h-3.5 w-3.5", changingComplexity && "animate-pulse")} />
                    {changingComplexity ? "..." : complexityLevel === "simple" ? "Simple" : complexityLevel === "academic" ? "Academic" : "Complexity"}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem 
                    onClick={() => handleComplexityChange("academic")} 
                    className={cn("cursor-pointer text-xs", complexityLevel === "academic" && "bg-accent")}
                  >
                    📚 Academic
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleComplexityChange("default")} 
                    className={cn("cursor-pointer text-xs", complexityLevel === "default" && "bg-accent")}
                  >
                    ✔️ Default
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleComplexityChange("simple")} 
                    className={cn("cursor-pointer text-xs", complexityLevel === "simple" && "bg-accent")}
                  >
                    🧒 Simple
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* New Lens */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={regenerating || loadingLenses} 
                    className="gap-1.5 font-sans text-[10px] uppercase tracking-wider hover:bg-accent h-8"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", regenerating && "animate-spin")} />
                    {regenerating ? "..." : "Lens"}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {loadingLenses ? (
                    <DropdownMenuItem disabled className="text-xs">Loading...</DropdownMenuItem>
                  ) : (
                    <>
                      {lensOptions.map((lens, idx) => (
                        <DropdownMenuItem 
                          key={idx} 
                          onClick={() => handleRegenerateWithLens(lens)} 
                          className="cursor-pointer text-xs"
                        >
                          {lens}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      {showCustomInput ? (
                        <div className="p-2 space-y-2">
                          <Input 
                            placeholder="Custom lens..." 
                            value={customLens} 
                            onChange={e => setCustomLens(e.target.value)} 
                            onKeyDown={e => e.key === "Enter" && handleCustomLensSubmit()} 
                            className="text-xs h-8" 
                            autoFocus 
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={handleCustomLensSubmit} 
                              disabled={!customLens.trim()} 
                              className="flex-1 text-xs bg-amber-800 hover:bg-amber-700 text-white h-7"
                            >
                              Apply
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => { setShowCustomInput(false); setCustomLens(""); }} 
                              className="text-xs h-7"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <DropdownMenuItem 
                          onClick={e => { e.preventDefault(); setShowCustomInput(true); }} 
                          className="cursor-pointer text-xs text-muted-foreground"
                        >
                          Other...
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPDF} 
                className="gap-1.5 font-sans text-[10px] uppercase tracking-wider hover:bg-accent h-8"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>

              {/* New Debate */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onReset} 
                className="gap-1.5 font-sans text-[10px] uppercase tracking-wider bg-amber-800 hover:bg-amber-700 text-white h-8"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                New
              </Button>
            </div>

            {/* Heart button - far right */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
              className={cn(
                "h-8 w-8 p-0",
                isLiked && "text-red-500"
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* FOR Panel */}
        <div className={cn(
          "transition-all duration-300 ease-in-out relative",
          expandedSide === "for" ? "lg:w-full" : expandedSide === "against" ? "lg:hidden" : "lg:flex-1"
        )}>
          <div className="border border-for-border bg-for-bg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-medium text-lg text-foreground uppercase tracking-wide flex items-center gap-2">
                <span className="text-foreground">⟢</span> FOR
              </h2>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAllPoints}
                  className="flex items-center gap-1 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
                  title={allPointsExpanded ? "Collapse all points" : "Expand all points"}
                >
                  {allPointsExpanded ? (
                    <ChevronsDownUp className="h-4 w-4" />
                  ) : (
                    <ChevronsUpDown className="h-4 w-4" />
                  )}
                </button>
                <button 
                  onClick={handleExpandFor} 
                  className="flex items-center gap-1 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedSide === "for" ? (
                    <>
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Both</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Expand</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {currentDebate.argumentsFor?.map((arg, idx) => (
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
                  forceExpanded={allPointsExpanded}
                />
              ))}
            </div>
            
            {addingArgumentSide === "for" && (
              <div className="text-xs font-body text-muted-foreground italic animate-fade-in">
                Generating argument<span className="animate-pulse">...</span>
              </div>
            )}
            
            <Button 
              onClick={e => { e.stopPropagation(); onAddArgument("for"); }} 
              variant="outline" 
              className="w-full font-sans text-xs uppercase tracking-wider mt-3 hover:bg-for-hover h-9" 
              disabled={addingArgumentSide === "for" || !!tempDebate}
            >
              + Add Argument
            </Button>
          </div>
        </div>

        {/* AGAINST Panel */}
        <div className={cn(
          "transition-all duration-300 ease-in-out relative",
          expandedSide === "against" ? "lg:w-full" : expandedSide === "for" ? "lg:hidden" : "lg:flex-1"
        )}>
          <div className="border border-against-border bg-against-bg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-medium text-lg text-foreground uppercase tracking-wide flex items-center gap-2">
                <span className="text-greek-terracotta">ᯓ</span> AGAINST
              </h2>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAllPoints}
                  className="flex items-center gap-1 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
                  title={allPointsExpanded ? "Collapse all points" : "Expand all points"}
                >
                  {allPointsExpanded ? (
                    <ChevronsDownUp className="h-4 w-4" />
                  ) : (
                    <ChevronsUpDown className="h-4 w-4" />
                  )}
                </button>
                <button 
                  onClick={handleExpandAgainst} 
                  className="flex items-center gap-1 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedSide === "against" ? (
                    <>
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Both</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Expand</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {currentDebate.argumentsAgainst?.map((arg, idx) => (
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
                  forceExpanded={allPointsExpanded}
                />
              ))}
            </div>
            
            {addingArgumentSide === "against" && (
              <div className="text-xs font-body text-muted-foreground italic animate-fade-in">
                Generating argument<span className="animate-pulse">...</span>
              </div>
            )}
            
            <Button 
              onClick={e => { e.stopPropagation(); onAddArgument("against"); }} 
              variant="outline" 
              className="w-full font-sans text-xs uppercase tracking-wider mt-3 hover:bg-against-hover h-9" 
              disabled={addingArgumentSide === "against" || !!tempDebate}
            >
              + Add Argument
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
