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
    const { statement, type, parentArgument, perspective } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating ${type} for statement:`, statement);

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "initial") {
      systemPrompt = `You are an expert debate analyst who generates balanced, well-researched arguments. 
Your task is to analyze statements and provide structured arguments both FOR and AGAINST the statement.
Each argument must:
- Be clear and concise (2-3 sentences max)
- Include 1-2 credible sources with specific URLs
- Represent the strongest possible case for that position
- Be intellectually honest and avoid strawman arguments

Format your response as a JSON object with this structure:
{
  "summary": "Brief neutral summary of the debate topic",
  "arguments": {
    "for": [
      {
        "text": "Argument supporting the statement",
        "sources": [
          {"title": "Source title", "url": "https://example.com/article"}
        ]
      }
    ],
    "against": [
      {
        "text": "Argument opposing the statement",
        "sources": [
          {"title": "Source title", "url": "https://example.com/article"}
        ]
      }
    ]
  }
}`;
      userPrompt = `Generate balanced arguments for this statement: "${statement}"

Provide 3 strong arguments FOR and 3 strong arguments AGAINST. Each must have credible sources.`;
    } else if (type === "refute") {
      const perspectiveContext = perspective 
        ? ` Argue specifically from ${perspective} perspective.` 
        : "";
      
      systemPrompt = `You are an expert debater generating counterarguments.
Your task is to refute a specific argument with the strongest possible counter-reasoning.
Your refutation must:
- Directly address the original argument's core claim
- Be supported by 1-2 credible sources
- Be intellectually rigorous
- Avoid logical fallacies${perspectiveContext}

Format your response as a JSON object:
{
  "text": "Your refutation text",
  "sources": [
    {"title": "Source title", "url": "https://example.com/article"}
  ]
}`;
      userPrompt = `Refute this argument: "${parentArgument}"${perspectiveContext}

Context: This is part of a debate about "${statement}"`;
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
        temperature: 0.7,
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
    const content = data.choices[0].message.content;
    
    console.log("AI response:", content);
    
    // Parse the JSON from the AI response
    let parsedContent;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsedContent = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Invalid response format from AI");
    }

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