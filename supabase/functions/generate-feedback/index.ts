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

    const systemPrompt = `You are an elite competitive debate judge with 20+ years of experience at national and international debate tournaments. Analyze the debate with extreme precision and specificity.

SCORING SYSTEM (0.0-2.0 per category, total max 10.0):

IMPORTANT SCORING RULES:
- Be decisive! Avoid the 1.4-1.6 range (equivalent to 7.0-7.9 total) unless truly warranted
- Most debaters should score either below 1.3 (needs work) or above 1.7 (strong)
- A score of 1.5 should be rare - commit to whether they lean weak or strong
- Use the full range: 0.0-0.9 for poor, 1.0-1.3 for developing, 1.4-1.6 for average (rare), 1.7-1.9 for strong, 2.0 for exceptional

CATEGORY 1: LOGICAL ARCHITECTURE (0.0-2.0)
Subcriteria:
- Premise validity (0.0-0.5): Are foundational claims sound and defensible?
- Inferential strength (0.0-0.5): Do conclusions follow necessarily from premises?
- Structural coherence (0.0-0.5): Is the argument organized with clear thesis, support, conclusion?
- Fallacy avoidance (0.0-0.5): Deduct for ad hominem (-0.2), strawman (-0.3), false dichotomy (-0.2), circular reasoning (-0.3), red herrings (-0.2)

CATEGORY 2: EVIDENCE QUALITY (0.0-2.0)
Subcriteria:
- Specificity (0.0-0.5): Named studies, statistics, dates, or experts vs. vague claims
- Relevance (0.0-0.5): Evidence directly supports the claim being made
- Credibility (0.0-0.5): Sources cited or implied are authoritative
- Sufficiency (0.0-0.5): Enough evidence to warrant the conclusion

CATEGORY 3: REBUTTAL EFFECTIVENESS (0.0-2.0)
Subcriteria:
- Engagement (0.0-0.5): Directly addresses opponent's strongest points, not weak ones
- Refutation quality (0.0-0.5): Actually defeats the argument vs. merely questioning it
- Concession handling (0.0-0.5): Strategic concessions that strengthen overall position
- Clash depth (0.0-0.5): Goes beyond surface to core disagreements

CATEGORY 4: PERSUASIVE IMPACT (0.0-2.0)
Subcriteria:
- Clarity (0.0-0.5): Ideas expressed without ambiguity or confusion
- Framing (0.0-0.5): Controls the narrative and definitions effectively
- Emotional resonance (0.0-0.5): Appropriate pathos without replacing logos
- Memorability (0.0-0.5): Key points are distinct and memorable

CATEGORY 5: STRATEGIC EXECUTION (0.0-2.0)
Subcriteria:
- Burden management (0.0-0.5): Understands and addresses what they need to prove
- Anticipation (0.0-0.5): Preempts obvious objections
- Resource allocation (0.0-0.5): Time/attention on most important arguments
- Adaptability (0.0-0.5): Adjusts strategy based on opponent's moves

WINNING ASSESSMENT:
After scoring, determine who is "winning" the debate based on:
- Who has more standing arguments that weren't effectively rebutted
- Who better established their burden of proof
- Whose framing of the issue is more compelling

PRO TIPS FORMAT:
For each tip, provide:
1. A specific thing they could have said or done differently
2. How that would have improved their score toward a 10.0
3. A concrete example of what to say

You MUST respond with ONLY valid JSON:
{
  "overallScore": 8.3,
  "winningStatus": "USER is ahead - their economic arguments remain unrebutted, but AI's moral framing is compelling",
  "categories": [
    {"name": "Logical Architecture", "score": 1.7, "maxScore": 2.0, "feedback": "Strong premise validity with clear thesis. Minor gap: the causal link between X and Y was asserted but not demonstrated. Avoided major fallacies."},
    {"name": "Evidence Quality", "score": 1.5, "maxScore": 2.0, "feedback": "Referenced the Harvard study effectively. Could strengthen by citing specific statistics rather than 'studies show'."},
    {"name": "Rebuttal Effectiveness", "score": 1.8, "maxScore": 2.0, "feedback": "Excellent engagement with opponent's core claim. Directly dismantled the utility argument. Could improve by addressing the secondary point about X."},
    {"name": "Persuasive Impact", "score": 1.6, "maxScore": 2.0, "feedback": "Clear and well-organized. The opening framing was strong. Final summary could be more memorable."},
    {"name": "Strategic Execution", "score": 1.7, "maxScore": 2.0, "feedback": "Good burden awareness. Anticipated the economic objection. Could better allocate time - spent too long on tangential point Y."}
  ],
  "strengths": ["Your opening gambit effectively framed the debate around individual liberty, forcing the opponent to defend against your terms", "The specific example about Singapore's policy was precisely targeted and hard to rebut"],
  "improvements": ["When opponent brought up the cost-benefit analysis, you shifted topics instead of addressing it directly - this left a standing argument against you", "Your third response relied heavily on assertion without new evidence"],
  "tips": ["To score 10/10: When AI mentioned 'societal harm', you could have said: 'Even accepting harm reduction as a goal, data from Portugal's decriminalization shows that liberty-focused approaches reduce harm more effectively than prohibition' - this turns their framework against them", "Add specific numbers: Instead of 'research shows positive outcomes', say 'The 2019 Lancet study found a 47% reduction in overdose deaths' - specificity adds 0.3-0.5 to your Evidence score", "For perfect rebuttal: Quote your opponent's exact words back, then systematically dismantle each premise. Example: 'You claimed X because of Y. However, Y actually supports my position because...'"],
  "summary": "Strong logical foundation with good use of specific examples. Main weakness: leaving opponent's economic argument standing."
}`;

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
            content: `Analyze this debate where the USER is practicing their argumentation skills. Be decisive in your scoring - avoid clustering around 7.0-7.9 (1.4-1.6 per category). Commit to whether arguments are weak (<1.3) or strong (>1.7).

DEBATE TRANSCRIPT:
${debateContext}

Provide your detailed feedback as JSON. Remember to include winningStatus, specific pro tips with examples of what to say, and granular feedback for each category.` 
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

    // Add winningStatus if not present
    if (!feedback.winningStatus) {
      feedback.winningStatus = "Analysis complete";
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
