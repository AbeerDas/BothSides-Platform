import { useEffect, useState } from "react";
import { Scale } from "lucide-react";

const loadingPhrases = [
  "Consulting the Oracle at Delphi for wisdom...",
  "Gathering arguments from Plato's Academy...",
  "Aristotle is organizing the dialectic...",
  "Socrates is questioning everything...",
  "The Stoics are contemplating your proposition...",
  "Debating in the Agora of Athens...",
  "Seeking truth through philosophical discourse...",
  "The sophists are preparing their rebuttals...",
  "Channeling the spirit of Heraclitus...",
  "Weighing evidence on the scales of reason...",
  "Epicurus suggests we consider all pleasures...",
  "Diogenes is looking for an honest argument...",
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
      {/* Decorative columns */}
      <div className="fixed left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-greek-gold/20 to-transparent" />
      <div className="fixed right-8 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-greek-gold/20 to-transparent" />
      
      <div className="text-center space-y-12 animate-fade-in px-8 max-w-3xl">
        {/* Greek laurel wreath decoration */}
        <div className="relative">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-greek-gold/40 text-6xl">
            ⟡
          </div>
          <div className="animate-float">
            <Scale className="h-20 w-20 mx-auto text-greek-gold" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-greek-gold/40 text-4xl">
            ☽ ⟢ ☾
          </div>
        </div>
        
        {/* Loading phrases container with better spacing */}
        <div className="relative h-24 flex items-center justify-center overflow-hidden">
          {loadingPhrases.map((phrase, idx) => (
            <p
              key={phrase}
              className={`font-serif text-xl md:text-2xl text-muted-foreground transition-all duration-700 absolute w-full text-center leading-relaxed px-4 ${
                idx === currentPhrase 
                  ? "opacity-100 transform translate-y-0" 
                  : "opacity-0 transform translate-y-4"
              }`}
            >
              {phrase}
            </p>
          ))}
        </div>

        {/* Decorative Greek key pattern */}
        <div className="flex items-center justify-center gap-2 text-greek-gold/30">
          <span className="text-2xl">⟨</span>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-greek-gold/40 to-transparent" />
          <span className="text-xl animate-pulse-glow">◇</span>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-greek-gold/40 to-transparent" />
          <span className="text-2xl">⟩</span>
        </div>

        <p className="font-body text-sm text-muted-foreground/60 italic">
          "The only true wisdom is in knowing you know nothing" — Socrates
        </p>
      </div>
    </div>
  );
};
