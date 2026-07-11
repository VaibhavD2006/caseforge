import { config } from "dotenv"
config({ path: ".env.local" })

// Imports below happen after env is loaded (CJS hoisting issue workaround: inline db creation)
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/lib/db/schema"
import {
  interviewTemplates,
  caseLibrary,
  promptTemplates,
  rubricConfigs,
  drills,
} from "@/lib/db/schema"
import scoringDimensions from "@/config/rubrics/scoring-dimensions.json"

async function seed() {
  const client = postgres(process.env.DATABASE_URL!, { prepare: false })
  const db = drizzle(client, { schema })
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
    {
      name: "interviewer_mbb_case_math_v1",
      type: "interviewer_system" as const,
      content: `You are a McKinsey-style case interviewer running a CASE MATH drill.

Your sole focus is quantitative reasoning. Present one focused math problem at a time.
Format: Give a clear setup with numbers, ask for a calculation, then evaluate their approach.

Rules:
- Ask them to walk through their math step-by-step out loud
- Challenge sloppy estimation ("why did you assume 10%?")
- Push for a sanity check after every answer ("does that number feel right?")
- If they get the right answer with bad process, ask them to re-explain their method
- Keep each problem to 3-4 minutes max, then move to a new one
- After 3 problems, give a brief summary of their quantitative strengths and gaps

Opening: "I'm going to run you through three quantitative problems. Walk me through your math out loud as you go — I care as much about your process as your answer. Ready?"`,
    },
    {
      name: "interviewer_mbb_pressure_round_v1",
      type: "interviewer_system" as const,
      content: `You are a senior McKinsey partner running a high-pressure final round interview.

Your job is to stress-test the candidate's composure, decisiveness, and ability to think under fire.

Rules:
- Push back on every recommendation, even correct ones ("but why wouldn't the competitor just copy that?")
- Ask for specificity relentlessly ("what exactly do you mean by 'improve margins'?")
- Interrupt if they are rambling more than 30 seconds without a clear point
- Set artificial time pressure ("you have 60 seconds to give me your recommendation")
- If they back down too easily from correct reasoning, push harder ("I'm not convinced — defend it")
- Reward candidates who push back respectfully with logic, not ones who capitulate

Tone: Direct, demanding, respectful but not warm. This is a final-round pressure test.

Opening: "I've read your slides. I have 20 minutes. Walk me through your recommendation — and I'll push back on everything."`,
    },
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

  // ─── Drill Library (25 drills, 5 per skill dimension) ────────────────────────
  const drillData = [
    // STRUCTURE (5)
    { title: "MECE Profitability Breakdown", skillFocus: "structure" as const, drillType: "mini_case" as const, difficulty: "easy" as const, estimatedMinutes: 5, prompt: "Your client's profitability has declined. In 60 seconds, give me a MECE framework to diagnose the problem. Do not analyze yet — just the framework.", expectedTraits: ["Mutually exclusive buckets (e.g., revenue vs cost)", "Collectively exhaustive coverage", "No overlap between categories", "2-3 levels of decomposition"] },
    { title: "Market Entry Structure", skillFocus: "structure" as const, drillType: "mini_case" as const, difficulty: "medium" as const, estimatedMinutes: 7, prompt: "Structure a framework to evaluate whether a European apparel brand should enter the Indian market. Give me a 2-level MECE breakdown before doing any analysis.", expectedTraits: ["Market attractiveness pillar", "Competitive landscape pillar", "Internal capabilities pillar", "All pillars are MECE and exhaustive"] },
    { title: "Operations Improvement Structure", skillFocus: "structure" as const, drillType: "mini_case" as const, difficulty: "medium" as const, estimatedMinutes: 6, prompt: "A logistics company's delivery times have increased 30%. Structure your approach to diagnose the root cause. Give me your complete framework before diving into any specifics.", expectedTraits: ["People / Process / Technology breakdown or equivalent", "Covers both internal and external factors", "Explicit prioritization of where to look first"] },
    { title: "Growth Strategy Framework", skillFocus: "structure" as const, drillType: "mini_case" as const, difficulty: "hard" as const, estimatedMinutes: 8, prompt: "A $500M B2B software company wants to grow revenue by 40% in 3 years. Structure an exhaustive set of growth levers before recommending anything.", expectedTraits: ["Organic vs inorganic split", "Revenue growth levers (new customers, retention, upsell)", "Market expansion options", "Clear prioritization rationale"] },
    { title: "Cost Reduction MECE Tree", skillFocus: "structure" as const, drillType: "math_exercise" as const, difficulty: "easy" as const, estimatedMinutes: 5, prompt: "A retailer needs to cut costs by $50M. Give me a MECE cost tree covering all possible cost buckets. Be exhaustive — I want every major cost category covered with no overlap.", expectedTraits: ["COGS, SG&A, CapEx clearly distinguished", "Sub-buckets within each major category", "No bucket appears twice", "Collectively exhaustive — nothing major is missing"] },
    // HYPOTHESIS (5)
    { title: "Revenue Decline Hypothesis", skillFocus: "hypothesis" as const, drillType: "mini_case" as const, difficulty: "easy" as const, estimatedMinutes: 5, prompt: "A consumer goods company's revenue dropped 20% in 6 months. Before asking any clarifying questions, give me your top hypothesis for the most likely cause and explain your reasoning.", expectedTraits: ["Specific and testable hypothesis (not just 'revenue or cost')", "Grounded in business logic", "Explains which data would confirm or refute it", "Prioritizes one hypothesis over others with rationale"] },
    { title: "Churn Root Cause Hypothesis", skillFocus: "hypothesis" as const, drillType: "mini_case" as const, difficulty: "medium" as const, estimatedMinutes: 6, prompt: "A SaaS company's monthly churn jumped from 2% to 5% after a product update three months ago. State your top hypothesis and the one piece of data you'd want most to test it.", expectedTraits: ["Hypothesis is specific and directional", "Connects the product update to the churn driver logically", "Names one specific diagnostic data point", "Eliminates at least one alternative hypothesis"] },
    { title: "Market Share Loss Hypothesis", skillFocus: "hypothesis" as const, drillType: "mini_case" as const, difficulty: "medium" as const, estimatedMinutes: 7, prompt: "A regional grocery chain lost 8 points of market share over two years. The market itself grew 5% annually during that period. State your leading hypothesis before any data review.", expectedTraits: ["Distinguishes between losing existing customers vs failing to win new ones", "Considers competitive dynamic vs own-store issues", "Testable with specific data", "Shows logical deduction rather than generic enumeration"] },
    { title: "Hospital Cost Overrun Hypothesis", skillFocus: "hypothesis" as const, drillType: "mini_case" as const, difficulty: "hard" as const, estimatedMinutes: 8, prompt: "A hospital's cost per patient has risen 25% in 18 months. Staffing is flat, volumes are flat, and there have been no major capital projects. Lead with your hypothesis and explain your logic chain.", expectedTraits: ["Investigates input costs (supplies, drugs, energy)", "Considers payer mix shift", "Considers acuity change — are patients sicker?", "Clear logical chain from facts to hypothesis"] },
    { title: "New Product Underperformance Hypothesis", skillFocus: "hypothesis" as const, drillType: "mini_case" as const, difficulty: "easy" as const, estimatedMinutes: 5, prompt: "A company launched a new product six months ago. Sales are 40% below forecast. State your hypothesis about why and what you'd want to check first.", expectedTraits: ["Distinguishes between demand problem vs supply/distribution problem vs pricing", "Considers forecast accuracy as a factor", "Names specific diagnostic questions", "Clear prioritization of most likely cause"] },
    // QUANTITATIVE (5)
    { title: "15% of 240", skillFocus: "quantitative" as const, drillType: "math_exercise" as const, difficulty: "easy" as const, estimatedMinutes: 2, prompt: "Without a calculator: A retailer's margin is 15% on $240 of revenue per transaction. What is the gross profit per transaction? Show your calculation clearly and explain your approach.", expectedTraits: ["Correct answer: $36", "Clear step-by-step verbal math", "Uses a clean decomposition (10% = $24, 5% = $12)", "Checks the answer"] },
    { title: "Market Size Estimation Math", skillFocus: "quantitative" as const, drillType: "math_exercise" as const, difficulty: "medium" as const, estimatedMinutes: 5, prompt: "Estimate the annual revenue of the US gym industry. Show your math step by step, state each assumption explicitly, and provide a sanity check at the end.", expectedTraits: ["US population → adult population → gym member %%", "Average monthly membership fee × 12", "Clear assumptions stated before each calculation", "Sanity check vs known data points (e.g., Planet Fitness annual revenue)"] },
    { title: "Break-Even Calculation", skillFocus: "quantitative" as const, drillType: "math_exercise" as const, difficulty: "medium" as const, estimatedMinutes: 5, prompt: "A new product has fixed costs of $2M per year and a contribution margin of $40 per unit. How many units must be sold annually to break even? Now: if we want to earn $500K in profit, what's the target volume?", expectedTraits: ["Break-even: $2M / $40 = 50,000 units", "Profit target: ($2M + $500K) / $40 = 62,500 units", "Verbal explanation of the formula logic", "Sanity check on the answer"] },
    { title: "Compounding Revenue Growth", skillFocus: "quantitative" as const, drillType: "math_exercise" as const, difficulty: "hard" as const, estimatedMinutes: 6, prompt: "A company has $100M revenue and is growing at 25% per year. Approximately what will revenue be in 3 years? Use the Rule of 72 or another estimation method — no need for exact compounding.", expectedTraits: ["Year 1: ~$125M, Year 2: ~$156M, Year 3: ~$195M (or Rule of 72 approximation)", "Explains estimation method used", "Acknowledges approximation", "Sanity checks using a different approach"] },
    { title: "Unit Economics Analysis", skillFocus: "quantitative" as const, drillType: "math_exercise" as const, difficulty: "hard" as const, estimatedMinutes: 8, prompt: "A subscription company has: $60 average monthly revenue per customer, 15% monthly churn, and $180 CAC. Calculate LTV, LTV/CAC ratio, and payback period. Explain whether this is a healthy unit economics profile.", expectedTraits: ["LTV = $60 / 15% = $400", "LTV/CAC = $400 / $180 = 2.2x (below healthy 3x benchmark)", "Payback = $180 / $60 = 3 months", "Correct interpretation: LTV/CAC is marginal; needs improvement"] },
    // SYNTHESIS (5)
    { title: "One-Minute Recommendation", skillFocus: "synthesis" as const, drillType: "synthesis_prompt" as const, difficulty: "easy" as const, estimatedMinutes: 4, prompt: "You've just analyzed a fast food chain that is losing $12M annually. Key findings: (1) beverage margin is 3x food margin, (2) drive-through accounts for 70% of orders, (3) average ticket size is $8 vs competitor average of $11. Give me your recommendation in 60 seconds — lead with the conclusion.", expectedTraits: ["Leads with recommendation, not analysis", "Recommendation is specific and actionable", "Ties recommendation to the highest-impact finding", "Mentions implementation or risk briefly"] },
    { title: "Elevator Pitch Synthesis", skillFocus: "synthesis" as const, drillType: "synthesis_prompt" as const, difficulty: "medium" as const, estimatedMinutes: 5, prompt: "You're in an elevator with the CEO. You have 30 seconds. Based on these three findings — (1) our net promoter score dropped 15 points, (2) our churn is 3x higher among customers who contact support, (3) support response time averages 48 hours — what do you tell her?", expectedTraits: ["One crisp recommendation (reduce support response time)", "Explains the data linkage in one sentence", "States expected business impact", "No more than 3 sentences total"] },
    { title: "Conflicting Data Synthesis", skillFocus: "synthesis" as const, drillType: "synthesis_prompt" as const, difficulty: "hard" as const, estimatedMinutes: 8, prompt: "You have two conflicting signals: revenue is growing 20% YoY, but cash flow is deeply negative and getting worse. Synthesize these into a clear recommendation for what the CEO should focus on first.", expectedTraits: ["Identifies the tension explicitly", "Resolves the conflict with a clear POV (e.g., revenue growth is masking margin erosion)", "Leads with recommendation, then explains the reasoning", "Acknowledges what's still uncertain"] },
    { title: "Three-Finding Synthesis", skillFocus: "synthesis" as const, drillType: "synthesis_prompt" as const, difficulty: "medium" as const, estimatedMinutes: 6, prompt: "Synthesize these three findings into a single clear recommendation: (1) The client's largest product line has shrinking margins. (2) A competitor just launched a direct substitute at 20% lower price. (3) The client has high brand loyalty among customers over 45 but low loyalty with under-35 customers.", expectedTraits: ["Single clear recommendation (not three separate actions)", "Ties all three findings into one coherent narrative", "Addresses the most urgent issue first", "Recommends a specific strategic direction"] },
    { title: "Partner-Ready Final Answer", skillFocus: "synthesis" as const, drillType: "synthesis_prompt" as const, difficulty: "hard" as const, estimatedMinutes: 8, prompt: "The partner walks in. You have 90 seconds to tell her: Should this pharmaceutical company acquire a competitor for $2B? Key facts: Target has $300M revenue, 40% EBITDA margins, and a drug pipeline with one high-probability approval. Your client has $3B in cash and a strategic gap in oncology.", expectedTraits: ["Leads with yes/no recommendation immediately", "Uses the most compelling data points to support", "Acknowledges the main risk in one sentence", "Ends with a clear next step or condition"] },
    // COMMUNICATION (5)
    { title: "Signposted Answer Structure", skillFocus: "communication" as const, drillType: "communication_exercise" as const, difficulty: "easy" as const, estimatedMinutes: 5, prompt: "Answer this question, using explicit signposting: 'Why do you want to work in consulting?' You must say 'first,' 'second,' and 'finally' at the appropriate points, and your answer should be no more than 90 seconds when spoken.", expectedTraits: ["Uses explicit signposting (first/second/finally)", "Each section is distinct and purposeful", "Total length is appropriate (not too long)", "Answer feels natural, not robotic"] },
    { title: "Explain a Complex Concept Simply", skillFocus: "communication" as const, drillType: "communication_exercise" as const, difficulty: "medium" as const, estimatedMinutes: 5, prompt: "Explain what 'contribution margin' is to a client who is a founder with no finance background. Be clear, simple, and concrete. Use an example. Aim for 60 seconds.", expectedTraits: ["Avoids jargon or defines terms immediately", "Uses a concrete, relatable example", "One clear sentence stating what it is", "Does not over-explain or over-complicate"] },
    { title: "Pushback Response", skillFocus: "communication" as const, drillType: "communication_exercise" as const, difficulty: "medium" as const, estimatedMinutes: 5, prompt: "I'm going to push back on you. Your job is to respond confidently without being defensive. Here's my pushback: 'I don't think your cost estimate makes sense. You're assuming a 20% margin but our historical margins have been 12%. Why should I trust your number?'", expectedTraits: ["Acknowledges the pushback without caving", "Explains the rationale for the assumption", "Offers to revisit if the client provides better data", "Maintains composure — no apologizing unnecessarily"] },
    { title: "Concise Email Summary", skillFocus: "communication" as const, drillType: "communication_exercise" as const, difficulty: "medium" as const, estimatedMinutes: 7, prompt: "Write a 5-sentence email to a CFO summarizing this finding: The company's marketing spend has doubled over 2 years, but customer acquisition cost has only improved 10%, suggesting diminishing returns on marketing investment. Recommend a next step.", expectedTraits: ["Opens with the key finding, not background", "5 sentences or fewer", "Specific recommendation in the last sentence", "No jargon, professional but direct tone"] },
    { title: "Tell Me About Yourself (Consulting Pitch)", skillFocus: "communication" as const, drillType: "communication_exercise" as const, difficulty: "easy" as const, estimatedMinutes: 4, prompt: "Give me a 60-second 'tell me about yourself' pitch tailored for a consulting interview. Structure it as: where you've been, what you've learned, and why consulting now. No filler, no rambling.", expectedTraits: ["Chronological narrative that is easy to follow", "Each section (past/present/future) clearly delineated", "'Why consulting' is specific and genuine, not generic", "Total pitch is 60 seconds or less"] },
  ]

  await db.insert(drills).values(drillData).onConflictDoNothing()
  console.log(`✓ ${drillData.length} drills seeded`)
  console.log("Seeding complete.")
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
