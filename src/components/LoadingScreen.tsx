import { useEffect, useState } from "react";
import { Scale } from "lucide-react";

const loadingPhrases = [
  "Teaching AI the ancient art of arguing productively...",
  "Consulting both sides of the brain for maximum objectivity...",
  "Downloading critical thinking skills from the cloud...",
  "Convincing the algorithm that nuance actually matters...",
  "Generating perspectives faster than Twitter generates hot takes...",
  "Brewing a fresh pot of intellectual discourse...",
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
        <div className="space-y-2 h-16 flex items-center justify-center px-4">
          {loadingPhrases.map((phrase, idx) => (
            <p
              key={phrase}
              className={`font-serif text-lg text-muted-foreground transition-all duration-500 absolute max-w-2xl text-center ${
                idx === currentPhrase ? "opacity-100" : "opacity-0"
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
