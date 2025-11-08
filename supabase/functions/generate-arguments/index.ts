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
      systemPrompt = `You are an expert debate analyst who generates balanced, well-researched arguments backed by concrete examples and statistics.
Your task is to analyze statements and provide structured arguments both FOR and AGAINST the statement.
Each argument must:
- Have a clear, punchy title (5-8 words) that captures the core point
- Include a subheading (10-15 words) that encompasses the main argument
- Provide detailed reasoning (2-3 sentences) with specific examples, case studies, and statistical evidence
- Include 2-3 credible, accessible sources with specific URLs (prefer .edu, .gov, major news outlets, and academic journals)
- Use concrete numbers, percentages, or data points wherever possible
- Reference real-world examples or case studies
- Represent the strongest possible case for that position
- Be intellectually honest and avoid strawman arguments

CRITICAL: All sources must be from reliable, publicly accessible websites that load consistently. Prefer:
- Government sites (.gov)
- Educational institutions (.edu)
- Established news organizations (Reuters, AP, BBC, NPR)
- Reputable research institutions
- Well-known academic journals with public abstracts

Format your response as a JSON object with this structure:
{
  "summary": "Brief neutral summary of the debate topic",
  "arguments": {
    "for": [
      {
        "title": "Short, punchy claim",
        "subheading": "One-sentence summary of the main point",
        "text": "Detailed argument with specific examples and numbers",
        "sources": [
          {"title": "Source title", "url": "https://example.com/article"}
        ]
      }
    ],
    "against": [
      {
        "title": "Short, punchy claim",
        "subheading": "One-sentence summary of the main point", 
        "text": "Detailed argument with specific examples and numbers",
        "sources": [
          {"title": "Source title", "url": "https://example.com/article"}
        ]
      }
    ]
  }
}`;
      userPrompt = `Generate balanced arguments for this statement: "${statement}"

Provide 3 strong arguments FOR and 3 strong arguments AGAINST. Each must include:
- A clear title
- A descriptive subheading
- Detailed reasoning with specific examples, case studies, or statistics
- 2-3 reliable, accessible sources`;
    } else if (type === "refute") {
      const perspectiveContext = perspective 
        ? ` Argue specifically from ${perspective} perspective.` 
        : "";
      
      systemPrompt = `You are an expert debater generating counterarguments backed by evidence.
Your task is to refute a specific argument with the strongest possible counter-reasoning.
Your refutation must:
- Have a clear, punchy title (5-8 words)
- Include a subheading (10-15 words)
- Directly address the original argument's core claim with specific examples and data
- Be supported by 2-3 credible, accessible sources
- Include concrete numbers, statistics, or real-world examples
- Be intellectually rigorous
- Avoid logical fallacies${perspectiveContext}

CRITICAL: All sources must be from reliable, publicly accessible websites. Prefer .edu, .gov, major news outlets, and academic institutions.

Format your response as a JSON object:
{
  "title": "Short, punchy counter-claim",
  "subheading": "One-sentence summary",
  "text": "Your refutation with specific examples and data",
  "sources": [
    {"title": "Source title", "url": "https://example.com/article"}
  ]
}`;
      userPrompt = `Refute this argument: "${parentArgument}"${perspectiveContext}

Context: This is part of a debate about "${statement}"

Provide a strong counterargument with concrete examples, statistics, or case studies.`;
    } else if (type === "evidence") {
      systemPrompt = `You are a research analyst providing evidence-based support for arguments.
Your task is to find compelling evidence (case studies, statistics, real-world examples) that supports a specific claim.
Your response must:
- Have a clear title describing the evidence type (e.g., "Case Study: X" or "Statistical Evidence: Y")
- Include a subheading summarizing the key finding
- Provide detailed evidence with specific numbers, dates, locations, or outcomes
- Be supported by 2-3 credible, accessible sources
- Focus on concrete, verifiable information

CRITICAL: All sources must be from reliable, publicly accessible websites. Prefer .edu, .gov, major news outlets, and academic institutions.

Format your response as a JSON object:
{
  "title": "Type of evidence and what it shows",
  "subheading": "Key finding or outcome",
  "text": "Detailed evidence with specific data points",
  "sources": [
    {"title": "Source title", "url": "https://example.com/article"}
  ]
}`;
      userPrompt = `Find strong evidence (case studies, statistics, or real-world examples) that supports this argument: "${parentArgument}"

Context: This is part of a debate about "${statement}"

Focus on concrete, verifiable evidence with specific numbers or outcomes.`;
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