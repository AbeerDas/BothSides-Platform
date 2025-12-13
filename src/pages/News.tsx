import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { NewsCard } from "@/components/NewsCard";
import { StatementDiscoveryModal } from "@/components/StatementDiscoveryModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, RefreshCw, Newspaper, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewsHeadline {
  id: string;
  title: string;
  description: string | null;
  source_name: string | null;
  url: string;
  url_to_image: string | null;
  published_at: string | null;
  category: string | null;
  country: string | null;
}

interface Statement {
  statement: string;
  rationale?: string;
}

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "business", label: "Business" },
  { value: "entertainment", label: "Entertainment" },
  { value: "health", label: "Health" },
  { value: "science", label: "Science" },
  { value: "sports", label: "Sports" },
  { value: "technology", label: "Technology" },
];

const COUNTRIES = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "gb", label: "United Kingdom" },
  { value: "au", label: "Australia" },
];

const News = () => {
  const navigate = useNavigate();
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [category, setCategory] = useState("general");
  const [country, setCountry] = useState("us");
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedHeadline, setSelectedHeadline] = useState<NewsHeadline | null>(null);

  useEffect(() => {
    fetchNews();
  }, [category, country]);

  const fetchNews = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const { data, error } = await supabase.functions.invoke('fetch-news', {
        body: { category, country, forceRefresh }
      });

      if (error) throw error;

      if (data.headlines) {
        setHeadlines(data.headlines);
        if (data.fromCache) {
          console.log("Headlines loaded from cache");
        } else {
          toast.success("News refreshed successfully");
        }
      }
    } catch (error: any) {
      console.error('Error fetching news:', error);
      toast.error("Failed to fetch news headlines");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleGenerateDebate = async (headline: NewsHeadline) => {
    setSelectedHeadline(headline);
    setModalOpen(true);
    setIsAnalyzing(true);
    setStatements([]);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: { 
          text: JSON.stringify({ 
            headline: headline.title, 
            description: headline.description 
          }),
          type: 'news-to-statements'
        }
      });

      if (error) throw error;

      if (data.statements) {
        setStatements(data.statements);
      }
    } catch (error: any) {
      console.error('Error analyzing headline:', error);
      toast.error("Failed to generate debate topics");
      setModalOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectStatement = (statement: string) => {
    // Navigate to home with the statement pre-filled
    navigate('/', { state: { prefillStatement: statement } });
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Newspaper className="h-6 w-6 text-greek-gold" />
              <h1 className="font-serif text-2xl font-medium text-foreground">
                Explore the News
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Transform today's headlines into thoughtful debates
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-[140px] h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[130px] h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNews(true)}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* News Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-greek-gold" />
            <p className="text-sm text-muted-foreground">Loading headlines...</p>
          </div>
        ) : headlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Newspaper className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No headlines found. Try refreshing.</p>
            <Button variant="outline" onClick={() => fetchNews(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh News
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {headlines.map((headline) => (
              <NewsCard
                key={headline.id}
                title={headline.title}
                description={headline.description || undefined}
                sourceName={headline.source_name || undefined}
                publishedAt={headline.published_at || undefined}
                imageUrl={headline.url_to_image || undefined}
                url={headline.url}
                onGenerateDebate={() => handleGenerateDebate(headline)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Statement Discovery Modal */}
      <StatementDiscoveryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        statements={statements}
        isLoading={isAnalyzing}
        onSelectStatement={handleSelectStatement}
        source="news"
        headline={selectedHeadline?.title}
      />
    </MainLayout>
  );
};

export default News;
