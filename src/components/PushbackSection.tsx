import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PushbackSectionProps {
  statement: string;
}

export const PushbackSection = ({ statement }: PushbackSectionProps) => {
  const [pushbackInput, setPushbackInput] = useState("");
  const [pushbackResult, setPushbackResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePushback = async () => {
    if (!pushbackInput.trim()) {
      toast.error("Please enter a statement to push back on");
      return;
    }

    setIsLoading(true);
    setPushbackResult("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-pushback", {
        body: { 
          statement,
          claim: pushbackInput.trim()
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setPushbackResult(data.pushback);
    } catch (error) {
      console.error("Pushback error:", error);
      toast.error("Failed to generate pushback. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadingPhrases = [
    "Analyzing claim...",
    "Evaluating evidence...",
    "Structuring critique...",
    "Identifying weaknesses...",
  ];

  const [currentPhrase, setCurrentPhrase] = useState(0);

  useState(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentPhrase((prev) => (prev + 1) % loadingPhrases.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  });

  return (
    <Card className="p-8 bg-card border-2 border-border shadow-elegant">
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-foreground uppercase tracking-tight border-b-2 border-foreground pb-3 mb-4">
            Pushback
          </h3>
          <p className="text-sm font-body text-muted-foreground">
            Enter a claim or statement to receive a critical counterargument
          </p>
        </div>
        
        <div className="flex gap-3">
          <Input
            value={pushbackInput}
            onChange={(e) => setPushbackInput(e.target.value)}
            placeholder="Enter a claim to challenge..."
            className="flex-1 font-sans border-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handlePushback();
              }
            }}
          />
          <Button
            onClick={handlePushback}
            disabled={isLoading}
            className="gap-2 font-sans text-xs uppercase tracking-wider"
          >
            <MessageSquare className="h-4 w-4" />
            {isLoading ? "Analyzing..." : "Pushback"}
          </Button>
        </div>

        {isLoading && (
          <div className="animate-in fade-in duration-300">
            <p className="text-sm font-body text-muted-foreground italic">
              {loadingPhrases[currentPhrase]}
            </p>
          </div>
        )}

        {pushbackResult && !isLoading && (
          <Card className="p-6 bg-muted border border-border animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-base font-body leading-relaxed text-foreground">
              {pushbackResult}
            </p>
          </Card>
        )}
      </div>
    </Card>
  );
};
