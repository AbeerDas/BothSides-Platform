import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRESET_PERSPECTIVES = [
  "Economist",
  "Libertarian",
  "Socialist",
  "Conservative",
  "Progressive",
  "Climate Scientist",
  "Philosopher",
  "Ethicist",
  "Political Strategist",
  "Tech Ethicist",
  "Public Health Expert",
  "Constitutional Scholar",
  "Social Justice Advocate",
  "Business Leader",
  "Environmental Activist",
  "Civil Rights Attorney",
  "Data Scientist",
  "Education Reformer",
  "Foreign Policy Analyst",
  "Military Strategist",
  "National Security Expert",
  "Historian",
  "Journalist",
  "Investigative Reporter",
  "Medical Professional",
  "Religious Scholar",
  "Theologian",
  "Urban Planner",
  "Architect",
  "Psychologist",
  "Sociologist",
  "Anthropologist",
  "Legal Scholar",
  "Human Rights Advocate",
  "Trade Unionist",
  "Entrepreneur",
  "Venture Capitalist",
  "Statistician",
  "Epidemiologist",
];

interface PerspectivePillsProps {
  perspectives: string[];
  onChange: (perspectives: string[]) => void;
}

export const PerspectivePills = ({ perspectives, onChange }: PerspectivePillsProps) => {
  const [customPerspective, setCustomPerspective] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const addPerspective = (perspective: string) => {
    if (perspective === "other") {
      setShowCustomInput(true);
      return;
    }
    if (!perspectives.includes(perspective)) {
      onChange([...perspectives, perspective]);
    }
  };

  const addCustomPerspective = () => {
    if (customPerspective.trim() && !perspectives.includes(customPerspective.trim())) {
      onChange([...perspectives, customPerspective.trim()]);
      setCustomPerspective("");
      setShowCustomInput(false);
    }
  };

  const removePerspective = (perspective: string) => {
    onChange(perspectives.filter((p) => p !== perspective));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select onValueChange={addPerspective}>
          <SelectTrigger className="w-[280px] font-sans border-2">
            <SelectValue placeholder="Add perspective..." />
          </SelectTrigger>
          <SelectContent>
            {PRESET_PERSPECTIVES.map((p) => (
              <SelectItem key={p} value={p} disabled={perspectives.includes(p)} className="font-sans">
                {p}
              </SelectItem>
            ))}
            <SelectItem value="other" className="font-sans">Other (custom)...</SelectItem>
          </SelectContent>
        </Select>

        {showCustomInput && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
            <Input
              placeholder="Enter custom perspective..."
              value={customPerspective}
              onChange={(e) => setCustomPerspective(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomPerspective()}
              className="w-[200px] font-sans border-2"
            />
            <Button
              size="sm"
              onClick={addCustomPerspective}
              disabled={!customPerspective.trim()}
              className="font-sans text-xs uppercase tracking-wider"
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowCustomInput(false);
                setCustomPerspective("");
              }}
              className="font-sans text-xs uppercase tracking-wider"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {perspectives.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
          {perspectives.map((perspective) => (
            <div
              key={perspective}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground text-sm font-sans border border-border animate-in fade-in duration-200 hover:bg-muted transition-colors"
            >
              <span>{perspective}</span>
              <button
                onClick={() => removePerspective(perspective)}
                className="hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
