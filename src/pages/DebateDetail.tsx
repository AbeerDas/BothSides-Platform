import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/MainLayout";
import { DebateView } from "@/components/DebateView";
import { SkeletonDebateView } from "@/components/SkeletonDebate";
import { toast } from "sonner";

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
  const [isRefuting, setIsRefuting] = useState(false);

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

  const handleRefute = async (side: "for" | "against", path: number[]) => {
    if (!slug || !debate || isRefuting) return;
    
    setIsRefuting(true);
    
    try {
      const targetArguments = side === "for" ? debate.argumentsFor : debate.argumentsAgainst;
      let targetArg: any = targetArguments[path[0]];
      
      for (let i = 1; i < path.length; i++) {
        targetArg = targetArg.refutations?.[path[i]];
      }

      if (!targetArg) {
        throw new Error("Target argument not found");
      }

      const { data: refutationData, error: refutationError } = await supabase.functions.invoke(
        "generate-arguments",
        {
          body: {
            statement: debate.statement,
            type: "refute",
            parentArgument: targetArg.text,
            targetSide: side === "for" ? "against" : "for"
          },
        }
      );

      if (refutationError) throw refutationError;

      const updatedDebate = JSON.parse(JSON.stringify(debate));
      const targetSide = side === "for" ? updatedDebate.argumentsFor : updatedDebate.argumentsAgainst;
      
      let current: any = targetSide[path[0]];
      for (let i = 1; i < path.length; i++) {
        current = current.refutations[path[i]];
      }
      
      if (!current.refutations) current.refutations = [];
      current.refutations.push({
        title: refutationData.title,
        subheading: refutationData.subheading,
        text: refutationData.text,
        sources: refutationData.sources,
        refutations: []
      });

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

      setDebate(updatedDebate);
      toast.success("Refutation added successfully!");
    } catch (error: any) {
      console.error("Error adding refutation:", error);
      toast.error(error.message || "Failed to generate refutation. Please try again.");
    } finally {
      setIsRefuting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        {loading ? (
          <SkeletonDebateView />
        ) : !debate ? (
          <div className="text-center py-12 text-muted-foreground font-serif">
            Debate not found
          </div>
        ) : (
          <DebateView
            debate={debate}
            onRefute={handleRefute}
            onReset={() => navigate("/")}
            onAddArgument={async () => {}}
            addingArgumentSide={null}
          />
        )}
      </div>
    </MainLayout>
  );
}
