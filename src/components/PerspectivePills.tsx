import { useState } from "react";
import { X, Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const RANDOM_PERSPECTIVES = ["Economist", "Philosopher", "Ethicist", "Historian", "Psychologist", "Sociologist", "Climate Scientist", "Tech Ethicist", "Constitutional Scholar", "Medical Professional", "Urban Planner", "Anthropologist", "Data Scientist", "Legal Scholar", "Theologian", "Military Strategist", "Entrepreneur", "Epidemiologist", "Journalist", "Human Rights Advocate"];
interface PerspectivePillsProps {
  perspectives: string[];
  onChange: (perspectives: string[]) => void;
}
export const PerspectivePills = ({
  perspectives,
  onChange
}: PerspectivePillsProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const addPerspective = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !perspectives.includes(trimmed)) {
      onChange([...perspectives, trimmed]);
      setInputValue("");
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPerspective();
    }
  };
  const removePerspective = (perspective: string) => {
    onChange(perspectives.filter(p => p !== perspective));
  };
  const addRandomPerspective = async () => {
    setIsGenerating(true);
    try {
      // Try to get AI-generated perspective
      const {
        data,
        error
      } = await supabase.functions.invoke("generate-arguments", {
        body: {
          type: "random-perspective",
          existingPerspectives: perspectives
        }
      });
      if (error || data?.error) {
        // Fallback to local random selection
        const available = RANDOM_PERSPECTIVES.filter(p => !perspectives.includes(p));
        if (available.length === 0) {
          toast.info("All common perspectives already added");
          return;
        }
        const randomPerspective = available[Math.floor(Math.random() * available.length)];
        onChange([...perspectives, randomPerspective]);
      } else if (data?.perspective) {
        if (!perspectives.includes(data.perspective)) {
          onChange([...perspectives, data.perspective]);
        }
      }
    } catch {
      // Fallback to local random selection
      const available = RANDOM_PERSPECTIVES.filter(p => !perspectives.includes(p));
      if (available.length > 0) {
        const randomPerspective = available[Math.floor(Math.random() * available.length)];
        onChange([...perspectives, randomPerspective]);
      }
    } finally {
      setIsGenerating(false);
    }
  };
  return <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 flex gap-2">
          <Input placeholder="Add a perspective (e.g., Economist, Philosopher)..." value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 font-sans border-2" />
          <Button size="sm" onClick={addPerspective} disabled={!inputValue.trim()} className="font-sans text-xs uppercase tracking-wider whitespace-nowrap bg-amber-800 hover:bg-amber-700 text-slate-50">
            Add
          </Button>
        </div>
        
        <Button size="sm" variant="outline" onClick={addRandomPerspective} disabled={isGenerating} className="font-sans text-xs uppercase tracking-wider gap-2 whitespace-nowrap">
          <Dices className="h-4 w-4" />
          {isGenerating ? "..." : "Random"}
        </Button>
      </div>

      {perspectives.length > 0 && <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
          {perspectives.map(perspective => <div key={perspective} className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary text-foreground text-sm font-sans border border-border animate-in fade-in duration-200 hover:bg-muted transition-colors rounded-sm">
              <span>{perspective}</span>
              <button onClick={() => removePerspective(perspective)} className="hover:text-destructive transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>)}
        </div>}
    </div>;
};