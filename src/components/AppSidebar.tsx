import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Scale, Globe, Home, LogIn, LogOut, ChevronLeft, ChevronRight, ScrollText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Debate {
  slug: string;
  statement: string;
  created_at: string;
}

export const AppSidebar = () => {
  const [user, setUser] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [recentDebates, setRecentDebates] = useState<Debate[]>([]);
  const [myDebates, setMyDebates] = useState<Debate[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadDebates();
  }, [user]);

  const loadDebates = async () => {
    try {
      // Load recent public debates
      const { data: publicDebates } = await supabase
        .from("debates")
        .select("slug, statement, created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (publicDebates) {
        setRecentDebates(publicDebates);
      }

      // Load user's debates if logged in
      if (user) {
        const { data: userDebates } = await supabase
          .from("debates")
          .select("slug, statement, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (userDebates) {
          setMyDebates(userDebates);
        }
      }
    } catch (error) {
      console.error("Error loading debates:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ 
    icon: Icon, 
    label, 
    path, 
    onClick 
  }: { 
    icon: any; 
    label: string; 
    path?: string; 
    onClick?: () => void;
  }) => {
    const active = path ? isActive(path) : false;
    
    const content = (
      <button
        onClick={onClick || (() => path && navigate(path))}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors",
          active 
            ? "text-greek-gold bg-accent/50" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!isCollapsed && <span className="truncate">{label}</span>}
      </button>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const DebateList = ({ title, debates }: { title: string; debates: Debate[] }) => {
    if (isCollapsed || debates.length === 0) return null;
    
    return (
      <div className="space-y-1">
        <p className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          {title}
        </p>
        <div className="space-y-0.5">
          {debates.map((debate) => (
            <button
              key={debate.slug}
              onClick={() => navigate(`/debate/${debate.slug}`)}
              className={cn(
                "w-full text-left px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors truncate",
                location.pathname === `/debate/${debate.slug}` && "text-greek-gold bg-accent/50"
              )}
              title={debate.statement}
            >
              {debate.statement.length > 35 
                ? debate.statement.substring(0, 35) + "..." 
                : debate.statement}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-background border-r border-border z-50 flex flex-col transition-all duration-300",
        isCollapsed ? "w-14" : "w-56"
      )}
      onMouseEnter={() => isCollapsed && setIsCollapsed(false)}
    >
      {/* Logo */}
      <div className="p-3 border-b border-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Scale className="h-5 w-5 text-greek-gold shrink-0" />
              {!isCollapsed && (
                <span className="font-logo text-base text-foreground tracking-tight italic">
                  BothSides
                </span>
              )}
            </button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" className="text-xs">
              BothSides - Home
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="p-2 space-y-1">
          <NavItem icon={Home} label="Home" path="/" />
          <NavItem icon={Globe} label="Public Debates" path="/public" />
        </nav>

        {/* Debate Lists */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-4 py-2">
            <DebateList title="Recent Debates" debates={recentDebates} />
            {user && <DebateList title="My Debates" debates={myDebates} />}
          </div>
        </ScrollArea>

        {/* Bottom Section */}
        <div className="p-2 border-t border-border space-y-1">
          {user ? (
            <NavItem icon={LogOut} label="Sign Out" onClick={handleSignOut} />
          ) : (
            <NavItem icon={LogIn} label="Sign Up / Log In" path="/auth" />
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
};
