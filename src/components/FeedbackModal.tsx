import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle, Lightbulb, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FeedbackData {
  overallScore: number;
  winningStatus?: string;
  categories: {
    name: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
  strengths: string[];
  improvements: string[];
  tips: string[];
  summary: string;
}

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedbackData: FeedbackData | null;
  isLoading: boolean;
}

export function FeedbackModal({ open, onOpenChange, feedbackData, isLoading }: FeedbackModalProps) {
  const isMobile = useIsMobile();

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    if (percentage >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreIcon = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 70) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (percentage >= 40) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getProgressColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-h-[90vh] overflow-y-auto",
        isMobile ? "max-w-[95vw] p-5" : "max-w-5xl p-8"
      )}>
        <DialogHeader>
          <DialogTitle className={cn("font-serif flex items-center gap-2", isMobile ? "text-xl" : "text-2xl")}>
            🏆 Debate Performance
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className={cn("flex flex-col items-center justify-center gap-4", isMobile ? "py-10" : "py-16")}>
            <div className={cn("rounded-full border-4 border-primary/20 border-t-primary animate-spin", isMobile ? "w-14 h-14" : "w-20 h-20")} />
            <p className={cn("text-muted-foreground", isMobile ? "text-base" : "text-lg")}>Analyzing your debate performance...</p>
          </div>
        ) : feedbackData ? (
          <div className={cn("space-y-6", isMobile ? "text-base" : "")}>
            {/* Overall Score - Compact */}
            <div className={cn(
              "text-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20",
              isMobile ? "p-5" : "p-6"
            )}>
              <div className={cn(
                "font-bold font-serif",
                getScoreColor(feedbackData.overallScore, 10),
                isMobile ? "text-5xl" : "text-6xl"
              )}>
                {feedbackData.overallScore.toFixed(1)}
              </div>
              <div className={cn("text-muted-foreground mt-1", isMobile ? "text-xs" : "text-sm")}>out of 10.0</div>
              {feedbackData.winningStatus && (
                <p className={cn("mt-3 text-foreground font-medium", isMobile ? "text-sm" : "text-base")}>
                  {feedbackData.winningStatus}
                </p>
              )}
            </div>

            {/* Category Breakdown - 5 column grid on desktop */}
            <div className="space-y-3">
              <h3 className={cn("font-medium text-muted-foreground uppercase tracking-wide", isMobile ? "text-xs" : "text-xs")}>
                Scoring Breakdown
              </h3>
              <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-5")}>
                {feedbackData.categories.map((category) => (
                  <div key={category.name} className={cn("p-3 bg-muted/30 rounded-lg space-y-2", isMobile ? "p-4" : "p-3")}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("font-medium flex items-center gap-1.5 truncate", isMobile ? "text-sm" : "text-xs")}>
                        {getScoreIcon(category.score, category.maxScore)}
                        <span className="truncate">{category.name}</span>
                      </span>
                      <span className={cn("font-mono shrink-0", getScoreColor(category.score, category.maxScore), isMobile ? "text-sm" : "text-xs")}>
                        {category.score.toFixed(1)}
                      </span>
                    </div>
                    <div className={cn("relative bg-muted rounded-full overflow-hidden", isMobile ? "h-2" : "h-1.5")}>
                      <div 
                        className={cn("absolute h-full rounded-full transition-all duration-500", getProgressColor(category.score, category.maxScore))}
                        style={{ width: `${(category.score / category.maxScore) * 100}%` }}
                      />
                    </div>
                    <p className={cn("text-muted-foreground leading-relaxed", isMobile ? "text-sm" : "text-[11px]")}>{category.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths Row */}
            <div className="space-y-3">
              <h3 className={cn("font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2", isMobile ? "text-xs" : "text-xs")}>
                <CheckCircle className={cn("text-green-500", isMobile ? "h-4 w-4" : "h-3.5 w-3.5")} />
                What You Did Well
              </h3>
              <ul className={cn("space-y-2", isMobile ? "" : "grid grid-cols-2 gap-3 space-y-0")}>
                {feedbackData.strengths.map((strength, i) => (
                  <li key={i} className={cn("pl-3 border-l-2 border-green-500/50 text-foreground/90 leading-relaxed", isMobile ? "text-base" : "text-sm")}>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement Row */}
            <div className="space-y-3">
              <h3 className={cn("font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2", isMobile ? "text-xs" : "text-xs")}>
                <AlertCircle className={cn("text-orange-500", isMobile ? "h-4 w-4" : "h-3.5 w-3.5")} />
                Areas to Strengthen
              </h3>
              <ul className={cn("space-y-2", isMobile ? "" : "grid grid-cols-2 gap-3 space-y-0")}>
                {feedbackData.improvements.map((improvement, i) => (
                  <li key={i} className={cn("pl-3 border-l-2 border-orange-500/50 text-foreground/90 leading-relaxed", isMobile ? "text-base" : "text-sm")}>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Tips Row - Full width, prominent */}
            <div className="space-y-3 bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h3 className={cn("font-medium text-foreground uppercase tracking-wide flex items-center gap-2", isMobile ? "text-sm" : "text-sm")}>
                <Target className={cn("text-primary", isMobile ? "h-5 w-5" : "h-4 w-4")} />
                How to Score 10/10
              </h3>
              <ul className="space-y-3">
                {feedbackData.tips.map((tip, i) => (
                  <li key={i} className={cn("pl-4 border-l-2 border-primary/50 text-foreground leading-relaxed", isMobile ? "text-base" : "text-sm")}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Summary - Compact */}
            <div className={cn("text-center text-muted-foreground italic border-t pt-4", isMobile ? "text-sm" : "text-sm")}>
              {feedbackData.summary}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No feedback data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
