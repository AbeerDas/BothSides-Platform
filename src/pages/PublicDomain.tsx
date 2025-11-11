import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NavBar } from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
interface Debate {
  id: string;
  slug: string;
  statement: string;
  created_at: string;
  profiles: {
    username: string | null;
  } | null;
}
export default function PublicDomain() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    loadDebates();
  }, []);
  const loadDebates = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("debates").select("id, slug, statement, created_at, user_id").eq("is_public", true).order("created_at", {
        ascending: false
      });
      if (error) throw error;

      // Fetch profiles separately for users
      const userIds = [...new Set(data?.map(d => d.user_id).filter(Boolean) || [])];
      const profiles = new Map();
      if (userIds.length > 0) {
        const {
          data: profilesData
        } = await supabase.from("profiles").select("id, username").in("id", userIds);
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
  return <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="font-serif font-bold text-4xl text-foreground tracking-tight">Public Debates</h1>
            <p className="text-muted-foreground">
              Explore debates from the community
            </p>
          </div>

          {loading ? <div className="text-center text-muted-foreground">Loading debates...</div> : debates.length === 0 ? <div className="text-center text-muted-foreground">
              No debates yet. Be the first to create one!
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {debates.map(debate => <Card key={debate.id} className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/debate/${debate.slug}`)}>
                  <div className="space-y-3">
                    <h3 className="font-serif font-semibold text-lg line-clamp-3">
                      {debate.statement}
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        By: {debate.profiles?.username || "Anonymous"}
                      </p>
                      <p>
                        {formatDistanceToNow(new Date(debate.created_at), {
                    addSuffix: true
                  })}
                      </p>
                    </div>
                  </div>
                </Card>)}
            </div>}
        </div>
      </div>
    </div>;
}