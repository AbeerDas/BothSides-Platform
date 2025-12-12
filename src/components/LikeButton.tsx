import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { AuthModal } from "./AuthModal";

interface LikeButtonProps {
  debateId: string;
  initialLikes?: number;
  className?: string;
  size?: "sm" | "md";
}

export const LikeButton = ({ debateId, initialLikes = 0, className, size = "sm" }: LikeButtonProps) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserLike(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserLike(session.user.id);
      } else {
        setIsLiked(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [debateId]);

  const fetchUserLike = async (userId: string) => {
    const { data } = await supabase
      .from("debate_likes")
      .select("id")
      .eq("debate_id", debateId)
      .eq("user_id", userId)
      .single();
    
    setIsLiked(!!data);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);

    try {
      if (isLiked) {
        // Remove like
        await supabase
          .from("debate_likes")
          .delete()
          .eq("debate_id", debateId)
          .eq("user_id", user.id);
        
        setLikes(prev => prev - 1);
        setIsLiked(false);

        // Update debate likes count
        await supabase
          .from("debates")
          .update({ likes: likes - 1 })
          .eq("id", debateId);
      } else {
        // Add like
        await supabase
          .from("debate_likes")
          .insert({ debate_id: debateId, user_id: user.id });
        
        setLikes(prev => prev + 1);
        setIsLiked(true);

        // Update debate likes count
        await supabase
          .from("debates")
          .update({ likes: likes + 1 })
          .eq("id", debateId);
      }
    } catch (error) {
      console.error("Error liking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <>
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-1 p-1 rounded hover:bg-accent transition-colors",
          isLiked && "text-red-500",
          className
        )}
      >
        <Heart className={cn(iconSize, isLiked && "fill-current")} />
        {likes > 0 && <span className={cn(textSize, "font-medium")}>{likes}</span>}
      </button>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => fetchUserLike(user?.id)}
      />
    </>
  );
};