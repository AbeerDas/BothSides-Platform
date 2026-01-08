-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for practice debates
CREATE TABLE public.practice_debates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Debate',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  latest_score DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.practice_debates ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own practice debates" 
ON public.practice_debates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own practice debates" 
ON public.practice_debates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practice debates" 
ON public.practice_debates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own practice debates" 
ON public.practice_debates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_practice_debates_updated_at
BEFORE UPDATE ON public.practice_debates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();