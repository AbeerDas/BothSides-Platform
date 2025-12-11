import { useState } from "react";
import { Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const addRandomPerspective = () => {
    const available = RANDOM_PERSPECTIVES.filter(p => !perspectives.includes(p));
    if (available.length === 0) {
      toast.info("All common perspectives already added");
      return;
    }
    const randomPerspective = available[Math.floor(Math.random() * available.length)];
    onChange([...perspectives, randomPerspective]);
  };

  return (
    <div className="flex items-center gap-2">
      <Input 
        placeholder="Add perspective (e.g., Economist)..." 
        value={inputValue} 
        onChange={e => setInputValue(e.target.value)} 
        onKeyDown={handleKeyDown} 
        className="flex-1 font-sans text-sm h-9" 
      />
      <Button 
        size="sm" 
        variant="outline"
        onClick={addPerspective} 
        disabled={!inputValue.trim()} 
        className="font-sans text-xs uppercase tracking-wider whitespace-nowrap h-9"
      >
        Add
      </Button>
      <Button 
        size="sm" 
        variant="ghost"
        onClick={addRandomPerspective} 
        className="font-sans text-xs text-muted-foreground hover:text-foreground h-9 px-2"
        title="Add random perspective"
      >
        <Dices className="h-4 w-4" />
      </Button>
    </div>
  );
};