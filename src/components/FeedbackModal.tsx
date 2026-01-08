import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";

interface FeedbackData {
  overallScore: number;
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
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            🏆 Debate Performance
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Analyzing your debate performance...</p>
          </div>
        ) : feedbackData ? (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className={cn(
                "text-5xl font-bold font-serif",
                getScoreColor(feedbackData.overallScore, 10)
              )}>
                {feedbackData.overallScore.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">out of 10.0</div>
              <p className="text-sm mt-3 text-foreground/80">{feedbackData.summary}</p>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Scoring Breakdown
              </h3>
              {feedbackData.categories.map((category) => (
                <div key={category.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium flex items-center gap-2">
                      {getScoreIcon(category.score, category.maxScore)}
                      {category.name}
                    </span>
                    <span className={cn("font-mono", getScoreColor(category.score, category.maxScore))}>
                      {category.score.toFixed(1)}/{category.maxScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("absolute h-full rounded-full transition-all duration-500", getProgressColor(category.score, category.maxScore))}
                      style={{ width: `${(category.score / category.maxScore) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{category.feedback}</p>
                </div>
              ))}
            </div>

            {/* Strengths */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Strengths
              </h3>
              <ul className="space-y-1.5">
                {feedbackData.strengths.map((strength, i) => (
                  <li key={i} className="text-sm pl-4 border-l-2 border-green-500/50 text-foreground/90">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Areas to Improve
              </h3>
              <ul className="space-y-1.5">
                {feedbackData.improvements.map((improvement, i) => (
                  <li key={i} className="text-sm pl-4 border-l-2 border-orange-500/50 text-foreground/90">
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Pro Tips
              </h3>
              <ul className="space-y-1.5">
                {feedbackData.tips.map((tip, i) => (
                  <li key={i} className="text-sm pl-4 border-l-2 border-primary/50 text-foreground/90">
                    {tip}
                  </li>
                ))}
              </ul>
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