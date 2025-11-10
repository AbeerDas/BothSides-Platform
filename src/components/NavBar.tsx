import { useEffect, useState } from "react";
import { Scale } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
  return <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-foreground" />
            <h1 className="font-serif font-bold text-2xl text-foreground uppercase tracking-tight">
              DIALECTIC
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            <RecentLogsDropdown />
            
            <Button variant="ghost" onClick={() => navigate("/public")} className="text-sm">
              Public Domain
            </Button>

            {user ? <Button variant="ghost" onClick={handleSignOut} className="text-sm text-sky-800">
                Sign Out
              </Button> : <Button variant="ghost" onClick={() => navigate("/auth")} className="text-sm text-sky-600 hover:text-sky-700">
                Sign In
              </Button>}
          </div>
        </div>
      </div>
    </nav>;
};