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
  "Climate Scientist",
  "Philosopher",
  "Journalist",
  "Political Strategist",
  "Sociologist",
  "Historian",
  "Legal Scholar",
  "Tech Expert",
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
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Add perspective..." />
          </SelectTrigger>
          <SelectContent>
            {PRESET_PERSPECTIVES.map((p) => (
              <SelectItem key={p} value={p} disabled={perspectives.includes(p)}>
                {p}
              </SelectItem>
            ))}
            <SelectItem value="other">Other (custom)...</SelectItem>
          </SelectContent>
        </Select>

        {showCustomInput && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
            <Input
              placeholder="Enter custom perspective..."
              value={customPerspective}
              onChange={(e) => setCustomPerspective(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomPerspective()}
              className="w-[200px]"
            />
            <Button
              size="sm"
              onClick={addCustomPerspective}
              disabled={!customPerspective.trim()}
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 animate-in fade-in scale-in duration-200 hover:bg-primary/15 transition-colors"
            >
              <span>{perspective}</span>
              <button
                onClick={() => removePerspective(perspective)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
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
