import { ReactNode, useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { PageTransition } from "./PageTransition";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Scale, Menu, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  withPadding?: boolean;
}

export const MainLayout = ({ children, className, withPadding = true }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isMobile) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col">
          {/* Mobile Header */}
          <header className="flex items-center justify-between px-3 py-3 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 text-foreground">
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] max-w-sm p-0">
                  <AppSidebar isMobileSheet onClose={() => setSidebarOpen(false)} />
                </SheetContent>
              </Sheet>
              
              <button onClick={() => navigate("/")} className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-greek-gold" />
                <span className="font-logo text-lg text-foreground tracking-tight italic">
                  BothSides
                </span>
              </button>
            </div>

            {!user && (
              <button 
                onClick={() => navigate("/auth")}
                className="p-2 text-foreground"
              >
                <LogIn className="h-6 w-6" />
              </button>
            )}
          </header>

          {/* Mobile Content */}
          <main className={cn(
            "flex-1",
            withPadding && "px-3 py-4",
            className
          )}>
            {children}
          </main>
        </div>
      </PageTransition>
    );
  }

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleStorageChange = () => {
      // Check if sidebar is collapsed based on DOM (workaround)
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        setSidebarCollapsed(sidebar.classList.contains('w-12'));
      }
    };
    
    // Set up a mutation observer to watch for sidebar width changes
    const observer = new MutationObserver(handleStorageChange);
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
      handleStorageChange(); // Initial check
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <PageTransition>
      <div className="h-screen bg-background flex overflow-hidden w-full">
        <AppSidebar />
        <div className={cn(
          "flex-1 transition-all duration-300 overflow-hidden",
          sidebarCollapsed ? "ml-12" : "ml-52"
        )}>
          <ScrollArea className="h-full w-full">
            <main className={cn(
              "min-h-screen w-full flex flex-col",
              withPadding && "p-6 md:p-8",
              className
            )}>
              {children}
            </main>
          </ScrollArea>
        </div>
      </div>
    </PageTransition>
  );
};