import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Scale, Globe, Home, LogIn, LogOut, ChevronLeft, Sun, Moon, ChevronDown, PanelLeft, FileText, Newspaper, Swords } from "lucide-react";
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

interface AppSidebarProps {
  isMobileSheet?: boolean;
  onClose?: () => void;
}

export const AppSidebar = ({ isMobileSheet = false, onClose }: AppSidebarProps) => {
  const [user, setUser] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHoveringBar, setIsHoveringBar] = useState(false);
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
      const { data: publicDebates } = await supabase
        .from("debates")
        .select("slug, statement, created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(100);

      if (publicDebates) {
        setRecentDebates(publicDebates);
      }

      if (user) {
        const { data: userDebates } = await supabase
          .from("debates")
          .select("slug, statement, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100);

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
    onClose?.();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const isActive = (path: string) => location.pathname === path;

  const handleExpandClick = () => {
    setIsCollapsed(!isCollapsed);
  };

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
        onClick={onClick || (() => path && handleNavigate(path))}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 transition-colors",
          isMobileSheet ? "text-sm py-3" : "text-[11px]",
          active 
            ? "text-greek-gold bg-accent/50" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
        )}
      >
        <Icon className={cn("shrink-0", isMobileSheet ? "h-5 w-5" : "h-3.5 w-3.5")} />
        {(!isCollapsed || isMobileSheet) && <span className="truncate">{label}</span>}
      </button>
    );

    if (isCollapsed && !isMobileSheet) {
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
    if ((isCollapsed && !isMobileSheet) || debates.length === 0) return null;
    
    if (isCollapsible) {
      return (
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
          <CollapsibleTrigger className={cn(
            "w-full px-3 py-1 flex items-center justify-between uppercase tracking-wider text-muted-foreground font-medium hover:text-foreground transition-colors",
            isMobileSheet ? "text-xs py-2" : "text-[10px]"
          )}>
            <span>{title}</span>
            <ChevronDown className={cn("transition-transform", isOpen && "rotate-180", isMobileSheet ? "h-4 w-4" : "h-3 w-3")} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-0.5 pt-1">
              {debates.map((debate) => (
                <button
                  key={debate.slug}
                  onClick={() => handleNavigate(`/debate/${debate.slug}`)}
                  className={cn(
                    "w-full text-left px-3 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors truncate",
                    isMobileSheet ? "text-sm py-2.5" : "text-[10px] py-1",
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
        <p className={cn(
          "px-3 uppercase tracking-wider text-muted-foreground font-medium",
          isMobileSheet ? "text-xs py-1" : "text-[10px]"
        )}>
          {title}
        </p>
        <div className="space-y-0.5">
          {debates.map((debate) => (
            <button
              key={debate.slug}
              onClick={() => handleNavigate(`/debate/${debate.slug}`)}
              className={cn(
                "w-full text-left px-3 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors truncate",
                isMobileSheet ? "text-sm py-2.5" : "text-[10px] py-1",
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

  // For mobile sheet mode
  if (isMobileSheet) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <button 
            onClick={() => handleNavigate("/")}
            className="flex items-center gap-3"
          >
            <Scale className="h-7 w-7 text-greek-gold" />
            <span className="font-logo text-xl text-foreground tracking-tight italic">
              BothSides
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          <NavItem icon={Home} label="Home" path="/" />
          <NavItem icon={Swords} label="Practice" path="/practice" />
          <NavItem icon={Newspaper} label="Explore News" path="/news" />
          <NavItem icon={Globe} label="Public Debates" path="/public" />
          <NavItem icon={FileText} label="Documentation" path="/docs" />
          <NavItem 
            icon={theme === "dark" ? Sun : Moon} 
            label={theme === "dark" ? "Light Mode" : "Dark Mode"} 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
          />
        </nav>

        {/* Debate Lists */}
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-4 py-3">
            <DebateList title="Recent Public Debates" debates={recentDebates} />
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
        <div className="p-3 border-t border-border">
          {user ? (
            <NavItem icon={LogOut} label="Sign Out" onClick={handleSignOut} />
          ) : (
            <NavItem icon={LogIn} label="Sign Up / Log In" path="/auth" />
          )}
        </div>
      </div>
    );
  }

  // Desktop sidebar
  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-background border-r border-border z-50 flex flex-col transition-all duration-300",
        isCollapsed ? "w-12" : "w-52"
      )}
      onMouseEnter={() => isCollapsed && setIsHoveringBar(true)}
      onMouseLeave={() => setIsHoveringBar(false)}
      onClick={(e) => {
        // If collapsed and clicking on empty space (not a button), expand
        if (isCollapsed && (e.target as HTMLElement).closest('button') === null) {
          setIsCollapsed(false);
        }
      }}
    >
      {/* Logo + Expand Button Row */}
      <div className={cn(
        "p-2.5 border-b border-border flex items-center relative",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {/* Logo area - shows expand icon on hover when collapsed */}
        <button 
          onClick={isCollapsed ? handleExpandClick : () => handleNavigate("/")}
          className={cn(
            "flex items-center gap-2 hover:opacity-80 transition-opacity relative group",
            isCollapsed && "justify-center w-full"
          )}
        >
          {isCollapsed ? (
            <div className="relative h-4 w-4 flex items-center justify-center">
              <Scale className={cn(
                "h-4 w-4 text-greek-gold shrink-0 absolute transition-opacity",
                isHoveringBar ? "opacity-0" : "opacity-100"
              )} />
              <PanelLeft className={cn(
                "h-4 w-4 text-muted-foreground hover:text-foreground shrink-0 absolute transition-opacity",
                isHoveringBar ? "opacity-100" : "opacity-0"
              )} />
            </div>
          ) : (
            <>
              <Scale className="h-4 w-4 text-greek-gold shrink-0" />
              <span className="font-logo text-sm text-foreground tracking-tight italic">
                BothSides
              </span>
            </>
          )}
        </button>

        {/* Collapse Button - only when expanded */}
        {!isCollapsed && (
          <button
            onClick={handleExpandClick}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className={cn("p-1.5 space-y-0.5", isCollapsed && "flex flex-col items-center")}>
          <NavItem icon={Home} label="Home" path="/" />
          <NavItem icon={Swords} label="Practice" path="/practice" />
          <NavItem icon={Newspaper} label="Explore News" path="/news" />
          <NavItem icon={Globe} label="Public Debates" path="/public" />
          <NavItem icon={FileText} label="Documentation" path="/docs" />
          <NavItem 
            icon={theme === "dark" ? Sun : Moon} 
            label={theme === "dark" ? "Light Mode" : "Dark Mode"} 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
          />
        </nav>

        {/* Debate Lists - Scrollable */}
        <ScrollArea className="flex-1 px-1.5">
          <div className="space-y-3 py-2">
            <DebateList title="Recent Public Debates" debates={recentDebates} />
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