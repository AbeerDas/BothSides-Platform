import { useEffect, useState } from "react";
import { Scale } from "lucide-react";

const loadingPhrases = [
  "Consulting the Oracle at Delphi...",
  "Gathering arguments from the Academy...",
  "Socrates is questioning everything...",
  "Debating in the Agora of Athens...",
  "Weighing evidence on the scales of reason...",
];

export const LoadingScreen = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % loadingPhrases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background greek-pattern">
      <div className="text-center space-y-8 px-8 max-w-lg">
        <Scale className="h-16 w-16 mx-auto text-greek-gold animate-float" strokeWidth={1.5} />
        <div className="h-16 flex items-center justify-center">
          <p key={currentPhrase} className="font-serif text-xl text-muted-foreground animate-fade-in">
            {loadingPhrases[currentPhrase]}
          </p>
        </div>
        <div className="flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-greek-gold/40 animate-pulse-glow" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
};
