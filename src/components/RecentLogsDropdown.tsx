import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./ui/button";

interface Debate {
  slug: string;
  statement: string;
  created_at: string;
}

export const RecentLogsDropdown = () => {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

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
    if (user) {
      loadUserDebates();
    }
  }, [user]);

  const loadUserDebates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("debates")
        .select("slug, statement, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setDebates(data || []);
    } catch (error) {
      console.error("Error loading debates:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <History className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
        {!user ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Sign in to see your debate history
          </div>
        ) : debates.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No debates yet
          </div>
        ) : (
          debates.map((debate) => (
            <DropdownMenuItem
              key={debate.slug}
              onClick={() => navigate(`/debate/${debate.slug}`)}
              className="cursor-pointer p-4 flex flex-col items-start gap-2"
            >
              <p className="font-medium line-clamp-2">{debate.statement}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(debate.created_at), { addSuffix: true })}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
