import { useEffect, useState } from "react";
import { Scale, Menu, Sun, Moon, History, Users, LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { RecentLogsDropdown } from "./RecentLogsDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
export const NavBar = () => {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    theme,
    setTheme
  } = useTheme();
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
    setIsOpen(false);
    navigate("/");
  };
  const handleLogoClick = () => {
    navigate("/");
  };
  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const ThemeToggle = () => <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-transparent">
      {theme === "dark" ? <Sun className="h-5 w-5 text-greek-gold" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
    </Button>;
  return <nav className="border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={handleLogoClick} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <Scale className="h-7 w-7 text-greek-gold" />
            </div>
            <h1 className="font-logo font-semibold text-2xl text-foreground tracking-tight italic">
              BothSides
            </h1>
          </button>

          {isMobile ? <div className="flex items-center gap-2">
              <ThemeToggle />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-transparent">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-card">
                  <div className="flex flex-col gap-4 mt-8">
                    <button onClick={() => handleNavigate("/")} className="flex items-center gap-3 px-4 py-3 text-left font-body text-sm hover:bg-accent rounded-md transition-colors">
                      <History className="h-5 w-5" />
                      Recent History
                    </button>
                    
                    <button onClick={() => handleNavigate("/public")} className="flex items-center gap-3 px-4 py-3 text-left font-body text-sm hover:bg-accent rounded-md transition-colors">
                      <Users className="h-5 w-5" />
                      Public Debates
                    </button>

                    {user ? <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 text-left font-body text-sm hover:bg-accent rounded-md transition-colors">
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </button> : <button onClick={() => handleNavigate("/auth")} className="flex items-center gap-3 px-4 py-3 text-left font-body text-sm bg-greek-gold text-foreground font-semibold hover:bg-greek-gold/90 rounded-md transition-colors">
                        <LogIn className="h-5 w-5" />
                        Sign In
                      </button>}
                  </div>
                </SheetContent>
              </Sheet>
            </div> : <div className="flex items-center gap-4">
              <RecentLogsDropdown />
              
              <Button variant="ghost" onClick={() => navigate("/public")} className="text-sm font-body hover:bg-transparent hover:underline">
                Public Debates
              </Button>

              {user ? <Button variant="ghost" onClick={handleSignOut} className="text-sm font-body hover:bg-transparent hover:underline">
                  Sign Out
                </Button> : <Button onClick={() => navigate("/auth")} className="text-sm font-body text-foreground font-semibold bg-amber-800 hover:bg-amber-700">
                  Sign In
                </Button>}

              <ThemeToggle />
            </div>}
        </div>
      </div>
    </nav>;
};