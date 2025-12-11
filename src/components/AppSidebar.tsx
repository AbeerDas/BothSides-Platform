import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Scale, Globe, Home, LogIn, LogOut, ChevronLeft, ChevronRight, Sun, Moon, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "next-themes";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Debate {
  slug: string;
  statement: string;
  created_at: string;
}

export const AppSidebar = () => {
  const [user, setUser] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const [recentDebates, setRecentDebates] = useState<Debate[]>([]);
  const [myDebates, setMyDebates] = useState<Debate[]>([]);
  const [myDebatesOpen, setMyDebatesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

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
      // Load all recent public debates (scrollable)
      const { data: publicDebates } = await supabase
        .from("debates")
        .select("slug, statement, created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50);

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
          .limit(50);

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
          "w-full flex items-center gap-3 px-3 py-2 text-[11px] transition-colors",
          active 
            ? "text-greek-gold bg-accent/50" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {!isCollapsed && <span className="truncate">{label}</span>}
      </button>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="text-[10px]">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const DebateList = ({ title, debates, isCollapsible = false, isOpen = true, onOpenChange }: { 
    title: string; 
    debates: Debate[];
    isCollapsible?: boolean;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => {
    if (isCollapsed || debates.length === 0) return null;
    
    if (isCollapsible) {
      return (
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
          <CollapsibleTrigger className="w-full px-3 py-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-medium hover:text-foreground transition-colors">
            <span>{title}</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-0.5 pt-1">
              {debates.map((debate) => (
                <button
                  key={debate.slug}
                  onClick={() => navigate(`/debate/${debate.slug}`)}
                  className={cn(
                    "w-full text-left px-3 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors truncate",
                    location.pathname === `/debate/${debate.slug}` && "text-greek-gold bg-accent/50"
                  )}
                  title={debate.statement}
                >
                  {debate.statement.length > 30 
                    ? debate.statement.substring(0, 30) + "..." 
                    : debate.statement}
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }
    
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
                "w-full text-left px-3 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors truncate",
                location.pathname === `/debate/${debate.slug}` && "text-greek-gold bg-accent/50"
              )}
              title={debate.statement}
            >
              {debate.statement.length > 30 
                ? debate.statement.substring(0, 30) + "..." 
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
        isCollapsed ? "w-12" : "w-52"
      )}
    >
      {/* Logo + Expand Button Row */}
      <div className="p-2.5 border-b border-border flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => navigate("/")}
              onMouseEnter={() => setIsHoveringLogo(true)}
              onMouseLeave={() => setIsHoveringLogo(false)}
              className={cn(
                "flex items-center gap-2 hover:opacity-80 transition-opacity",
                isCollapsed && isHoveringLogo && "cursor-e-resize"
              )}
            >
              <Scale className="h-4 w-4 text-greek-gold shrink-0" />
              {!isCollapsed && (
                <span className="font-logo text-sm text-foreground tracking-tight italic">
                  BothSides
                </span>
              )}
            </button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" className="text-[10px]">
              BothSides - Home
            </TooltipContent>
          )}
        </Tooltip>

        {/* Expand/Collapse Button - always visible in expanded, on hover in collapsed */}
        {(!isCollapsed || isHoveringLogo) && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="p-1.5 space-y-0.5">
          <NavItem icon={Home} label="Home" path="/" />
          <NavItem icon={Globe} label="Public Debates" path="/public" />
          <NavItem 
            icon={theme === "dark" ? Sun : Moon} 
            label={theme === "dark" ? "Light Mode" : "Dark Mode"} 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
          />
        </nav>

        {/* Debate Lists - Scrollable */}
        <ScrollArea className="flex-1 px-1.5">
          <div className="space-y-3 py-2">
            <DebateList title="Recent Debates" debates={recentDebates} />
            {user && (
              <DebateList 
                title="My Debates" 
                debates={myDebates} 
                isCollapsible 
                isOpen={myDebatesOpen} 
                onOpenChange={setMyDebatesOpen} 
              />
            )}
          </div>
        </ScrollArea>

        {/* Bottom Section */}
        <div className="p-1.5 border-t border-border space-y-0.5">
          {user ? (
            <NavItem icon={LogOut} label="Sign Out" onClick={handleSignOut} />
          ) : (
            <NavItem icon={LogIn} label="Sign Up / Log In" path="/auth" />
          )}
        </div>
      </div>
    </aside>
  );
};
