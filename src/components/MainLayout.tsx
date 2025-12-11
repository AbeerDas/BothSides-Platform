import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { PageTransition } from "./PageTransition";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  withPadding?: boolean;
}

export const MainLayout = ({ children, className, withPadding = true }: MainLayoutProps) => {
  return (
    <PageTransition>
      <div className="h-screen bg-background flex overflow-hidden">
        <AppSidebar />
        <ScrollArea className="flex-1 ml-12 md:ml-52">
          <main className={cn(
            "min-h-screen",
            withPadding && "p-6 md:p-8",
            className
          )}>
            {children}
          </main>
        </ScrollArea>
      </div>
    </PageTransition>
  );
};
