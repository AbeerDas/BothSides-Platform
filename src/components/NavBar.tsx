import { useEffect, useState } from "react";
import { Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { RecentLogsDropdown } from "./RecentLogsDropdown";
export const NavBar = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  const handleLogoClick = () => {
    navigate("/");
  };
  return <nav className="border-b border-border bg-card/80 backdrop-blur-sm meander-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={handleLogoClick} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <Scale className="h-7 w-7 text-greek-gold" />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-px bg-gradient-to-r from-transparent via-greek-gold/50 to-transparent" />
            </div>
            <h1 className="font-serif font-bold text-2xl text-foreground tracking">
              BothSides
            </h1>
          </button>

          <div className="flex items-center gap-4">
            <RecentLogsDropdown />
            
            <Button variant="ghost" onClick={() => navigate("/public")} className="text-sm hover:bg-transparent hover:underline text-gray-950">
              Public Debates
            </Button>

            {user ? <Button variant="ghost" onClick={handleSignOut} className="text-sm text-sky-600 hover:text-sky-700 hover:bg-transparent hover:underline">
                Sign Out
              </Button> : <Button variant="ghost" onClick={() => navigate("/auth")} className="text-sm text-sky-600 hover:text-sky-700 hover:bg-transparent hover:underline">
                Sign In
              </Button>}
          </div>
        </div>
      </div>
    </nav>;
};