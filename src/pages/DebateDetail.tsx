import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NavBar } from "@/components/NavBar";
import { DebateView } from "@/components/DebateView";

interface Source {
  title: string;
  url: string;
}

interface Argument {
  title?: string;
  subheading?: string;
  text: string;
  sources: Source[];
  refutations?: Argument[];
}

interface DebateData {
  statement: string;
  summary: string;
  argumentsFor: Argument[];
  argumentsAgainst: Argument[];
}

export default function DebateDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [debate, setDebate] = useState<DebateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebate();
  }, [slug]);

  const loadDebate = async () => {
    if (!slug) return;

    try {
      const { data, error } = await supabase
        .from("debates")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;

      const argumentsData = data.arguments_data as any;
      setDebate({
        statement: data.statement,
        summary: data.summary,
        argumentsFor: argumentsData.for || [],
        argumentsAgainst: argumentsData.against || [],
      });
    } catch (error) {
      console.error("Error loading debate:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading debate...</p>
        </div>
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Debate not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <DebateView
          debate={debate}
          onRefute={async () => {}}
          onReset={() => navigate("/")}
          onAddArgument={async () => {}}
          addingArgumentSide={null}
        />
      </div>
    </div>
  );
}
