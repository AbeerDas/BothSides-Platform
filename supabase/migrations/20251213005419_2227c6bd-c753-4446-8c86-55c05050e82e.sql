-- Create a table for storing daily news headlines
CREATE TABLE public.news_headlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  source_name TEXT,
  source_id TEXT,
  author TEXT,
  url TEXT NOT NULL,
  url_to_image TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  content TEXT,
  category TEXT,
  country TEXT,
  fetched_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.news_headlines ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (news headlines should be publicly readable)
CREATE POLICY "News headlines are viewable by everyone" 
ON public.news_headlines 
FOR SELECT 
USING (true);

-- Create index for faster queries by date and category
CREATE INDEX idx_news_headlines_fetched_date ON public.news_headlines(fetched_date);
CREATE INDEX idx_news_headlines_category ON public.news_headlines(category);
CREATE INDEX idx_news_headlines_country ON public.news_headlines(country);

-- Create a composite index for common filter patterns
CREATE INDEX idx_news_headlines_date_category_country ON public.news_headlines(fetched_date, category, country);