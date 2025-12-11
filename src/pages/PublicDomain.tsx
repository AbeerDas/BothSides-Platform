import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/MainLayout";
import { VoteButtons } from "@/components/VoteButtons";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Debate {
  id: string;
  slug: string;
  statement: string;
  summary: string;
  created_at: string;
  votes: number;
  profiles: {
    username: string | null;
  } | null;
}

export default function PublicDomain() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadDebates();
  }, []);

  const loadDebates = async () => {
    try {
      const { data, error } = await supabase
        .from("debates")
        .select("id, slug, statement, summary, created_at, user_id, votes")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = [...new Set(data?.map(d => d.user_id).filter(Boolean) || [])];
      const profiles = new Map();

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);
        profilesData?.forEach(p => profiles.set(p.id, p));
      }

      const debatesWithProfiles = data?.map(d => ({
        ...d,
        profiles: d.user_id ? profiles.get(d.user_id) || null : null
      })) || [];

      setDebates(debatesWithProfiles);
    } catch (error) {
      console.error("Error loading debates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDebates = debates.filter(debate => {
    const query = searchQuery.toLowerCase();
    return (
      debate.statement.toLowerCase().includes(query) ||
      debate.summary.toLowerCase().includes(query)
    );
  });

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl font-medium text-foreground">Public Debates</h1>
          <p className="text-muted-foreground text-sm">
            Explore debates from the community
          </p>
        </div>

        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search debates by topic or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 space-y-3 border border-border">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredDebates.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            {searchQuery 
              ? "No debates match your search." 
              : "No debates yet. Be the first to create one!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDebates.map(debate => (
              <Card 
                key={debate.id} 
                className="p-5 cursor-pointer transition-all border border-border/50 hover:border-greek-gold group bg-card/50"
                onClick={() => navigate(`/debate/${debate.slug}`)}
              >
                <div className="flex flex-col gap-3">
                  <h3 className="font-serif font-medium text-base line-clamp-3 group-hover:text-greek-gold transition-colors">
                    {debate.statement}
                  </h3>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>By: {debate.profiles?.username || "Anonymous"}</p>
                    <p>{formatDistanceToNow(new Date(debate.created_at), { addSuffix: true })}</p>
                  </div>
                  <div className="flex justify-end">
                    <VoteButtons debateId={debate.id} initialVotes={debate.votes} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
