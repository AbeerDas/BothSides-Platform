import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/MainLayout";
import { LikeButton } from "@/components/LikeButton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Search, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Debate {
  id: string;
  slug: string;
  statement: string;
  summary: string;
  created_at: string;
  likes: number;
  tags: string[];
  profiles: {
    username: string | null;
  } | null;
}

export default function PublicDomain() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDebates();
  }, []);

  const loadDebates = async () => {
    try {
      const { data, error } = await supabase
        .from("debates")
        .select("id, slug, statement, summary, created_at, user_id, likes, tags")
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
        tags: d.tags || [],
        likes: d.likes || 0,
        profiles: d.user_id ? profiles.get(d.user_id) || null : null
      })) || [];

      setDebates(debatesWithProfiles);

      // Extract all unique tags
      const tags = new Set<string>();
      debatesWithProfiles.forEach(d => {
        d.tags?.forEach((t: string) => tags.add(t));
      });
      setAllTags(Array.from(tags).sort());
    } catch (error) {
      console.error("Error loading debates:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredDebates = debates.filter(debate => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      debate.statement.toLowerCase().includes(query) ||
      debate.summary.toLowerCase().includes(query);
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => debate.tags?.includes(tag));

    return matchesSearch && matchesTags;
  });

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-2xl md:text-3xl font-medium text-foreground">Public Debates</h1>
          <p className="text-muted-foreground text-sm">
            Explore debates from the community
          </p>
        </div>

        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search debates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-xs text-muted-foreground hover:text-foreground underline mr-2"
              >
                Clear filters
              </button>
            )}
            {allTags.slice(0, 20).map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-[10px] capitalize",
                  selectedTags.includes(tag) && "bg-amber-800 hover:bg-amber-700"
                )}
                onClick={() => toggleTag(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && (
                  <X className="h-2.5 w-2.5 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-5 space-y-3 border border-border bg-card/50">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredDebates.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            {searchQuery || selectedTags.length > 0
              ? "No debates match your search." 
              : "No debates yet. Be the first to create one!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDebates.map(debate => (
              <Card 
                key={debate.id} 
                className="p-5 cursor-pointer transition-all border border-transparent hover:border-greek-gold group bg-card/50"
                onClick={() => navigate(`/debate/${debate.slug}`)}
              >
                <div className="flex flex-col gap-3">
                  <h3 className="font-serif font-medium text-base line-clamp-3 group-hover:text-greek-gold transition-colors">
                    {debate.statement}
                  </h3>
                  
                  {/* Tags */}
                  {debate.tags && debate.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {debate.tags.slice(0, 3).map(tag => (
                        <span 
                          key={tag} 
                          className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground capitalize"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>By: {debate.profiles?.username || "Anonymous"}</p>
                    <p>{formatDistanceToNow(new Date(debate.created_at), { addSuffix: true })}</p>
                  </div>
                  
                  <div className="flex justify-end" onClick={e => e.stopPropagation()}>
                    <LikeButton debateId={debate.id} initialLikes={debate.likes} />
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