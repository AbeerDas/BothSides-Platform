import { Scale } from "lucide-react";
import { Link } from "react-router-dom";

export const NavBar = () => {
  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="flex items-center gap-3 w-fit">
          <Scale className="h-6 w-6 text-foreground" />
          <h1 className="font-serif font-bold text-2xl text-foreground uppercase tracking-tight">
            DIALECTIC
          </h1>
        </Link>
      </div>
    </nav>
  );
};
