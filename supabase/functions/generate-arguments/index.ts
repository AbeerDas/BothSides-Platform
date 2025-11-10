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
    const { statement, type, parentArgument, perspectives, targetSide, side, existingArguments } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating ${type} for statement:`, statement);

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "initial") {
      const perspectiveContext = perspectives && perspectives.length > 0 
        ? `\n\nIMPORTANT: Generate arguments informed by these perspectives: ${perspectives.join(', ')}. Each argument should reflect reasoning and evidence typical of these viewpoints.`
        : '';

      systemPrompt = `You are an expert debate analyst. Generate balanced arguments for and against the given statement.

CRITICAL REQUIREMENTS:
1. Generate 3-4 arguments for EACH side (FOR and AGAINST)
2. Each argument MUST have:
   - "title": A concise, clear title (max 8 words) that captures the core point
   - "subheading": A one-sentence summary (max 15 words) that encompasses the main point
   - "text": The detailed argument (2-3 sentences) with specific examples and numbers
   
3. ALWAYS back arguments with:
   - Concrete examples from real cases
   - Statistical data and numbers where applicable
   - Specific studies or events
   
4. Provide 2-4 credible sources per argument
5. Use reliable, verifiable sources (academic papers, established news outlets, government data, .gov, .edu domains preferred)
6. Format sources as: {"title": "Source Title", "url": "https://..."}
7. Ensure URLs are complete and accessible${perspectiveContext}`;
      userPrompt = `Statement: "${statement}"

Generate 3-4 arguments for and against this statement with titles, subheadings, detailed text backed by examples and numbers, and credible sources.`;
    } else if (type === "refute") {
      const sideContext = targetSide 
        ? `You are arguing from the "${targetSide}" perspective of the original statement.`
        : '';

      systemPrompt = `You are an expert debate analyst. Generate a strong counterargument to refute the given point.

${sideContext}

CRITICAL REQUIREMENTS:
1. The refutation MUST have:
   - "title": A concise, clear title (max 8 words) that captures the counter-point
   - "subheading": A one-sentence summary (max 15 words) that encompasses the rebuttal
   - "text": The detailed counterargument (2-3 sentences) with specific examples and numbers
   
2. ALWAYS back the refutation with:
   - Concrete counter-examples
   - Statistical data that contradicts the original point
   - Specific studies or cases that disprove the argument
   
3. Provide 2-4 credible sources
4. Use reliable, verifiable sources (academic papers, established news outlets, government data, .gov, .edu domains preferred)
5. Ensure URLs are complete and accessible`;
      userPrompt = `Original statement: "${statement}"
Point to refute: "${parentArgument}"

Generate a strong refutation with title, subheading, detailed counter-argument backed by examples and data, and credible sources.`;
    } else if (type === "evidence") {
      systemPrompt = `You are an expert researcher. Generate strong supporting evidence for the given argument.

CRITICAL REQUIREMENTS:
1. The evidence MUST have:
   - "title": A concise title (max 8 words) describing the evidence type
   - "subheading": A one-sentence summary (max 15 words) of the evidence
   - "text": Detailed evidence (2-3 sentences) with specific case studies, statistics, or research findings
   
2. ALWAYS provide:
   - Real case studies or examples
   - Statistical data and numbers
   - Research findings or empirical evidence
   
3. Provide 2-4 highly credible sources
4. Prioritize academic sources, government data, peer-reviewed research (.gov, .edu, academic journals)
5. Format sources as: {"title": "Source Title", "url": "https://..."}
6. Ensure URLs are complete and accessible`;
      userPrompt = `Original statement: "${statement}"
Argument to support: "${parentArgument}"

Generate strong evidence with title, subheading, detailed supporting data (case studies, statistics, research), and credible academic/research sources.`;
    } else if (type === "add-argument") {
      const existingTitles = existingArguments?.map((arg: any) => arg.title).join(', ') || '';
      
      systemPrompt = `You are an expert debate analyst. Generate a NEW argument for the ${side} side that is DIFFERENT from existing arguments.

CRITICAL REQUIREMENTS:
1. The argument MUST have:
   - "title": A concise, clear title (max 8 words) that captures the core point
   - "subheading": A one-sentence summary (max 15 words) that encompasses the main point
   - "text": The detailed argument (2-3 sentences) with specific examples and numbers
   
2. ALWAYS back arguments with:
   - Concrete examples from real cases
   - Statistical data and numbers where applicable
   - Specific studies or events
   
3. Provide 2-4 credible sources per argument
4. Use reliable, verifiable sources (academic papers, established news outlets, government data, .gov, .edu domains preferred)
5. Format sources as: {"title": "Source Title", "url": "https://..."}
6. Ensure URLs are complete and accessible

${existingTitles ? `IMPORTANT: DO NOT repeat these existing argument angles: ${existingTitles}. Your argument must offer a NEW perspective.` : ''}`;
      
      userPrompt = `Statement: "${statement}"
Side: ${side}

Generate a NEW argument ${side === 'for' ? 'supporting' : 'opposing'} this statement with title, subheading, detailed text backed by examples and numbers, and credible sources.`;
    }

    // Define tool schemas based on type
    let tools: any[] = [];
    let tool_choice: any = undefined;

    if (type === "initial") {
      tools = [{
        type: "function",
        function: {
          name: "generate_arguments",
          description: "Generate balanced arguments for and against a statement",
          parameters: {
            type: "object",
            properties: {
              summary: { type: "string" },
              arguments: {
                type: "object",
                properties: {
                  for: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        subheading: { type: "string" },
                        text: { type: "string" },
                        sources: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              title: { type: "string" },
                              url: { type: "string" }
                            }
                          }
                        }
                      }
                    },
                    minItems: 3,
                    maxItems: 4
                  },
                  against: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        subheading: { type: "string" },
                        text: { type: "string" },
                        sources: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              title: { type: "string" },
                              url: { type: "string" }
                            }
                          }
                        }
                      }
                    },
                    minItems: 3,
                    maxItems: 4
                  }
                }
              }
            }
          }
        }
      }];
      tool_choice = { type: "function", function: { name: "generate_arguments" } };
    } else {
      // For refute, evidence, add-argument - single argument response
      tools = [{
        type: "function",
        function: {
          name: "generate_argument",
          description: "Generate a single argument",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              subheading: { type: "string" },
              text: { type: "string" },
              sources: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    url: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }];
      tool_choice = { type: "function", function: { name: "generate_argument" } };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools,
        tool_choice,
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
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      console.error("No tool call in AI response:", JSON.stringify(data));
      throw new Error("Invalid response format from AI");
    }

    const parsedContent = JSON.parse(toolCall.function.arguments);
    console.log("Parsed AI response:", parsedContent);

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-arguments function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});