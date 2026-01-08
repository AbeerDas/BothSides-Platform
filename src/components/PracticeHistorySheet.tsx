import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PracticeDebate {
  id: string;
  title: string;
  messages: { role: string; content: string }[];
  latest_score: number | null;
  created_at: string;
  updated_at: string;
}

interface PracticeHistorySheetProps {
  debates: PracticeDebate[];
  currentDebateId: string | null;
  onSelectDebate: (debate: PracticeDebate) => void;
  onDeleteDebate: (id: string) => void;
  onNewDebate: () => void;
  isLoading: boolean;
}

export function PracticeHistorySheet({
  debates,
  currentDebateId,
  onSelectDebate,
  onDeleteDebate,
  onNewDebate,
  isLoading,
}: PracticeHistorySheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <History className="h-3.5 w-3.5 mr-1.5" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="font-serif">Practice Debates</SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-3">
          <Button onClick={onNewDebate} className="w-full" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            New Debate
          </Button>

          <ScrollArea className="h-[calc(100vh-180px)]">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : debates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No saved debates yet
              </div>
            ) : (
              <div className="space-y-2 pr-2">
                {debates.map((debate) => (
                  <div
                    key={debate.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 group",
                      currentDebateId === debate.id && "bg-muted border-primary"
                    )}
                    onClick={() => onSelectDebate(debate)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{debate.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(debate.updated_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {debate.messages.length} messages
                          </span>
                          {debate.latest_score && (
                            <span className={cn(
                              "text-xs font-medium",
                              debate.latest_score >= 7 ? "text-green-500" :
                              debate.latest_score >= 5 ? "text-yellow-500" : "text-red-500"
                            )}>
                              Score: {debate.latest_score.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDebate(debate.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}