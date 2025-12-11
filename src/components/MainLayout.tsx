import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { PageTransition } from "./PageTransition";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  withPadding?: boolean;
}

export const MainLayout = ({ children, className, withPadding = true }: MainLayoutProps) => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex">
        <AppSidebar />
        <main className={cn(
          "flex-1 ml-14 md:ml-56 transition-all duration-300",
          withPadding && "p-6 md:p-8",
          className
        )}>
          {children}
        </main>
      </div>
    </PageTransition>
  );
};
