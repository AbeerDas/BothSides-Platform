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
    const { messages, requestFeedback } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Analyze user's communication style from their messages
    const userMessages = messages.filter((m: Message) => m.role === "user");
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || "";
    const avgUserLength = userMessages.length > 0 
      ? Math.round(userMessages.reduce((acc: number, m: Message) => acc + m.content.length, 0) / userMessages.length)
      : 100;
    
    // Determine response style based on user's style
    const isShort = avgUserLength < 150;
    const isCasual = /\b(lol|haha|yeah|nah|gonna|wanna|kinda|sorta|idk|imo|tbh|fr)\b/i.test(lastUserMessage);
    
    const systemPrompt = `You are a debate sparring partner. Your role is to challenge the user's claims and arguments to help them practice defending their positions.

CORE BEHAVIOR:
- Always argue AGAINST whatever position the user takes
- Be intellectually rigorous but conversational
- Ask probing questions and point out potential weaknesses
- Use specific examples, studies, historical events, or real-world scenarios to strengthen your counterpoints
- Cite hypothetical counterexamples or logical issues
- Stay focused on the specific claim, don't go off-topic

EXAMPLES & REFERENCES:
- Reference real-world examples: "Consider how [X country/company/event] handled this..."
- Cite types of studies: "Research in behavioral economics suggests..."
- Use analogies: "This is similar to how [comparable situation]..."
- Point to historical precedents: "History shows us with cases like..."
- Mention expert perspectives: "Experts in [field] often argue..."

STYLE MATCHING:
${isShort ? "- Keep responses SHORT (2-4 sentences max). Match the user's brevity." : "- You can be more detailed, but stay concise."}
${isCasual ? "- Use a casual, friendly tone. It's okay to be informal." : "- Be direct but conversational."}
- Mirror the user's energy level and formality
- This is practice, not a formal debate - keep it engaging
- Use **bold** for emphasis on key terms or concepts

FEEDBACK MODE:
${requestFeedback ? `The user wants feedback on the debate so far. Provide:
1. A score out of 10 for their argumentation
2. 2-3 specific strengths in their reasoning
3. 2-3 areas they could improve
4. Tips for their next debate
Be encouraging but honest.` : "Continue the debate normally."}

IMPORTANT:
- Never agree with the user's main claim
- If they make a strong point, acknowledge it briefly then pivot to another angle of attack
- Stay in character as the opposing debater
- Don't break character unless asked for feedback`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("debate-chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
