import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing text for type: ${type}`);

    // Determine if input is a statement or longer text
    if (type === "detect-intent") {
      const wordCount = text.trim().split(/\s+/).length;
      const sentenceCount = text.split(/[.!?]+/).filter((s: string) => s.trim()).length;
      const hasMultipleParagraphs = text.includes("\n\n") || text.includes("\r\n\r\n");
      
      // Heuristics: if short (under 30 words), single sentence, no paragraphs -> statement
      const isStatement = wordCount < 30 && sentenceCount <= 2 && !hasMultipleParagraphs;
      
      return new Response(
        JSON.stringify({ isStatement, wordCount, sentenceCount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract debatable statements from longer text
    if (type === "extract-statements") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { 
              role: "system", 
              content: `You are an expert at identifying debatable claims within text. Your job is to extract the most intellectually interesting and controversial statements from pasted content.

CRITICAL REQUIREMENTS:
1. Extract 3-7 potential debate statements from the text
2. Each statement must be:
   - A clear, debatable claim (not a question or fact)
   - Phrased neutrally (not biased towards either side)
   - Suitable as a debate title
   - Represent genuine intellectual tension
3. Prioritize:
   - Ideas with real tradeoffs
   - Claims where reasonable people genuinely disagree
   - Depth over volume
   - Avoid trivial or obvious claims
4. Rewrite each as a clean, standalone declarative statement
5. Focus on underlying issues, not surface-level opinions` 
            },
            { 
              role: "user", 
              content: `Analyze this text and extract the most debatable statements:

"${text}"

Return the most intellectually interesting claims that could be debated from multiple perspectives.` 
            }
          ],
          tools: [{
            type: "function",
            function: {
              name: "return_statements",
              description: "Return extracted debatable statements",
              parameters: {
                type: "object",
                properties: {
                  statements: { 
                    type: "array",
                    items: { 
                      type: "object",
                      properties: {
                        statement: { type: "string" },
                        context: { type: "string" }
                      },
                      required: ["statement", "context"]
                    },
                    minItems: 3,
                    maxItems: 7
                  }
                },
                required: ["statements"]
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "return_statements" } }
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error("Failed to analyze text");
      }

      const data = await response.json();
      const toolCall = data.choices[0].message.tool_calls?.[0];
      
      if (toolCall) {
        const parsed = JSON.parse(toolCall.function.arguments);
        return new Response(
          JSON.stringify({ statements: parsed.statements }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Invalid response from AI");
    }

    // Generate debate statements from news headline
    if (type === "news-to-statements") {
      const { headline, description } = JSON.parse(text);
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { 
              role: "system", 
              content: `You are an expert at transforming news headlines into meaningful debate topics. Your job is to identify the underlying issues and controversies behind current events.

CRITICAL REQUIREMENTS:
1. Generate 3-5 debate statements from the news headline/description
2. Each statement must be:
   - A clear position that can be argued for and against
   - Focused on underlying principles, not just the specific event
   - Neutral in wording (not sensationalized)
   - Timeless and structurally interesting
3. Avoid:
   - Surface-level reactions to events
   - Clickbait phrasing
   - Statements that are obviously true or false
4. Focus on:
   - Policy implications
   - Ethical questions
   - Systemic issues revealed by the event` 
            },
            { 
              role: "user", 
              content: `Transform this news story into debate topics:

Headline: "${headline}"
${description ? `Description: "${description}"` : ''}

Generate debatable statements that address the deeper issues behind this story.` 
            }
          ],
          tools: [{
            type: "function",
            function: {
              name: "return_statements",
              description: "Return generated debate statements",
              parameters: {
                type: "object",
                properties: {
                  statements: { 
                    type: "array",
                    items: { 
                      type: "object",
                      properties: {
                        statement: { type: "string" },
                        rationale: { type: "string" }
                      },
                      required: ["statement", "rationale"]
                    },
                    minItems: 3,
                    maxItems: 5
                  }
                },
                required: ["statements"]
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "return_statements" } }
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error("Failed to generate statements from news");
      }

      const data = await response.json();
      const toolCall = data.choices[0].message.tool_calls?.[0];
      
      if (toolCall) {
        const parsed = JSON.parse(toolCall.function.arguments);
        return new Response(
          JSON.stringify({ statements: parsed.statements }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Invalid response from AI");
    }

    throw new Error("Invalid type specified");
  } catch (error) {
    console.error("Error in analyze-text function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
