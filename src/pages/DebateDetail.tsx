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

  const handleRefute = async (side: "for" | "against", path: number[]) => {
    if (!slug || !debate) return;
    
    try {
      // Generate refutation
      const targetArguments = side === "for" ? debate.argumentsFor : debate.argumentsAgainst;
      let targetArg: any = targetArguments[path[0]];
      
      for (let i = 1; i < path.length; i++) {
        targetArg = targetArg.refutations?.[path[i]];
      }

      const { data: refutationData, error: refutationError } = await supabase.functions.invoke(
        "generate-arguments",
        {
          body: {
            statement: debate.statement,
            side: side === "for" ? "against" : "for",
            context: targetArg.text,
            count: 1,
          },
        }
      );

      if (refutationError) throw refutationError;

      // Update debate with new refutation
      const newRefutation = refutationData.arguments[0];
      const updatedDebate = { ...debate };
      const targetSide = side === "for" ? updatedDebate.argumentsFor : updatedDebate.argumentsAgainst;
      
      let current: any = targetSide[path[0]];
      for (let i = 1; i < path.length; i++) {
        current = current.refutations[path[i]];
      }
      
      if (!current.refutations) current.refutations = [];
      current.refutations.push(newRefutation);

      // Save to database
      const { error: updateError } = await supabase
        .from("debates")
        .update({
          arguments_data: {
            for: updatedDebate.argumentsFor,
            against: updatedDebate.argumentsAgainst,
          } as any,
        })
        .eq("slug", slug);

      if (updateError) throw updateError;

      // Update local state
      setDebate(updatedDebate);
    } catch (error) {
      console.error("Error adding refutation:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <DebateView
          debate={debate}
          onRefute={handleRefute}
          onReset={() => navigate("/")}
          onAddArgument={async () => {}}
          addingArgumentSide={null}
        />
      </div>
    </div>
  );
}
