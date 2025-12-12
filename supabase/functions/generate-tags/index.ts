import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { statement, summary, backfill } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // If backfill mode, process all debates without tags
    if (backfill) {
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
      
      const { data: debates, error: fetchError } = await supabase
        .from('debates')
        .select('id, statement, summary')
        .or('tags.is.null,tags.eq.{}');

      if (fetchError) throw fetchError;

      console.log(`Found ${debates?.length || 0} debates to backfill tags`);

      for (const debate of debates || []) {
        try {
          const tags = await generateTagsForDebate(debate.statement, debate.summary, LOVABLE_API_KEY);
          await supabase
            .from('debates')
            .update({ tags })
            .eq('id', debate.id);
          console.log(`Updated tags for debate ${debate.id}:`, tags);
        } catch (err) {
          console.error(`Failed to generate tags for debate ${debate.id}:`, err);
        }
      }

      return new Response(
        JSON.stringify({ success: true, processed: debates?.length || 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate tags for a single debate
    const tags = await generateTagsForDebate(statement, summary, LOVABLE_API_KEY);

    return new Response(
      JSON.stringify({ tags }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-tags:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateTagsForDebate(statement: string, summary: string, apiKey: string): Promise<string[]> {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: 'You generate concise, relevant tags for debates. Tags should be 1-3 words each, lowercase, and capture the key topics and themes.'
        },
        {
          role: 'user',
          content: `Generate 5 tags for this debate:
Statement: "${statement}"
Summary: "${summary}"

Return exactly 5 tags that capture the main topics, themes, and categories of this debate.`
        }
      ],
      tools: [{
        type: "function",
        function: {
          name: "return_tags",
          description: "Return 5 debate tags",
          parameters: {
            type: "object",
            properties: {
              tags: {
                type: "array",
                items: { type: "string" },
                minItems: 5,
                maxItems: 5
              }
            },
            required: ["tags"]
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "return_tags" } }
    }),
  });

  if (!response.ok) {
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices[0].message.tool_calls?.[0];
  
  if (toolCall) {
    const parsed = JSON.parse(toolCall.function.arguments);
    return parsed.tags.map((tag: string) => tag.toLowerCase().trim());
  }
  
  return ['general', 'debate', 'discussion', 'opinion', 'topic'];
}