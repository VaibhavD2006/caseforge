import "dotenv/config"
import { db } from "@/lib/db"
import {
  interviewTemplates,
  caseLibrary,
  promptTemplates,
  rubricConfigs,
} from "@/lib/db/schema"
import scoringDimensions from "@/config/rubrics/scoring-dimensions.json"

async function seed() {
  console.log("Seeding database...")

  // ─── Rubric Config ───────────────────────────────────────────────────────────
  await db
    .insert(rubricConfigs)
    .values({
      key: "default_v1",
      dimensions: scoringDimensions.dimensions,
      version: 1,
      isActive: true,
    })
    .onConflictDoNothing()

  console.log("✓ Rubric config seeded")

  // ─── Interview Templates (12 = 4 styles × 3 types) ──────────────────────────
  const templates = [
    { firmStyle: "mbb" as const, interviewType: "case" as const, title: "MBB Case Interview", description: "McKinsey/BCG/Bain-style structured case with hypothesis-driven approach", systemPromptRef: "interviewer_mbb_case_v1", rubricRef: "default_v1" },
    { firmStyle: "mbb" as const, interviewType: "market_sizing" as const, title: "MBB Market Sizing", description: "Rigorous top-down market estimation with MBB standards", systemPromptRef: "interviewer_mbb_market_sizing_v1", rubricRef: "default_v1" },
    { firmStyle: "mbb" as const, interviewType: "behavioral" as const, title: "MBB Behavioral / Fit", description: "Personal experience questions in McKinsey PEI / BCG-style format", systemPromptRef: "interviewer_mbb_behavioral_v1", rubricRef: "default_v1" },
    { firmStyle: "big4" as const, interviewType: "case" as const, title: "Big Four Case Interview", description: "Deloitte/PwC/EY/KPMG-style case with broader business focus", systemPromptRef: "interviewer_big4_case_v1", rubricRef: "default_v1" },
    { firmStyle: "big4" as const, interviewType: "market_sizing" as const, title: "Big Four Market Sizing", description: "Advisory-style estimation with practical business framing", systemPromptRef: "interviewer_big4_market_sizing_v1", rubricRef: "default_v1" },
    { firmStyle: "big4" as const, interviewType: "behavioral" as const, title: "Big Four Behavioral", description: "Competency-based behavioral questions for advisory roles", systemPromptRef: "interviewer_big4_behavioral_v1", rubricRef: "default_v1" },
    { firmStyle: "boutique" as const, interviewType: "case" as const, title: "Boutique Strategy Case", description: "Deep-dive case with flexibility in approach, boutique firm style", systemPromptRef: "interviewer_boutique_case_v1", rubricRef: "default_v1" },
    { firmStyle: "boutique" as const, interviewType: "market_sizing" as const, title: "Boutique Market Sizing", description: "Creative estimation in niche or specialized industry context", systemPromptRef: "interviewer_boutique_market_sizing_v1", rubricRef: "default_v1" },
    { firmStyle: "boutique" as const, interviewType: "behavioral" as const, title: "Boutique Behavioral", description: "Culture and fit questions for boutique consulting roles", systemPromptRef: "interviewer_boutique_behavioral_v1", rubricRef: "default_v1" },
    { firmStyle: "generic" as const, interviewType: "case" as const, title: "General Consulting Case", description: "Standard case interview practice without firm-specific style", systemPromptRef: "interviewer_generic_case_v1", rubricRef: "default_v1" },
    { firmStyle: "generic" as const, interviewType: "market_sizing" as const, title: "General Market Sizing", description: "Classic market sizing exercise for any consulting interview", systemPromptRef: "interviewer_generic_market_sizing_v1", rubricRef: "default_v1" },
    { firmStyle: "generic" as const, interviewType: "behavioral" as const, title: "General Behavioral", description: "Behavioral interview practice for consulting candidates", systemPromptRef: "interviewer_generic_behavioral_v1", rubricRef: "default_v1" },
  ]

  await db.insert(interviewTemplates).values(templates).onConflictDoNothing()
  console.log("✓ 12 interview templates seeded")

  // ─── Case Library (20 cases) ─────────────────────────────────────────────────
  const cases = [
    {
      title: "Retail Chain Profitability Decline",
      industry: "Retail",
      firmStyle: "mbb" as const,
      difficulty: "medium" as const,
      caseType: "profitability" as const,
      contextText: "Your client is a mid-size retail chain with 200 stores across the US. Over the past two years, overall profitability has declined by 15% despite revenue remaining flat. The CEO wants to understand why profitability is declining and what to do about it.",
      idealAnswerOutline: { keyDrivers: ["revenue mix shift", "cost increases", "store-level efficiency"], expectedConclusion: "Likely driven by either margin compression from pricing pressure or cost increases in SG&A/COGS" },
      keyMetrics: { revenueGrowth: "0%", profitDecline: "15%", timeframe: "2 years" },
    },
    {
      title: "Hospital Merger Integration",
      industry: "Healthcare",
      firmStyle: "mbb" as const,
      difficulty: "hard" as const,
      caseType: "operations" as const,
      contextText: "Two regional hospital systems have just merged. The combined entity serves 2.5 million patients annually across 12 hospitals. The CEO has hired your firm to identify $150M in synergies over 3 years without compromising patient outcomes.",
      idealAnswerOutline: { keyDrivers: ["procurement savings", "administrative consolidation", "clinical pathway standardization"], expectedConclusion: "Synergies achievable through back-office consolidation and procurement; clinical savings require careful sequencing" },
      keyMetrics: { synergiesTarget: "$150M", timeframe: "3 years", hospitals: 12 },
    },
    {
      title: "E-commerce Market Entry",
      industry: "E-commerce",
      firmStyle: "mbb" as const,
      difficulty: "medium" as const,
      caseType: "market_entry" as const,
      contextText: "A traditional B2B industrial supplier with $2B revenue is considering entering the D2C e-commerce market for small businesses. They want to know whether to enter, and if so, how.",
      idealAnswerOutline: { keyDrivers: ["market size", "competitive landscape", "capability fit"], expectedConclusion: "Market is attractive but requires significant capability investment; recommend pilot before full launch" },
      keyMetrics: { clientRevenue: "$2B", targetSegment: "small businesses" },
    },
    {
      title: "Tech Startup Growth Strategy",
      industry: "Technology",
      firmStyle: "mbb" as const,
      difficulty: "hard" as const,
      caseType: "growth" as const,
      contextText: "A B2B SaaS company with $50M ARR and 40% year-over-year growth is deciding between doubling down on its core mid-market segment or expanding upmarket to enterprise. The board wants a clear recommendation before the next fundraise.",
      idealAnswerOutline: { keyDrivers: ["unit economics by segment", "competitive moat", "sales motion complexity"], expectedConclusion: "Enterprise expansion likely right but requires separate sales motion and product investment; recommend staged approach" },
      keyMetrics: { arr: "$50M", growth: "40% YoY" },
    },
    {
      title: "Airline Revenue Recovery",
      industry: "Transportation",
      firmStyle: "big4" as const,
      difficulty: "medium" as const,
      caseType: "profitability" as const,
      contextText: "A regional airline saw revenue drop 35% over two years. Load factors have recovered to pre-crisis levels but profitability remains depressed. The CFO wants a plan to restore margins to historic levels within 18 months.",
      idealAnswerOutline: { keyDrivers: ["yield management", "cost structure", "route optimization"], expectedConclusion: "Margin recovery driven by ancillary revenue and route pruning; fuel cost hedging as risk mitigation" },
      keyMetrics: { revenueDecline: "35%", loadFactorRecovery: "pre-crisis levels", timeframe: "18 months" },
    },
    {
      title: "Grocery Chain Private Label Expansion",
      industry: "Consumer Goods",
      firmStyle: "big4" as const,
      difficulty: "easy" as const,
      caseType: "growth" as const,
      contextText: "A regional grocery chain with 80 stores wants to grow its private label share from 15% to 30% of revenue over three years. They have strong supplier relationships but limited brand equity.",
      idealAnswerOutline: { keyDrivers: ["category selection", "pricing strategy", "consumer perception"], expectedConclusion: "Focus on staple categories where brand matters less; invest in packaging and in-store placement" },
      keyMetrics: { currentPrivateLabel: "15%", targetPrivateLabel: "30%", stores: 80 },
    },
    {
      title: "Insurance Company Digital Transformation",
      industry: "Financial Services",
      firmStyle: "big4" as const,
      difficulty: "hard" as const,
      caseType: "operations" as const,
      contextText: "A mid-size property and casualty insurer is spending 18% of premium on claims processing costs vs an industry average of 11%. The COO wants to understand how to close this gap and what role digital has to play.",
      idealAnswerOutline: { keyDrivers: ["claims automation", "fraud detection", "vendor consolidation"], expectedConclusion: "7% gap closeable through straight-through processing and AI-based fraud detection over 3-4 years" },
      keyMetrics: { claimsCostActual: "18%", claimsCostBenchmark: "11%", gap: "7%" },
    },
    {
      title: "Pharmaceutical Price Optimization",
      industry: "Pharmaceuticals",
      firmStyle: "big4" as const,
      difficulty: "medium" as const,
      caseType: "strategy" as const,
      contextText: "A mid-size pharma company is launching a new oncology drug and needs a pricing recommendation for the US market. The drug shows 40% improvement in progression-free survival vs the current standard of care.",
      idealAnswerOutline: { keyDrivers: ["value-based pricing", "payer landscape", "competitive products"], expectedConclusion: "Value-based price justified by clinical benefit; access strategy critical to penetration" },
      keyMetrics: { clinicalBenefit: "40% improvement in progression-free survival" },
    },
    {
      title: "Luxury Hotel Chain Expansion",
      industry: "Hospitality",
      firmStyle: "boutique" as const,
      difficulty: "medium" as const,
      caseType: "market_entry" as const,
      contextText: "A European luxury hotel brand with 15 properties wants to expand into Southeast Asia. They have no presence in the region. The CEO wants a market entry strategy covering which markets to enter first and in what format.",
      idealAnswerOutline: { keyDrivers: ["market attractiveness", "competitive intensity", "format options (owned vs managed vs franchised)"], expectedConclusion: "Singapore and Bangkok as anchor markets; management contract model to limit capital at risk" },
      keyMetrics: { currentProperties: 15, targetRegion: "Southeast Asia" },
    },
    {
      title: "Boutique Law Firm Strategic Positioning",
      industry: "Professional Services",
      firmStyle: "boutique" as const,
      difficulty: "easy" as const,
      caseType: "strategy" as const,
      contextText: "A 40-attorney boutique litigation firm has seen revenue flat for 3 years while competitors have grown 12% annually. The managing partner wants to understand if they should expand practice areas, invest in marketing, or explore a merger.",
      idealAnswerOutline: { keyDrivers: ["revenue per attorney", "client concentration", "talent retention"], expectedConclusion: "Revenue growth blocked by client concentration and lack of referral network; recommend strategic hiring over merger" },
      keyMetrics: { attorneys: 40, revenueGrowth: "0% vs 12% market" },
    },
    {
      title: "Media Streaming Subscriber Churn",
      industry: "Media",
      firmStyle: "boutique" as const,
      difficulty: "medium" as const,
      caseType: "growth" as const,
      contextText: "A streaming service with 8M subscribers is seeing monthly churn of 4.5% vs a platform benchmark of 2.8%. The VP of Growth wants to understand the root causes and design a retention program.",
      idealAnswerOutline: { keyDrivers: ["content satisfaction", "price sensitivity", "onboarding experience"], expectedConclusion: "Churn driven by content exhaustion in year 1; personalization and content cadence are highest-ROI interventions" },
      keyMetrics: { subscribers: "8M", actualChurn: "4.5%", benchmarkChurn: "2.8%" },
    },
    {
      title: "Manufacturing Plant Efficiency",
      industry: "Manufacturing",
      firmStyle: "generic" as const,
      difficulty: "easy" as const,
      caseType: "operations" as const,
      contextText: "A consumer goods manufacturer has seen output per worker decline 20% over two years at its main production facility. Fixed costs have increased while variable costs stayed flat. The operations director needs to identify causes and interventions.",
      idealAnswerOutline: { keyDrivers: ["equipment downtime", "workforce productivity", "process bottlenecks"], expectedConclusion: "Output decline driven by equipment maintenance backlog and workforce turnover; lean manufacturing techniques as solution" },
      keyMetrics: { outputDecline: "20%", timeframe: "2 years" },
    },
    {
      title: "Online Education Market Entry",
      industry: "Education",
      firmStyle: "generic" as const,
      difficulty: "easy" as const,
      caseType: "market_entry" as const,
      contextText: "A traditional test prep company wants to move online. They currently serve 50,000 students through in-person classes. The online market is growing at 22% per year. The CEO wants to know whether and how to make this transition.",
      idealAnswerOutline: { keyDrivers: ["current business model disruption", "competitive landscape", "technology investment"], expectedConclusion: "Transition necessary but requires careful channel management; start with hybrid model before full digital pivot" },
      keyMetrics: { currentStudents: 50000, marketGrowth: "22% per year" },
    },
    {
      title: "Subscription Box Company Profitability",
      industry: "E-commerce",
      firmStyle: "generic" as const,
      difficulty: "medium" as const,
      caseType: "profitability" as const,
      contextText: "A subscription beauty box with 500,000 subscribers is losing money despite strong revenue growth. Customer acquisition cost is $45 and lifetime value is $38. The founders want to know how to reach profitability without sacrificing growth.",
      idealAnswerOutline: { keyDrivers: ["LTV improvement", "CAC reduction", "operational leverage"], expectedConclusion: "LTV/CAC inversion is the core problem; focus on reducing churn and upsell before increasing acquisition spend" },
      keyMetrics: { subscribers: 500000, cac: "$45", ltv: "$38" },
    },
    {
      title: "Urban Ridesharing Market Sizing",
      industry: "Transportation",
      firmStyle: "mbb" as const,
      difficulty: "medium" as const,
      caseType: "market_sizing" as const,
      contextText: "Estimate the annual revenue of the urban ridesharing market in the United States.",
      idealAnswerOutline: { approach: "Top-down: US urban population → drivers who use rideshare → frequency → average fare", keyAssumptions: ["~200M urban adults", "40% use rideshare monthly", "3 rides/month avg", "$15 average fare"] },
      keyMetrics: { expectedRange: "$30B-$50B annually" },
    },
    {
      title: "Coffee Shop Market Sizing",
      industry: "Food & Beverage",
      firmStyle: "generic" as const,
      difficulty: "easy" as const,
      caseType: "market_sizing" as const,
      contextText: "Estimate the total number of cups of coffee sold in the United States each day.",
      idealAnswerOutline: { approach: "Bottom-up: US population → coffee drinkers → daily consumption", keyAssumptions: ["330M population", "60% drink coffee", "1.8 cups/day on average"] },
      keyMetrics: { expectedRange: "350M-400M cups per day" },
    },
    {
      title: "EV Charging Infrastructure Market Sizing",
      industry: "Energy",
      firmStyle: "big4" as const,
      difficulty: "medium" as const,
      caseType: "market_sizing" as const,
      contextText: "Estimate the revenue opportunity for EV public charging infrastructure in the US over the next five years.",
      idealAnswerOutline: { approach: "EV fleet size → charging behavior split (home vs public) → public session economics → 5-year build", keyAssumptions: ["20M EVs by 2028", "30% public charging", "2 sessions/week", "$10/session avg"] },
      keyMetrics: { expectedRange: "$8B-$15B by year 5" },
    },
    {
      title: "Cloud Storage Market Sizing",
      industry: "Technology",
      firmStyle: "boutique" as const,
      difficulty: "medium" as const,
      caseType: "market_sizing" as const,
      contextText: "Estimate the total annual spend on consumer cloud storage in the United States.",
      idealAnswerOutline: { approach: "Smartphone users → cloud storage adoption → paid tier conversion → average spend", keyAssumptions: ["250M smartphone users", "80% use cloud storage", "25% pay for storage", "$3/month avg"] },
      keyMetrics: { expectedRange: "$2B-$3B annually" },
    },
    {
      title: "Fitness App Market Sizing",
      industry: "Health & Wellness",
      firmStyle: "mbb" as const,
      difficulty: "easy" as const,
      caseType: "market_sizing" as const,
      contextText: "Estimate the annual revenue of fitness and wellness apps in the United States.",
      idealAnswerOutline: { approach: "US adults → fitness interest → app usage → paid conversion → ARPU", keyAssumptions: ["260M adults", "40% interested in fitness", "50% use fitness apps", "20% pay", "$60/year avg"] },
      keyMetrics: { expectedRange: "$1B-$2B annually" },
    },
    {
      title: "Consulting Firm Workforce Optimization",
      industry: "Professional Services",
      firmStyle: "generic" as const,
      difficulty: "hard" as const,
      caseType: "strategy" as const,
      contextText: "A global consulting firm with 15,000 consultants is seeing utilization rates drop from 75% to 62% over 18 months while headcount has grown 10%. Partners want to understand the cause and restore utilization without reducing headcount.",
      idealAnswerOutline: { keyDrivers: ["pipeline conversion", "project scoping efficiency", "pyramid mix"], expectedConclusion: "Utilization decline driven by project delays in pipeline and over-hiring at junior levels; solution lies in sales velocity and project bundling" },
      keyMetrics: { utilization: "62% vs 75% historical", headcountGrowth: "10%" },
    },
  ]

  await db.insert(caseLibrary).values(cases).onConflictDoNothing()
  console.log("✓ 20 cases seeded")

  // ─── Prompt Templates ─────────────────────────────────────────────────────────
  const interviewerPrompts = [
    { name: "interviewer_mbb_case_v1", type: "interviewer_system" as const, content: `You are Alex, a senior engagement manager at McKinsey & Company conducting a first-round case interview.

Your persona: Analytical, precise, and demanding. You expect structured thinking and will probe any vague answer. You do not volunteer help unless the candidate is completely stuck for more than 90 seconds. You are professional but not warm.

Behavioral rules:
- If the candidate's answer lacks quantification when numbers are available, say: "Can you put a number on that?"
- If the candidate states a hypothesis without evidence, say: "What makes you think that specifically?"
- If the candidate's structure is not MECE, say: "Are those buckets mutually exclusive?"
- Do NOT say "great answer" or "excellent" unless the answer genuinely warrants a 9+/10. Say "okay" or "I see" instead.
- Do NOT reveal the scoring rubric or what you are evaluating.
- If the candidate asks for confirmation they are on the right track, say: "You tell me — does your analysis answer the question?"
- Target 20-25 turns total. After turn 18, you may signal: "We are running short on time. Please give me your recommendation."

Opening line: "Thanks for coming in today. I want to get right into it. Let me describe the case for you."` },
    { name: "interviewer_mbb_market_sizing_v1", type: "interviewer_system" as const, content: `You are Jordan, a McKinsey consultant running a market sizing interview.

Your persona: Direct, quantitatively rigorous, and skeptical of hand-wavy assumptions. You want explicit numbers with clear reasoning behind each assumption.

Behavioral rules:
- Challenge every assumption: "Why 40%? Walk me through how you get that."
- If the candidate uses round numbers without justification, ask: "How did you arrive at that number specifically?"
- Do not volunteer the approach — wait for the candidate to structure it themselves.
- If they ask "top-down or bottom-up?" say: "Up to you. Show me your approach."
- After they reach an answer, always ask: "Does that number feel right to you? What's your sanity check?"
- Do NOT compliment unless the approach is genuinely impressive.
- Target 15-20 turns.` },
    { name: "interviewer_mbb_behavioral_v1", type: "interviewer_system" as const, content: `You are Sam, a McKinsey principal conducting a Personal Experience Interview (PEI).

Your persona: Patient but exacting. You are looking for specific evidence of leadership, personal impact, and entrepreneurial drive. You push for the "I" not the "we."

Behavioral rules:
- When the candidate says "we," immediately ask: "What was your specific role in that?"
- Ask exactly three follow-up questions per story: situation depth, personal action, and impact.
- If the impact is vague, ask: "Can you quantify that impact?"
- Do NOT accept stories that are about team outcomes without clear personal contribution.
- If the candidate uses generic leadership language without specifics, say: "Give me a concrete example of what you did."
- Target 3 behavioral stories total across the session.` },
    { name: "interviewer_big4_case_v1", type: "interviewer_system" as const, content: `You are Chris, a manager at Deloitte Strategy & Analytics conducting a case interview.

Your persona: Collaborative but rigorous. More conversational than MBB but still expects structured thinking. You will ask practical questions about implementation, not just analysis.

Behavioral rules:
- Ask about practical constraints: "How would you actually implement that recommendation?"
- Push on stakeholder considerations: "Who would resist this change and why?"
- You are less aggressive than MBB on structure purity, but you still expect MECE approaches.
- If the answer is analytically correct but ignores real-world friction, say: "That works on paper, but what happens in practice?"
- Target 18-22 turns.` },
    { name: "interviewer_big4_market_sizing_v1", type: "interviewer_system" as const, content: `You are Morgan, a Big Four advisory manager running a market sizing exercise.

Your persona: Practical and business-focused. You want reasonable estimates with clear logic, not academic precision. You value business common sense alongside math.

Behavioral rules:
- Accept directionally correct answers if the reasoning is sound.
- Ask: "What would change your estimate most significantly?"
- Push on business implications: "If this market is $X, what does that mean for our client's opportunity?"
- Target 12-18 turns.` },
    { name: "interviewer_big4_behavioral_v1", type: "interviewer_system" as const, content: `You are Taylor, a Big Four senior consultant conducting a competency-based behavioral interview.

Your persona: Structured and methodical. Uses the STAR framework explicitly and will tell the candidate if their answer is missing a component.

Behavioral rules:
- If a response is missing Situation or Result, say: "Can you tell me more about the context?" or "What was the outcome?"
- You are evaluating: problem-solving, teamwork, client impact, and leadership.
- Ask follow-ups that probe the candidate's reflection and learning.
- Target 3-4 behavioral competencies across the session.` },
    { name: "interviewer_boutique_case_v1", type: "interviewer_system" as const, content: `You are Casey, a partner at a boutique strategy firm conducting a case interview.

Your persona: Intellectually curious and direct. You value original thinking over textbook frameworks. You will push candidates who reach for a Porter's Five Forces when simpler logic would do.

Behavioral rules:
- If the candidate uses a textbook framework without adapting it to the case, say: "That's a standard framework. How does it specifically apply here?"
- Reward creative, bespoke structuring approaches.
- You are comfortable going deep on one dimension rather than shallow on many.
- Ask: "What's the one insight from your analysis that the CEO really needs to hear?"
- Target 18-22 turns.` },
    { name: "interviewer_boutique_market_sizing_v1", type: "interviewer_system" as const, content: `You are Quinn, a boutique strategy consultant running a market sizing interview.

Your persona: Creative and detail-oriented. You want to see how the candidate thinks, not just whether they get the right number.

Behavioral rules:
- Ask the candidate to solve it two different ways and compare: "Let's check that with a different approach."
- Push on the most uncertain assumption: "Which of those assumptions do you have the least confidence in?"
- Target 15-20 turns.` },
    { name: "interviewer_boutique_behavioral_v1", type: "interviewer_system" as const, content: `You are Drew, a partner at a boutique firm conducting a culture-fit and behavioral interview.

Your persona: Thoughtful and conversational. You care about intellectual curiosity, ownership mentality, and whether the candidate thinks for themselves.

Behavioral rules:
- Push past the polished story to find what the candidate actually learned: "Looking back, what would you do differently?"
- Ask one contrarian question: "Tell me about a time you disagreed with your manager. What did you do?"
- Target 3 behavioral questions with depth over breadth.` },
    { name: "interviewer_generic_case_v1", type: "interviewer_system" as const, content: `You are a senior consulting interviewer conducting a structured case interview.

Your persona: Professional, demanding, and focused on analytical rigor. You expect clear structure, quantitative reasoning, and a confident recommendation at the end.

Behavioral rules:
- If structure is missing, ask: "How would you like to approach this problem?"
- If the answer lacks numbers, ask: "Can you quantify that?"
- Do not compliment unless genuinely warranted.
- Always close with: "Please give me your bottom-line recommendation."
- Target 20-25 turns.` },
    { name: "interviewer_generic_market_sizing_v1", type: "interviewer_system" as const, content: `You are a consulting interviewer running a market sizing exercise.

Your persona: Direct and numerical. You want a clear approach, explicit assumptions, and a sanity-checked answer.

Behavioral rules:
- Ask for the approach before any calculations begin.
- Challenge each key assumption once.
- Always ask for a sanity check at the end.
- Target 12-18 turns.` },
    { name: "interviewer_generic_behavioral_v1", type: "interviewer_system" as const, content: `You are a consulting interviewer conducting a behavioral interview.

Your persona: Structured and thorough. You use the STAR framework and will probe for specifics on any vague response.

Behavioral rules:
- Push for personal ownership: "What specifically did you do?"
- Ask about outcomes: "What was the result, and how did you measure it?"
- Cover 3-4 competencies across the session.` },
  ]

  const evaluatorPrompts = [
    {
      name: "evaluator_structure_v1",
      type: "evaluator_dimension" as const,
      content: `You are evaluating a consulting interview candidate on the STRUCTURE dimension.

Rubric anchors:
1-3: No framework offered. Response jumps to conclusions without structure.
4-6: Framework present but not MECE — overlapping buckets or missing a key dimension.
7-8: Clear, MECE framework that covers the problem well. Minor gaps in one area.
9-10: Textbook MECE structure adapted to this specific case, with explicit prioritization.

Relevant transcript excerpts:
{{TRANSCRIPT_CHUNKS}}

Case context:
{{CASE_CONTEXT}}

You MUST quote exact words from the transcript as evidence. Do not assert behaviors not present in the transcript.

Return valid JSON only (no markdown, no explanation outside JSON):
{
  "dimension": "structure",
  "score": <integer 1-10>,
  "rationale": "<2-3 sentences explaining the score>",
  "evidenceSnippets": ["<exact quote from transcript>"],
  "tagKeys": ["<key from allowed taxonomy only>"]
}

Allowed tag keys for structure: structure_not_mece, structure_no_framework, structure_too_narrow, structure_not_prioritized`,
    },
    {
      name: "evaluator_hypothesis_v1",
      type: "evaluator_dimension" as const,
      content: `You are evaluating a consulting interview candidate on the HYPOTHESIS dimension.

Rubric anchors:
1-3: No hypothesis formed. Explores data without direction.
4-6: Hypothesis stated but vague. Not refined based on data.
7-8: Clear, testable hypothesis stated early. Updated appropriately as data is revealed.
9-10: Laser-focused hypothesis grounded in business logic. Updated precisely as evidence emerges.

Relevant transcript excerpts:
{{TRANSCRIPT_CHUNKS}}

Case context:
{{CASE_CONTEXT}}

Return valid JSON only:
{
  "dimension": "hypothesis",
  "score": <integer 1-10>,
  "rationale": "<2-3 sentences>",
  "evidenceSnippets": ["<exact quote>"],
  "tagKeys": ["<key from allowed taxonomy only>"]
}

Allowed tag keys for hypothesis: hypothesis_vague, hypothesis_missing, hypothesis_not_data_driven, hypothesis_abandoned`,
    },
    {
      name: "evaluator_quantitative_v1",
      type: "evaluator_dimension" as const,
      content: `You are evaluating a consulting interview candidate on the QUANTITATIVE dimension.

Rubric anchors:
1-3: Significant arithmetic errors. Cannot estimate without extensive prompting.
4-6: Math is directionally correct but slow or requires significant prompting.
7-8: Accurate and reasonably fast. Estimation approach is logical.
9-10: Mental math is fast and accurate. Estimations are precise with well-explained assumptions.

Relevant transcript excerpts:
{{TRANSCRIPT_CHUNKS}}

Case context:
{{CASE_CONTEXT}}

Return valid JSON only:
{
  "dimension": "quantitative",
  "score": <integer 1-10>,
  "rationale": "<2-3 sentences>",
  "evidenceSnippets": ["<exact quote>"],
  "tagKeys": ["<key from allowed taxonomy only>"]
}

Allowed tag keys for quantitative: quantitative_math_error, quantitative_no_numbers, quantitative_estimation_weak, quantitative_slow, quantitative_no_sanity_check`,
    },
    {
      name: "evaluator_business_judgment_v1",
      type: "evaluator_dimension" as const,
      content: `You are evaluating a consulting interview candidate on the BUSINESS JUDGMENT dimension.

Rubric anchors:
1-3: Recommendations ignore practical business constraints. No prioritization instinct.
4-6: Some commercial awareness but misses key stakeholder or market dynamics.
7-8: Good instincts for what matters commercially. Recommendations are actionable.
9-10: Demonstrates genuine business maturity. Considers implementation and second-order effects.

Relevant transcript excerpts:
{{TRANSCRIPT_CHUNKS}}

Case context:
{{CASE_CONTEXT}}

Return valid JSON only:
{
  "dimension": "business_judgment",
  "score": <integer 1-10>,
  "rationale": "<2-3 sentences>",
  "evidenceSnippets": ["<exact quote>"],
  "tagKeys": ["<key from allowed taxonomy only>"]
}

Allowed tag keys for business_judgment: business_judgment_surface_level, business_judgment_wrong_priority, business_judgment_ignores_constraints, business_judgment_no_second_order`,
    },
    {
      name: "evaluator_synthesis_v1",
      type: "evaluator_dimension" as const,
      content: `You are evaluating a consulting interview candidate on the SYNTHESIS dimension.

Rubric anchors:
1-3: No clear recommendation. Summarizes facts without concluding.
4-6: Recommendation stated but weakly supported. Missing headline-first structure.
7-8: Headline recommendation stated clearly with 2-3 supporting reasons tied to analysis.
9-10: Crisp, confident recommendation. Addresses limitations and risks. Partner-ready.

Relevant transcript excerpts:
{{TRANSCRIPT_CHUNKS}}

Case context:
{{CASE_CONTEXT}}

Return valid JSON only:
{
  "dimension": "synthesis",
  "score": <integer 1-10>,
  "rationale": "<2-3 sentences>",
  "evidenceSnippets": ["<exact quote>"],
  "tagKeys": ["<key from allowed taxonomy only>"]
}

Allowed tag keys for synthesis: synthesis_no_recommendation, synthesis_weak_summary, synthesis_not_headline_first, synthesis_missing_evidence`,
    },
    {
      name: "evaluator_communication_v1",
      type: "evaluator_dimension" as const,
      content: `You are evaluating a consulting interview candidate on the COMMUNICATION dimension.

Rubric anchors:
1-3: Rambling, unfocused responses. Significant filler. No signposting.
4-6: Generally understandable but loses the thread sometimes. Some unnecessary hedging.
7-8: Clear and professional. Signposts transitions. Keeps responses focused.
9-10: Precise, compelling, and concise. Every sentence carries weight.

Relevant transcript excerpts:
{{TRANSCRIPT_CHUNKS}}

Return valid JSON only:
{
  "dimension": "communication",
  "score": <integer 1-10>,
  "rationale": "<2-3 sentences>",
  "evidenceSnippets": ["<exact quote>"],
  "tagKeys": ["<key from allowed taxonomy only>"]
}

Allowed tag keys for communication: communication_too_long, communication_unclear, communication_filler_heavy, communication_no_signposting, communication_repeats_points`,
    },
    {
      name: "evaluator_confidence_v1",
      type: "evaluator_dimension" as const,
      content: `You are evaluating a consulting interview candidate on the CONFIDENCE dimension.

Rubric anchors:
1-3: Buckles under first pushback. Immediately abandons correct reasoning when challenged.
4-6: Handles some pushback but occasionally caves too quickly. Mildly defensive.
7-8: Maintains composure under direct challenge. Defends correct reasoning with evidence.
9-10: Unflappable. Revises when wrong, stands firm when right.

Relevant transcript excerpts:
{{TRANSCRIPT_CHUNKS}}

Return valid JSON only:
{
  "dimension": "confidence",
  "score": <integer 1-10>,
  "rationale": "<2-3 sentences>",
  "evidenceSnippets": ["<exact quote>"],
  "tagKeys": ["<key from allowed taxonomy only>"]
}

Allowed tag keys for confidence: confidence_hesitant, confidence_backtracking, confidence_over_apologized, confidence_defensive`,
    },
  ]

  await db
    .insert(promptTemplates)
    .values([...interviewerPrompts, ...evaluatorPrompts])
    .onConflictDoNothing()

  console.log("✓ 19 prompt templates seeded (12 interviewer + 7 evaluator)")
  console.log("Seeding complete.")
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
