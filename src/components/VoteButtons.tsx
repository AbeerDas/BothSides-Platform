import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { AuthModal } from "./AuthModal";

interface VoteButtonsProps {
  debateId: string;
  initialVotes: number;
  className?: string;
}

export const VoteButtons = ({ debateId, initialVotes, className }: VoteButtonsProps) => {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserVote(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserVote(session.user.id);
      } else {
        setUserVote(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [debateId]);

  const fetchUserVote = async (userId: string) => {
    const { data } = await supabase
      .from("debate_votes")
      .select("vote_type")
      .eq("debate_id", debateId)
      .eq("user_id", userId)
      .single();
    
    if (data) {
      setUserVote(data.vote_type as 1 | -1);
    }
  };

  const handleVote = async (voteType: 1 | -1, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);

    try {
      if (userVote === voteType) {
        // Remove vote
        await supabase
          .from("debate_votes")
          .delete()
          .eq("debate_id", debateId)
          .eq("user_id", user.id);
        
        setVotes(prev => prev - voteType);
        setUserVote(null);

        // Update debate votes
        await supabase
          .from("debates")
          .update({ votes: votes - voteType })
          .eq("id", debateId);
      } else {
        if (userVote !== null) {
          // Update existing vote
          await supabase
            .from("debate_votes")
            .update({ vote_type: voteType })
            .eq("debate_id", debateId)
            .eq("user_id", user.id);
          
          setVotes(prev => prev - userVote + voteType);
          
          await supabase
            .from("debates")
            .update({ votes: votes - userVote + voteType })
            .eq("id", debateId);
        } else {
          // New vote
          await supabase
            .from("debate_votes")
            .insert({ debate_id: debateId, user_id: user.id, vote_type: voteType });
          
          setVotes(prev => prev + voteType);
          
          await supabase
            .from("debates")
            .update({ votes: votes + voteType })
            .eq("id", debateId);
        }
        setUserVote(voteType);
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={cn("flex items-center gap-1", className)} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => handleVote(1, e)}
          disabled={isLoading}
          className={cn(
            "p-1 rounded hover:bg-accent transition-colors",
            userVote === 1 && "text-greek-gold"
          )}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className={cn(
          "text-sm font-medium min-w-[20px] text-center",
          votes > 0 && "text-greek-gold",
          votes < 0 && "text-greek-terracotta"
        )}>
          {votes}
        </span>
        <button
          onClick={(e) => handleVote(-1, e)}
          disabled={isLoading}
          className={cn(
            "p-1 rounded hover:bg-accent transition-colors",
            userVote === -1 && "text-greek-terracotta"
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => fetchUserVote(user?.id)}
      />
    </>
  );
};
