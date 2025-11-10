import { useEffect, useState } from "react";
import { Scale } from "lucide-react";

const loadingPhrases = [
  "Analyzing top sources...",
  "Structuring best arguments...",
  "Evaluating opposing claims...",
  "Refining citations...",
  "Building evidence chains...",
  "Cross-referencing perspectives..."
];

export const LoadingScreen = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % loadingPhrases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8 animate-fade-in">
        <div className="animate-bounce-slow">
          <Scale className="h-16 w-16 mx-auto text-foreground" />
        </div>
        <div className="space-y-2">
          {loadingPhrases.map((phrase, idx) => (
            <p
              key={phrase}
              className={`font-serif text-lg text-muted-foreground transition-all duration-500 ${
                idx === currentPhrase ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 absolute"
              }`}
            >
              {phrase}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
