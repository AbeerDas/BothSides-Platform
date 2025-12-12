import { useState } from "react";
import { Plus, Dices, X, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const PERSPECTIVES = [
  "Economist", "Philosopher", "Ethicist", "Historian", "Psychologist",
  "Sociologist", "Climate Scientist", "Tech Ethicist", "Constitutional Scholar",
  "Medical Professional", "Urban Planner", "Anthropologist", "Data Scientist",
  "Legal Scholar", "Theologian", "Military Strategist", "Entrepreneur",
  "Epidemiologist", "Journalist", "Human Rights Advocate", "Futurist",
  "Game Theorist", "Devil's Advocate", "Utilitarian", "Libertarian",
  "Conservative", "Progressive", "Environmentalist", "Capitalist"
];

interface PerspectivePillsProps {
  perspectives: string[];
  onChange: (perspectives: string[]) => void;
  className?: string;
}

export const PerspectivePills = ({
  perspectives,
  onChange,
  className
}: PerspectivePillsProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const addPerspective = (perspective: string) => {
    if (!perspectives.includes(perspective)) {
      onChange([...perspectives, perspective]);
    }
    setSearchValue("");
    setOpen(false);
  };

  const removePerspective = (perspective: string) => {
    onChange(perspectives.filter(p => p !== perspective));
  };

  const addRandomPerspective = () => {
    const available = PERSPECTIVES.filter(p => !perspectives.includes(p));
    if (available.length === 0) return;
    const random = available[Math.floor(Math.random() * available.length)];
    onChange([...perspectives, random]);
  };

  const filteredPerspectives = PERSPECTIVES.filter(p => 
    p.toLowerCase().includes(searchValue.toLowerCase()) && !perspectives.includes(p)
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 h-8 font-sans text-xs"
          >
            <Plus className="h-3 w-3" />
            Add Perspective
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search perspectives..." 
              value={searchValue}
              onValueChange={setSearchValue}
              className="text-sm"
            />
            <CommandList className="max-h-48">
              <CommandEmpty>
                {searchValue && (
                  <button
                    onClick={() => addPerspective(searchValue)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    Add "{searchValue}"
                  </button>
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredPerspectives.map(perspective => (
                  <CommandItem
                    key={perspective}
                    value={perspective}
                    onSelect={() => addPerspective(perspective)}
                    className="cursor-pointer text-sm"
                  >
                    {perspective}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="sm"
        onClick={addRandomPerspective}
        className="h-8 px-2 text-muted-foreground hover:text-foreground"
        title="Add random perspective"
      >
        <Dices className="h-4 w-4" />
      </Button>
    </div>
  );
};