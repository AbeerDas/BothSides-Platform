import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { statement, argumentsFor, argumentsAgainst } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const formatArguments = (args: any[], prefix = ""): string => {
      return args.map((arg, idx) => {
        let text = `${prefix}${idx + 1}. ${arg.title || 'Argument'}: ${arg.text}\n`;
        if (arg.refutations && arg.refutations.length > 0) {
          text += formatArguments(arg.refutations, prefix + "  ");
        }
        return text;
      }).join('\n');
    };

    const prompt = `Given the following debate on: "${statement}"

Arguments FOR:
${formatArguments(argumentsFor)}

Arguments AGAINST:
${formatArguments(argumentsAgainst)}

Based on ALL the arguments and counter-arguments presented above, provide a final conclusion. You MUST explicitly state either "I support" or "I oppose" the statement at the very beginning of your response, then explain why in 1-2 sentences. Never be neutral or balanced - always pick a definitive side.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert debate analyst. Always take a definitive stance and explain your reasoning concisely. Never hedge or remain neutral.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const conclusion = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ conclusion }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-conclusion:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
