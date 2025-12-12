-- Add tags column to debates table
ALTER TABLE public.debates ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add likes column to debates table (for heart functionality)
ALTER TABLE public.debates ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0;

-- Create debate_likes table for tracking individual likes
CREATE TABLE IF NOT EXISTS public.debate_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debate_id UUID NOT NULL REFERENCES public.debates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(debate_id, user_id)
);

-- Enable RLS on debate_likes
ALTER TABLE public.debate_likes ENABLE ROW LEVEL SECURITY;

-- Policies for debate_likes
CREATE POLICY "Anyone can view likes" ON public.debate_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.debate_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own likes" ON public.debate_likes FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_debates_tags ON public.debates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_debate_likes_debate ON public.debate_likes(debate_id);
CREATE INDEX IF NOT EXISTS idx_debate_likes_user ON public.debate_likes(user_id);