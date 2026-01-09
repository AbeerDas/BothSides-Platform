import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant";
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

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ suggestion: "" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lastAssistantMessage = [...messages].reverse().find((m: Message) => m.role === "assistant");
    const userMessages = messages.filter((m: Message) => m.role === "user");
    const userPosition = userMessages[0]?.content || "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a debate coach helping someone practice argumentation. The user is defending this position: "${userPosition}"

The opponent (AI) just said: "${lastAssistantMessage?.content || "No response yet"}"

Generate a strong counter-argument for the user to use. The counter-argument should:
- Directly address the opponent's latest points
- Use specific examples, statistics, or logical reasoning
- Be persuasive and well-structured
- Match a conversational debate tone

Output ONLY the counter-argument text itself. No explanations, no quotes, no "Here's a response:" prefix.
Keep it concise but powerful (2-4 sentences typically).`,
          },
          {
            role: "user",
            content: "Generate a counter-argument for me to use.",
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-help error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
