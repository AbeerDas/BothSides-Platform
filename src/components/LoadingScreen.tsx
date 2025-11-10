import { useEffect, useState } from "react";
import { Scale } from "lucide-react";

const loadingPhrases = [
  "Teaching AI to argue like your in-laws at Thanksgiving...",
  "Fact-checking conspiracy theorists with actual facts...",
  "Bribing philosophers with tenure for better arguments...",
  "Downloading all of Reddit (but keeping only the good parts)...",
  "Training debate bots by making them watch cable news...",
  "Asking ChatGPT to disagree with itself...",
  "Forcing economists to use small words...",
  "Making lawyers explain things without billable hours...",
  "Peer-reviewing hot takes from Twitter...",
  "Simulating a debate between your brain cells..."
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
              className={`font-serif text-lg text-muted-foreground transition-all duration-500 absolute max-w-xl text-center ${
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
