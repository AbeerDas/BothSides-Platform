import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ArrowRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface Statement {
  statement: string;
  context?: string;
  rationale?: string;
}

interface StatementDiscoveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statements: Statement[];
  isLoading: boolean;
  onSelectStatement: (statement: string) => void;
  source?: "text" | "news";
  headline?: string;
}

export const StatementDiscoveryModal = ({
  open,
  onOpenChange,
  statements,
  isLoading,
  onSelectStatement,
  source = "text",
  headline
}: StatementDiscoveryModalProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleSelect = (statement: string) => {
    onSelectStatement(statement);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <Sparkles className="h-5 w-5 text-greek-gold" />
            {source === "news" ? "Debate This Story" : "Discover Debatable Ideas"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {source === "news" 
              ? `We analyzed "${headline?.slice(0, 60)}${headline && headline.length > 60 ? '...' : ''}" and found these debate-worthy perspectives.`
              : "We analyzed your text and found multiple debatable ideas worth exploring. Select one to generate a balanced debate."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-greek-gold" />
              <p className="text-sm text-muted-foreground">Analyzing for debatable claims...</p>
            </div>
          ) : statements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Lightbulb className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No debatable statements found. Try different content.</p>
            </div>
          ) : (
            statements.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSelect(item.statement)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "w-full text-left p-4 border border-border/60 bg-card transition-all duration-200 group",
                  "hover:border-greek-gold/50 hover:bg-accent/30",
                  hoveredIndex === index && "border-greek-gold/50 bg-accent/30"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <p className="font-serif text-foreground leading-relaxed">
                      {item.statement}
                    </p>
                    {(item.context || item.rationale) && (
                      <p className="text-xs text-muted-foreground">
                        {item.context || item.rationale}
                      </p>
                    )}
                  </div>
                  <ArrowRight className={cn(
                    "h-4 w-4 mt-1 shrink-0 transition-all duration-200",
                    hoveredIndex === index 
                      ? "text-greek-gold translate-x-1" 
                      : "text-muted-foreground/50"
                  )} />
                </div>
              </button>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
