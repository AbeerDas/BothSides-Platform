import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert debate judge and coach. Analyze the debate conversation and provide detailed, objective feedback.

SCORING CRITERIA (each category is scored 0.0-2.0, with one decimal precision):

1. **Logical Reasoning** (0.0-2.0)
   - 2.0: Flawless logic, no fallacies, strong causal chains
   - 1.5: Mostly sound reasoning with minor gaps
   - 1.0: Some logical issues or unsubstantiated claims
   - 0.5: Frequent fallacies or weak reasoning
   - 0.0: No logical structure

2. **Evidence & Examples** (0.0-2.0)
   - 2.0: Strong, specific, relevant examples/data
   - 1.5: Good examples, mostly relevant
   - 1.0: Some examples but vague or tangential
   - 0.5: Few examples, mostly assertions
   - 0.0: No supporting evidence

3. **Counterargument Handling** (0.0-2.0)
   - 2.0: Directly addresses all challenges, reframes effectively
   - 1.5: Addresses most challenges with good responses
   - 1.0: Some responses, some deflection
   - 0.5: Mostly ignores or deflects challenges
   - 0.0: Does not engage with counterpoints

4. **Clarity & Persuasiveness** (0.0-2.0)
   - 2.0: Crystal clear, compelling, well-structured
   - 1.5: Clear and mostly persuasive
   - 1.0: Understandable but could be clearer
   - 0.5: Confusing or unconvincing
   - 0.0: Incoherent

5. **Debate Strategy** (0.0-2.0)
   - 2.0: Excellent framing, anticipates objections, controls narrative
   - 1.5: Good strategic choices, some anticipation
   - 1.0: Basic strategy, reactive approach
   - 0.5: Poor strategy, easily cornered
   - 0.0: No strategic awareness

FALLACY DETECTION (deduct 0.1-0.3 per occurrence):
- Ad hominem attacks
- Straw man arguments
- False dichotomies
- Appeal to emotion without evidence
- Circular reasoning
- Red herrings
- Hasty generalizations

You MUST respond with ONLY valid JSON in this exact format:
{
  "overallScore": 7.5,
  "categories": [
    {"name": "Logical Reasoning", "score": 1.5, "maxScore": 2.0, "feedback": "Specific feedback about their logic"},
    {"name": "Evidence & Examples", "score": 1.2, "maxScore": 2.0, "feedback": "Specific feedback about their evidence"},
    {"name": "Counterargument Handling", "score": 1.8, "maxScore": 2.0, "feedback": "How well they handled challenges"},
    {"name": "Clarity & Persuasiveness", "score": 1.5, "maxScore": 2.0, "feedback": "How clear and persuasive they were"},
    {"name": "Debate Strategy", "score": 1.5, "maxScore": 2.0, "feedback": "Their strategic approach"}
  ],
  "strengths": ["Specific strength 1 with example from debate", "Specific strength 2"],
  "improvements": ["Specific area to improve with example", "Another area"],
  "tips": ["Actionable tip 1", "Actionable tip 2"],
  "summary": "A 1-2 sentence overall assessment"
}

Be specific! Reference actual arguments and examples from the debate. The overall score is the sum of all category scores (max 10.0).`;

    const userMessages = messages.filter((m: Message) => m.role === "user");
    const assistantMessages = messages.filter((m: Message) => m.role === "assistant");

    const debateContext = messages
      .map((m: Message) => `${m.role === "user" ? "USER" : "AI OPPONENT"}: ${m.content}`)
      .join("\n\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Analyze this debate where the USER is practicing their argumentation skills:\n\n${debateContext}\n\nProvide your feedback as JSON only.` 
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate feedback" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const feedbackContent = data.choices?.[0]?.message?.content;

    if (!feedbackContent) {
      throw new Error("No feedback content received");
    }

    // Parse and validate the JSON response
    let feedback;
    try {
      feedback = JSON.parse(feedbackContent);
    } catch (e) {
      console.error("Failed to parse feedback JSON:", feedbackContent);
      throw new Error("Invalid feedback format");
    }

    // Ensure all required fields exist
    if (!feedback.overallScore || !feedback.categories || !feedback.strengths || !feedback.improvements || !feedback.tips || !feedback.summary) {
      throw new Error("Incomplete feedback data");
    }

    return new Response(JSON.stringify(feedback), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-feedback error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});