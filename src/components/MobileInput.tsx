import { useState } from "react";
import { ArrowUp, MoreHorizontal, Plus, Dices, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
const PERSPECTIVES = ["Economist", "Philosopher", "Ethicist", "Historian", "Psychologist", "Sociologist", "Climate Scientist", "Tech Ethicist", "Constitutional Scholar", "Medical Professional", "Urban Planner", "Anthropologist", "Data Scientist", "Legal Scholar", "Theologian", "Military Strategist", "Entrepreneur", "Epidemiologist", "Journalist", "Human Rights Advocate"];
const RANDOM_TOPICS = ["LeBron James is better than Michael Jordan", "Remote work is more productive than office work", "Social media does more harm than good", "Universal basic income should be implemented", "AI will create more jobs than it destroys", "College education is overrated", "Cryptocurrency will replace traditional currency", "Space exploration is worth the investment"];
interface MobileInputProps {
  statement: string;
  setStatement: (value: string) => void;
  perspectives: string[];
  setPerspectives: (value: string[]) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}
export const MobileInput = ({
  statement,
  setStatement,
  perspectives,
  setPerspectives,
  onGenerate,
  isGenerating
}: MobileInputProps) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showPerspectiveModal, setShowPerspectiveModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const handleRandomTopic = () => {
    const topic = RANDOM_TOPICS[Math.floor(Math.random() * RANDOM_TOPICS.length)];
    setStatement(topic);
    setShowOptionsModal(false);
  };
  const addPerspective = (perspective: string) => {
    if (!perspectives.includes(perspective)) {
      setPerspectives([...perspectives, perspective]);
    }
  };
  const removePerspective = (perspective: string) => {
    setPerspectives(perspectives.filter(p => p !== perspective));
  };
  const filteredPerspectives = PERSPECTIVES.filter(p => p.toLowerCase().includes(searchValue.toLowerCase()) && !perspectives.includes(p));
  return <>
      {/* Fixed bottom input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40">
        {/* Perspective pills */}
        {perspectives.length > 0 && <div className="flex flex-wrap gap-2 mb-3">
            {perspectives.map(p => <span key={p} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground text-xs border border-border">
                {p}
                <button onClick={() => removePerspective(p)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>)}
          </div>}

        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea 
              value={statement} 
              onChange={e => setStatement(e.target.value)} 
              className="min-h-[52px] max-h-[140px] resize-none text-base py-3.5 px-4" 
              rows={1} 
              placeholder="LeBron is better than MJ..." 
            />
          </div>
          
          <Button variant="outline" size="icon" onClick={() => setShowOptionsModal(true)} className="h-12 w-12 shrink-0">
            <MoreHorizontal className="h-5 w-5" />
          </Button>

          <Button onClick={onGenerate} disabled={!statement.trim() || isGenerating} size="icon" className="h-12 w-12 shrink-0 bg-amber-800 hover:bg-amber-700 text-white">
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Options Modal */}
      <Dialog open={showOptionsModal} onOpenChange={setShowOptionsModal}>
        <DialogContent className="max-w-[90vw] w-full">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Button variant="outline" className="w-full justify-start gap-3" onClick={() => {
            setShowOptionsModal(false);
            setShowPerspectiveModal(true);
          }}>
              <Plus className="h-4 w-4" />
              Add Perspective
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" onClick={handleRandomTopic}>
              <Dices className="h-4 w-4" />
              Random Topic
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Perspective Modal */}
      <Dialog open={showPerspectiveModal} onOpenChange={setShowPerspectiveModal}>
        <DialogContent className="max-w-[90vw] w-full max-h-[70vh]">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Add Perspective</DialogTitle>
          </DialogHeader>
          <Command className="border border-border">
            <CommandInput placeholder="Search perspectives..." value={searchValue} onValueChange={setSearchValue} />
            <CommandList className="max-h-[40vh]">
              <CommandEmpty>No perspectives found.</CommandEmpty>
              <CommandGroup>
                {filteredPerspectives.map(perspective => <CommandItem key={perspective} value={perspective} onSelect={() => {
                addPerspective(perspective);
                setShowPerspectiveModal(false);
                setSearchValue("");
              }} className="cursor-pointer">
                    {perspective}
                  </CommandItem>)}
              </CommandGroup>
            </CommandList>
          </Command>
          {searchValue && !PERSPECTIVES.some(p => p.toLowerCase() === searchValue.toLowerCase()) && <Button variant="outline" size="sm" onClick={() => {
          addPerspective(searchValue);
          setShowPerspectiveModal(false);
          setSearchValue("");
        }} className="w-full mt-2">
              Add "{searchValue}" as custom perspective
            </Button>}
        </DialogContent>
      </Dialog>
    </>;
};