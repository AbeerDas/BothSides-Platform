import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, country, forceRefresh } = await req.json();
    
    const NEWS_API_KEY = Deno.env.get("NEWS_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!NEWS_API_KEY) {
      throw new Error("NEWS_API_KEY is not configured");
    }
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const today = new Date().toISOString().split('T')[0];

    console.log(`Fetching news for date: ${today}, category: ${category || 'general'}, country: ${country || 'us'}`);

    // Check if we already have headlines for today with these filters
    const { data: existingHeadlines, error: checkError } = await supabase
      .from('news_headlines')
      .select('*')
      .eq('fetched_date', today)
      .eq('category', category || 'general')
      .eq('country', country || 'us')
      .limit(1);

    if (checkError) {
      console.error("Error checking existing headlines:", checkError);
    }

    // If we have headlines for today and not forcing refresh, return them from DB
    if (existingHeadlines && existingHeadlines.length > 0 && !forceRefresh) {
      console.log("Returning cached headlines from database");
      
      const { data: allHeadlines } = await supabase
        .from('news_headlines')
        .select('*')
        .eq('fetched_date', today)
        .eq('category', category || 'general')
        .eq('country', country || 'us')
        .order('published_at', { ascending: false });

      return new Response(
        JSON.stringify({ headlines: allHeadlines || [], fromCache: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch from NewsAPI
    const params = new URLSearchParams({
      apiKey: NEWS_API_KEY,
      country: country || 'us',
      category: category || 'general',
      pageSize: '20'
    });

    console.log(`Calling NewsAPI with params: ${params.toString()}`);

    const newsResponse = await fetch(
      `https://newsapi.org/v2/top-headlines?${params.toString()}`
    );

    if (!newsResponse.ok) {
      const errorText = await newsResponse.text();
      console.error("NewsAPI error:", errorText);
      throw new Error(`NewsAPI error: ${newsResponse.status}`);
    }

    const newsData = await newsResponse.json();
    
    if (newsData.status !== 'ok') {
      throw new Error(newsData.message || 'Failed to fetch news');
    }

    console.log(`Received ${newsData.articles?.length || 0} articles from NewsAPI`);

    // If forcing refresh, delete old entries for this date/category/country combo
    if (forceRefresh) {
      await supabase
        .from('news_headlines')
        .delete()
        .eq('fetched_date', today)
        .eq('category', category || 'general')
        .eq('country', country || 'us');
    }

    // Store headlines in database
    const headlines = newsData.articles?.map((article: any) => ({
      title: article.title,
      description: article.description,
      source_name: article.source?.name,
      source_id: article.source?.id,
      author: article.author,
      url: article.url,
      url_to_image: article.urlToImage,
      published_at: article.publishedAt,
      content: article.content,
      category: category || 'general',
      country: country || 'us',
      fetched_date: today
    })) || [];

    if (headlines.length > 0) {
      const { error: insertError } = await supabase
        .from('news_headlines')
        .insert(headlines);

      if (insertError) {
        console.error("Error inserting headlines:", insertError);
      }
    }

    return new Response(
      JSON.stringify({ headlines, fromCache: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fetch-news function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
