-- Add votes column to debates table
ALTER TABLE public.debates 
ADD COLUMN IF NOT EXISTS votes integer NOT NULL DEFAULT 0;

-- Create votes table to track individual user votes
CREATE TABLE IF NOT EXISTS public.debate_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debate_id uuid NOT NULL REFERENCES public.debates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  vote_type smallint NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(debate_id, user_id)
);

-- Enable RLS
ALTER TABLE public.debate_votes ENABLE ROW LEVEL SECURITY;

-- Users can view all votes
CREATE POLICY "Anyone can view votes" ON public.debate_votes
FOR SELECT USING (true);

-- Users can insert their own votes
CREATE POLICY "Users can insert their own votes" ON public.debate_votes
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update their own votes" ON public.debate_votes
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete their own votes" ON public.debate_votes
FOR DELETE USING (auth.uid() = user_id);