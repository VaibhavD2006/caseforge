import postgres from "postgres"
import { config } from "dotenv"
config({ path: ".env" })

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" })

// ── 1. Add industry column to drills ────────────────────────────────────────
await sql`ALTER TABLE drills ADD COLUMN IF NOT EXISTS industry text`
console.log("Added industry column to drills")

// ── 2. Add industry-primers resource category ───────────────────────────────
const existing = await sql`SELECT id FROM resource_categories WHERE slug = 'industry-primers'`
let industryPrimersCatId
if (existing.length > 0) {
  industryPrimersCatId = existing[0].id
  console.log("industry-primers category already exists")
} else {
  const [cat] = await sql`
    INSERT INTO resource_categories (id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), 'Industry Primers', 'industry-primers', 'High-level industry overviews for case interview prep', 'Briefcase', 7)
    RETURNING id`
  industryPrimersCatId = cat.id
  console.log("Created industry-primers category:", industryPrimersCatId)
}

// Category IDs (already known)
const CAT_VIDEOS = "4189016b-64aa-40f2-b7d4-46cf4a7f25d6"

// ── 3. Add Primerli resource ─────────────────────────────────────────────────
const primerliExists = await sql`SELECT id FROM resources WHERE slug = 'primerli'`
if (primerliExists.length === 0) {
  await sql`
    INSERT INTO resources (id, slug, title, description, content, format, difficulty, category_id, tags, is_featured, is_published, external_url, view_count, created_at, updated_at)
    VALUES (
      gen_random_uuid(), 'primerli', 'Primerli — Industry Primers for Consulting',
      'YouTube channel with concise, visual industry primers built specifically for consulting interview prep — covers healthcare, tech, financial services, retail, and more.',
      ${`## What Primerli Is

Primerli is a YouTube channel purpose-built for consulting interview candidates who need to get up to speed on industries quickly. The videos are short (typically 10-20 minutes), visual, and structured around the questions a case interviewer is most likely to explore — not deep industry expertise, but the right surface area for a case context.

## Why Industry Knowledge Matters

Knowing an industry's fundamentals before a case does two things. First, it helps you generate better hypotheses faster — if you know that pharma companies face high R&D amortization costs, you will identify that as a cost driver without needing the interviewer to prompt you. Second, it signals genuine engagement. Interviewers notice when a candidate's brainstorming reflects actual sector knowledge versus generic business thinking.

## What Primerli Covers

The channel covers the major industries that appear in consulting case interviews:

- Healthcare and Pharmaceuticals (drug development economics, payer dynamics, hospital operations)
- Technology and Software (SaaS metrics, platform business models, enterprise vs. consumer)
- Financial Services (banking, insurance, private equity, FinTech)
- Retail and Consumer Goods (omnichannel, margin structure, CPG vs. DTC)
- Energy and Utilities (oil & gas economics, renewable transition, regulated utilities)
- Industrial and Manufacturing (supply chain, operations, capital intensity)
- Media and Telecommunications (distribution, content economics, subscriber metrics)

## How to Use It

Watch the primer for your target industry before doing practice cases in that sector. This takes 15-20 minutes and sharpens every case you do afterward. The primers are not exhaustive — they are calibrated to what actually comes up in interviews.`},
      'video', 'all_levels', ${CAT_VIDEOS},
      ARRAY['video','industry primers','youtube','healthcare','technology','financial services'],
      true, true,
      'https://www.youtube.com/@Primerli',
      0, NOW(), NOW()
    )`
  console.log("Inserted: primerli")
}

// ── 4. Add industry primer resource cards ────────────────────────────────────
const industryResources = [
  {
    slug: "healthcare-pharma-primer",
    title: "Healthcare & Pharmaceuticals Industry Primer",
    description: "Key economics, business models, and case interview dynamics in healthcare and pharma — hospitals, drug development, payers, and medical devices.",
    content: `## Industry Overview

Healthcare is one of the largest and most complex industries in the world, comprising roughly 18% of US GDP. For consulting purposes, it breaks into four distinct sectors that behave very differently: **Pharmaceuticals**, **Hospitals and Health Systems**, **Health Insurance (Payers)**, and **Medical Devices**. Cases can span any of these, and each has its own economics.

## Pharmaceuticals

The drug development business model is built around a simple but brutal math: it costs roughly $2-3 billion and 10-15 years to bring a single new drug to market, with a clinical trial failure rate above 90%. This massive fixed cost is recovered during the patent protection window (typically 20 years from filing, leaving 7-12 years of effective exclusivity after FDA approval).

**Key revenue drivers:** Number of approved drugs, pricing power during exclusivity, formulary placement (whether insurers cover the drug), and indication expansion.

**Key cost drivers:** R&D spend (often 20-25% of revenue at large pharma), manufacturing and quality control, salesforce and physician education, and post-patent generic competition.

**Common case themes:** Should a pharma company acquire a biotech for its pipeline? How should a drug be priced at launch? How does a company respond to generic entry at patent cliff?

## Hospitals and Health Systems

Hospitals operate on thin margins (median 2-4% operating margin) despite enormous revenue. The fundamental tension: costs are largely fixed (facilities, staff, equipment) while reimbursement rates are set by payers and government programs.

**Revenue drivers:** Patient volume, payer mix (commercial insurance pays 2-3x what Medicare/Medicaid pays), service line mix (surgical specialties like orthopedics and cardiac are highly profitable; emergency and behavioral health often lose money), and length of stay efficiency.

**Cost drivers:** Labor (50-60% of expenses), supplies and pharmacy, facility overhead, and administrative burden.

**Common case themes:** Hospital profitability declining — diagnose revenue or cost side. Should a hospital system acquire a physician group? How should a rural hospital respond to volume declines?

## Health Insurance (Payers)

Insurers make money on the spread between premiums collected and claims paid, called the **medical loss ratio (MLR)**. The ACA mandates that individual and small group insurers spend at least 80% of premiums on healthcare (85% for large groups), capping the profit pool.

**Key metrics:** MLR, membership growth, premium per member, administrative cost ratio.

**Common case themes:** An insurer's claims costs are rising faster than premiums — diagnose and recommend. Should a payer expand into a new geography? Should an insurer acquire a pharmacy benefit manager?

## What to Know for Cases

Three numbers worth memorizing for healthcare cases:

- US healthcare spending: ~$4.5 trillion annually
- Hospital labor as % of expenses: ~55%
- Generic drug market share after patent cliff: typically 80-90% within 12 months`,
    tags: ["healthcare", "pharma", "industry primer", "hospitals", "payers"],
    isFeatured: false,
  },
  {
    slug: "technology-software-primer",
    title: "Technology & Software Industry Primer",
    description: "How software and tech businesses actually work — SaaS unit economics, platform dynamics, and the key metrics that drive tech case interviews.",
    content: `## Industry Overview

Technology is the most common industry in consulting case interviews at strategy firms, particularly for MBB candidates. The sector spans enterprise software, consumer platforms, semiconductors, cloud infrastructure, and hardware — each with meaningfully different economics. For most case interviews, the relevant context is **software** (especially SaaS) and **platform businesses**.

## SaaS Economics

Software-as-a-Service businesses charge subscription fees for cloud-delivered software. The economics are distinctive:

**The revenue model:** Recurring Annual Recurring Revenue (ARR) builds like a stack — new ARR is added each year, while churned ARR falls off. ARR growth = New ARR added - ARR churned.

**Key metrics to know:**
- **ARR / MRR** (Annual/Monthly Recurring Revenue): the topline
- **Net Revenue Retention (NRR):** how much existing customer revenue grows year-over-year after churn and expansion. NRR > 100% means customers spend more over time; top-quartile SaaS has NRR of 120%+
- **CAC** (Customer Acquisition Cost): fully loaded cost to acquire one customer
- **LTV** (Lifetime Value): average revenue per customer over their lifetime. Rule of thumb: LTV/CAC > 3 is healthy
- **Churn rate:** % of ARR lost per period. Monthly churn of 2% compounds to ~22% annual churn
- **Gross margin:** SaaS typically runs 70-80% gross margins; below 60% signals cost structure problems

**Common case themes:** A SaaS company's growth is slowing — diagnose (new logo growth? Expansion revenue? Churn?). Should a SaaS company move upmarket to enterprise? What should a PE-backed SaaS focus on to maximize EBITDA for exit?

## Platform Businesses

Platform businesses create value by enabling interactions between two or more user groups. Examples: Airbnb (hosts and guests), Uber (drivers and riders), Apple App Store (developers and users).

**Key dynamics:**
- **Network effects:** the platform becomes more valuable as more users join. Multi-sided network effects (more drivers → better service for riders → more riders → more drivers) create defensibility
- **Take rate:** the % of transaction value the platform captures as revenue. Typical range: 10-30% depending on the category
- **Chicken-and-egg problem:** platforms need both sides to launch — which side to subsidize first is a classic case question

**Common case themes:** Should a marketplace enter a new geography? How does a platform respond to a competitor with a lower take rate? What drives retention on a two-sided marketplace?

## Key Numbers

- Global software market: ~$700 billion and growing at ~10%/year
- Cloud market (AWS + Azure + GCP): ~$250 billion
- Typical enterprise SaaS gross margin: 70-80%
- Rule of 40: healthy SaaS companies have (revenue growth rate + EBITDA margin) > 40`,
    tags: ["technology", "software", "saas", "industry primer", "platform"],
    isFeatured: false,
  },
  {
    slug: "financial-services-primer",
    title: "Financial Services Industry Primer",
    description: "How banks, insurers, and asset managers make money — the unit economics, regulatory constraints, and case dynamics of financial services.",
    content: `## Industry Overview

Financial services is broad but for consulting cases it most commonly means **commercial banking**, **investment banking**, **insurance**, **asset management**, and increasingly **FinTech**. Each subsector has completely different economics and regulation, but they share a common thread: the product is money itself, and the business model is fundamentally about managing the spread between what money costs and what it earns.

## Commercial Banking

Banks make money on the **net interest margin (NIM)** — the spread between the interest rate they pay depositors and the rate they charge borrowers.

**Revenue drivers:** Loan volume, loan mix (mortgages vs. commercial vs. credit cards have different risk/return profiles), fee income (wire transfers, overdrafts, wealth management), and NIM. When interest rates rise, bank NIMs typically widen (a tailwind); when they compress, margins shrink.

**Cost drivers:** Deposit cost (the rate paid on savings accounts), credit losses (loans that default), operating expenses (branches, staff, technology), and regulatory compliance costs.

**Key metrics:** NIM (typically 2-4%), Return on Assets (ROA, healthy is 1%+), Return on Equity (ROE, healthy is 10-15%), and the efficiency ratio (non-interest expense / revenue; lower is better, <60% is good).

**Common case themes:** A regional bank's NIM is compressing — diagnose and respond. Should a bank acquire a FinTech? How should a bank optimize its branch network as digital adoption grows?

## Insurance

Insurers collect **premiums** in exchange for bearing risk. They profit if claims paid out (plus operating costs) are less than premiums collected.

**The combined ratio:** (Claims + Operating expenses) / Premiums. A combined ratio below 100% means the underwriting operation is profitable. Most insurers also earn investment income on the float (premiums held before claims are paid).

**Key metrics:** Combined ratio, loss ratio (claims / premiums), expense ratio (operating expenses / premiums), and return on equity.

**Common case themes:** An insurer's claims are rising — is it underwriting risk (bad pricing/selection) or systemic trend (e.g., climate events for property insurance)? Should an insurer exit a line of business?

## Asset Management

Asset managers earn fees on **assets under management (AUM)**, typically expressed as basis points (bps). 100 bps = 1%. Active equity funds charge 50-100 bps; passive index funds charge 3-10 bps.

The industry is under long-term pressure: passive investing is taking share from active, and fee compression is structural.

**Key metrics:** AUM, net flows (inflows minus outflows), fee rate, operating leverage (margins expand as AUM grows since costs don't scale proportionally).

## FinTech

The playbook: take a profitable piece of the incumbent bank's value chain (payments, lending, wealth management), build a better digital experience, acquire customers cheaply, and either grow to scale or sell to a bank. Regulatory arbitrage often plays a role early; regulatory scrutiny tends to increase at scale.

**Common case themes:** Should an incumbent bank acquire a FinTech competitor or build the capability internally? How does a lending FinTech respond when cost of capital rises?`,
    tags: ["financial services", "banking", "insurance", "industry primer", "fintech"],
    isFeatured: false,
  },
  {
    slug: "retail-consumer-primer",
    title: "Retail & Consumer Goods Industry Primer",
    description: "The economics of retail and CPG — margin structures, the DTC vs. wholesale debate, e-commerce dynamics, and what drives profitability in consumer businesses.",
    content: `## Industry Overview

Retail and consumer goods covers two related but distinct businesses: **retailers** (who sell products to end consumers) and **consumer packaged goods (CPG) companies** (who manufacture branded products and sell through retailers or directly). The channel relationship between these two — who has pricing power, who captures margin — is central to most cases in this space.

## Retail Economics

Retailers buy product at wholesale and sell at retail, capturing the gross margin spread. The fundamentals:

**Revenue drivers:** Store count, revenue per store (driven by traffic × conversion × average transaction value), and e-commerce revenue.

**Gross margin drivers:** Product mix (private label carries 40-50% gross margin vs. 25-35% for national brands), shrink (inventory loss from theft or damage), and promotional depth (how often and how deeply the retailer discounts).

**Operating cost drivers:** Rent (the biggest fixed cost; typically 10-15% of revenue for physical retailers), labor (15-25% of revenue), and supply chain/distribution costs.

**Key metrics:** Same-store sales growth (comp growth), gross margin %, EBITDA margin, revenue per square foot (a proxy for store productivity), and inventory turns.

**The omnichannel challenge:** E-commerce has higher revenue per transaction but lower margins than physical retail (higher fulfillment costs, higher return rates). Retailers who shifted quickly online often found their profitability deteriorate.

**Common case themes:** A fashion retailer's margins are declining — revenue or cost side? Should a traditional retailer close underperforming stores? How does a retailer compete with Amazon on price while maintaining margin?

## Consumer Packaged Goods (CPG)

CPG companies make money by building brands that command a price premium over generic alternatives. The brand premium justifies higher retail prices and earns the company shelf space.

**Revenue drivers:** Retail distribution (number of SKUs × number of stores stocking them), pricing, and volume/velocity (how fast each SKU turns on shelf).

**Gross margin drivers:** Raw material costs (commodities), manufacturing efficiency, and pricing power. CPG gross margins range from 35-60% depending on category.

**Trade spending:** CPG companies pay retailers for shelf placement, promotional features, and end-caps. This "trade spend" is typically 15-25% of gross revenue and is the biggest variable cost after manufacturing.

**The DTC question:** Many CPG brands have considered selling directly to consumers to capture more margin and own the customer relationship. The economics rarely work at scale — logistics costs are high, customer acquisition is expensive, and the brand was built for retail environments.

**Common case themes:** A CPG brand is losing shelf space at major retailers — diagnose and respond. Should a food company acquire a DTC brand? How does a CPG company respond to a private label substitute taking 10 points of share?

## Key Metrics to Know

- Grocery retail gross margin: ~25-30%
- Specialty retail gross margin: ~40-50%
- CPG gross margin: ~40-55% (food) to ~60%+ (beauty, personal care)
- E-commerce return rates: 20-30% for apparel, 5-10% for electronics`,
    tags: ["retail", "consumer goods", "cpg", "industry primer", "e-commerce"],
    isFeatured: false,
  },
  {
    slug: "energy-primer",
    title: "Energy & Utilities Industry Primer",
    description: "The economics of oil & gas, power generation, and the energy transition — what drives profitability, how regulation shapes strategy, and key case dynamics.",
    content: `## Industry Overview

Energy covers **upstream oil & gas** (exploration and production), **midstream** (pipelines and storage), **downstream** (refining and retail fuel), **power generation and utilities**, and increasingly **renewable energy**. Each segment has fundamentally different economics, capital intensity, and regulatory exposure. Cases in this space often involve the tension between legacy fossil fuel businesses and the transition to clean energy.

## Oil & Gas

The upstream business is simple in concept: find oil or gas, extract it, sell it. The economics are brutal: high capital expenditure, long lead times, commodity price exposure with no ability to influence the price, and reserves that deplete.

**Revenue driver:** Production volume × commodity price. A company producing 100,000 barrels/day at $80/barrel earns $8M/day in gross revenue — but the cost structure determines whether that is profitable.

**Cost structure:**
- **Finding and Development (F&D) costs:** the capital cost to discover and develop reserves, expressed as $/barrel
- **Lifting costs (opex):** the variable cost to extract each barrel once the well is drilled; can range from $5/barrel in Saudi Arabia to $30-40/barrel for deepwater or oil sands
- **Breakeven price:** the oil price at which a project generates positive returns. Projects with breakevens above $60-70/barrel are increasingly difficult to justify as energy transition risk grows

**Common case themes:** Should an oil company invest in a new deepwater field? How does an E&P company respond to a sustained commodity price decline? Should a major oil company allocate capital to renewables?

## Regulated Utilities

Electric and gas utilities are natural monopolies — it makes no sense to build two sets of power lines serving the same neighborhood. In exchange for the monopoly, utilities are regulated: they must provide service, and their returns are capped by regulators.

**The regulated model:** Utilities earn a regulated **return on equity (ROE)** on their rate base (the value of assets allowed into rates). If a utility invests $1B in new infrastructure and earns a 10% allowed ROE, it earns $100M on that investment regardless of whether electricity demand grows.

**Revenue driver:** Rate base growth. Utilities grow earnings by investing in infrastructure — grid modernization, renewable generation, transmission — and earning their allowed return on those investments.

**Cost drivers:** Fuel costs (for thermal generation), O&M, and capital costs (depreciation).

**Common case themes:** How should a utility deploy capital across renewable vs. fossil generation? Should a utility acquire a distributed energy company? How does a regulated utility respond to load growth from EV charging?

## The Energy Transition

The shift from fossil fuels to clean energy is restructuring the industry. Key dynamics for cases:

- **Renewable cost curves:** solar and wind are now cost-competitive with new fossil fuel generation in most markets
- **Stranded asset risk:** fossil fuel infrastructure may become uneconomic before the end of its useful life, creating write-down risk
- **Grid reliability tension:** intermittent renewables require backup capacity (storage or gas peakers), making the transition operationally complex
- **Capital reallocation:** oil majors face investor pressure to reduce fossil investment and grow clean energy, but clean energy returns are lower and less familiar

**Common case themes:** Should an oil major acquire a wind developer? How does a coal utility plan its generation transition? What is the right battery storage strategy for a power company?`,
    tags: ["energy", "oil gas", "utilities", "renewables", "industry primer"],
    isFeatured: false,
  },
]

for (const r of industryResources) {
  const exists = await sql`SELECT id FROM resources WHERE slug = ${r.slug}`
  if (exists.length > 0) { console.log(`Skip (exists): ${r.slug}`); continue }
  await sql`
    INSERT INTO resources (id, slug, title, description, content, format, difficulty, category_id, tags, is_featured, is_published, external_url, view_count, created_at, updated_at)
    VALUES (gen_random_uuid(), ${r.slug}, ${r.title}, ${r.description}, ${r.content}, 'guide', 'all_levels', ${industryPrimersCatId}, ${r.tags}, ${r.isFeatured}, true, null, 0, NOW(), NOW())`
  console.log(`Inserted resource: ${r.slug}`)
}

// ── 5. Add industry-specific drills ──────────────────────────────────────────
const newDrills = [
  // ── Healthcare ──
  {
    title: "Hospital Profitability Diagnosis",
    skill_focus: "structure",
    drill_type: "mini_case",
    difficulty: "easy",
    industry: "healthcare",
    prompt: "A regional hospital system's operating margin has dropped from 4% to 1% over two years. Build a MECE framework to diagnose the root cause. Focus on structure only — do not start the analysis.",
    expected_traits: ["Revenue vs. cost split at the top level","Revenue broken into payer mix, volume, and service line","Cost broken into labor, supplies, and fixed overhead","Recognition that payer mix shift (commercial to Medicare) is a key driver to investigate"],
    estimated_minutes: 5,
  },
  {
    title: "Drug Launch Market Sizing",
    skill_focus: "quantitative",
    drill_type: "math_exercise",
    difficulty: "medium",
    industry: "healthcare",
    prompt: "A pharma company is launching a drug for Type 2 diabetes. Estimate the peak annual US revenue potential. US population: 330M. Diabetes prevalence: ~11%. Type 2 share: 90-95%. Patients on medication: ~60%. Market share assumption: 8%. Annual drug cost: $15,000. Walk through the math.",
    expected_traits: ["Correct patient population calculation (~330M × 11% × 93% × 60% ≈ 20M patients)","Market share applied to addressable patients (~1.6M patients)","Revenue: ~$24B market × 8% share = ~$1.9B","Sanity check against known blockbuster drug revenues"],
    estimated_minutes: 7,
  },
  {
    title: "Pharma Portfolio Hypothesis",
    skill_focus: "hypothesis",
    drill_type: "mini_case",
    difficulty: "hard",
    industry: "healthcare",
    prompt: "A large pharmaceutical company's R&D productivity has declined — fewer drugs making it through Phase 3 trials than five years ago. Before structuring, give me your three leading hypotheses for why this is happening. Rank them by likelihood.",
    expected_traits: ["Disease area shift to more complex/harder targets (oncology vs. primary care)","Regulatory bar has increased for approval (more demanding clinical evidence required)","Portfolio skewed toward late-lifecycle compounds with diminishing differentiation","Internal talent or process degradation in clinical development"],
    estimated_minutes: 6,
  },
  {
    title: "Hospital M&A Recommendation",
    skill_focus: "synthesis",
    drill_type: "synthesis_prompt",
    difficulty: "hard",
    industry: "healthcare",
    prompt: "A large health system is considering acquiring a physician group. The acquisition would add 120 physicians across primary care and cardiology. The purchase price is $180M. Integration is expected to take 18 months. Synthesize a recommendation covering strategic rationale, financial logic, and key risks.",
    expected_traits: ["Clear yes/no recommendation stated upfront","Strategic rationale: referral capture, defensive positioning vs. competitors acquiring the group","Financial logic: physician-generated revenue (typical: $1.5-2.5M per physician) vs. purchase price","Key risks: physician retention post-acquisition, cultural integration, regulatory scrutiny"],
    estimated_minutes: 8,
  },

  // ── Technology ──
  {
    title: "SaaS Growth Slowdown Structure",
    skill_focus: "structure",
    drill_type: "mini_case",
    difficulty: "medium",
    industry: "technology",
    prompt: "A B2B SaaS company grew 80% last year but is only growing 25% this year. Leadership believes the market opportunity is unchanged. Build a MECE framework to diagnose why growth has slowed. Structure only.",
    expected_traits: ["New ARR generation vs. churn separation","New ARR broken into new logo acquisition and expansion from existing customers","Churn analyzed by customer segment and cohort","External factors: market saturation, competitive entry"],
    estimated_minutes: 5,
  },
  {
    title: "LTV/CAC Calculation",
    skill_focus: "quantitative",
    drill_type: "math_exercise",
    difficulty: "medium",
    industry: "technology",
    prompt: "A SaaS company has: average contract value $24,000/year, average customer lifetime of 4 years, gross margin of 75%, CAC of $30,000. Calculate LTV, LTV/CAC ratio, and CAC payback period in months. Assess whether the unit economics are healthy.",
    expected_traits: ["LTV = ACV × lifetime × gross margin = $24K × 4 × 75% = $72,000","LTV/CAC = $72K / $30K = 2.4x (below healthy 3x threshold)","CAC payback = CAC / (ACV × gross margin / 12) = $30K / ($1,500) = 20 months","Assessment: unit economics are weak; LTV/CAC below 3x is a warning sign"],
    estimated_minutes: 7,
  },
  {
    title: "Platform Market Entry Hypothesis",
    skill_focus: "hypothesis",
    drill_type: "mini_case",
    difficulty: "hard",
    industry: "technology",
    prompt: "A leading e-commerce marketplace is considering launching a same-day delivery service in 10 new cities. Before building a structure, give me three reasons this could fail and three reasons it could succeed. Rank each list.",
    expected_traits: ["Failure risks: unit economics don't work at low order density, driver supply in new cities, incumbents with established networks (Instacart, DoorDash)","Success factors: existing customer base to seed demand, brand trust, logistics infrastructure from existing fulfillment","Thoughtful ranking with reasoning, not just a list"],
    estimated_minutes: 6,
  },
  {
    title: "Tech Acquisition Synthesis",
    skill_focus: "synthesis",
    drill_type: "synthesis_prompt",
    difficulty: "hard",
    industry: "technology",
    prompt: "A large enterprise software company just completed a $2B acquisition of a cybersecurity startup. The startup has $80M ARR growing 60% YoY, 110% NRR, and 78% gross margins. Integration is being debated: full absorption vs. standalone with cross-sell. Synthesize a recommendation on integration approach and the key metrics to track in year one.",
    expected_traits: ["Clear integration approach recommendation with reasoning","Standalone argument: preserves culture and growth trajectory, avoids talent flight","Absorption argument: cross-sell synergies, cost efficiency, product bundling","Year 1 metrics: NRR preservation, logo churn rate, ARR from cross-sell"],
    estimated_minutes: 9,
  },

  // ── Financial Services ──
  {
    title: "Regional Bank NIM Compression",
    skill_focus: "structure",
    drill_type: "mini_case",
    difficulty: "medium",
    industry: "financial_services",
    prompt: "A regional bank's net interest margin has compressed from 3.5% to 2.8% over 18 months. Operating costs are flat. Build a MECE framework to diagnose the margin decline. Focus on structure only.",
    expected_traits: ["Asset yield vs. funding cost split","Asset yield broken into loan mix, rate environment, and credit quality","Funding cost broken into deposit repricing, wholesale funding, and deposit mix","Recognition that rate environment context matters (rising vs. falling rates)"],
    estimated_minutes: 5,
  },
  {
    title: "PE Return Calculation",
    skill_focus: "quantitative",
    drill_type: "math_exercise",
    difficulty: "hard",
    industry: "financial_services",
    prompt: "A private equity fund acquired a company for $400M (8x EBITDA, $50M EBITDA at entry). The fund used 50% debt and 50% equity. Over 5 years, EBITDA grew to $80M. The fund exits at 9x EBITDA. Assume debt is paid down by $60M. Calculate the exit equity value and MOIC (multiple on invested capital).",
    expected_traits: ["Entry: EV $400M, debt $200M, equity $200M","Exit: EV = $80M × 9 = $720M, remaining debt = $140M, exit equity = $580M","MOIC = $580M / $200M = 2.9x","IRR context: 2.9x over 5 years ≈ 24% IRR (good PE performance)"],
    estimated_minutes: 8,
  },
  {
    title: "FinTech Threat Hypothesis",
    skill_focus: "hypothesis",
    drill_type: "mini_case",
    difficulty: "hard",
    industry: "financial_services",
    prompt: "A FinTech lender is taking market share in personal loans from traditional banks, offering 2-day approval and rates 100bps below bank rates. Give me your three leading hypotheses for how the bank should respond. Rank by impact and feasibility.",
    expected_traits: ["Build/buy/partner framing","Build: invest in digital underwriting capability (slow but controlled)","Buy: acquire the FinTech or a similar player (fast, expensive, integration risk)","Partner: white-label arrangement while building internal capability","Feasibility ranking with reasoning about timing and organizational readiness"],
    estimated_minutes: 7,
  },
  {
    title: "Insurance Underwriting Deterioration",
    skill_focus: "synthesis",
    drill_type: "synthesis_prompt",
    difficulty: "hard",
    industry: "financial_services",
    prompt: "A property & casualty insurer's combined ratio has risen from 94% to 103% over two years, driven primarily by the loss ratio (not the expense ratio). Frequency of claims is flat; severity is up 18%. Synthesize the root cause, strategic implication, and what the company should do.",
    expected_traits: ["Root cause: severity increase likely driven by inflation (repair costs, medical costs, litigation), not underwriting deterioration per se","Implication: pricing must catch up to claims cost trend; current book may be underpriced","Actions: rate increases on renewal book, re-underwrite highest-severity segments, examine reinsurance cover adequacy","Recognition that rate increases have market share implications"],
    estimated_minutes: 8,
  },

  // ── Retail & Consumer ──
  {
    title: "Retail Margin Structure",
    skill_focus: "structure",
    drill_type: "mini_case",
    difficulty: "easy",
    industry: "retail_consumer",
    prompt: "A specialty apparel retailer's EBITDA margin has fallen from 12% to 7% over three years. Revenue is up 5% annually. Structure a MECE framework to diagnose the margin decline.",
    expected_traits: ["Gross margin vs. operating expense split","Gross margin: product cost (COGS), pricing, promotional depth, shrink, mix shift","Operating expense: store labor, rent, marketing, supply chain, G&A","Recognition that revenue growth with margin compression points to cost-side or mix issue"],
    estimated_minutes: 5,
  },
  {
    title: "Retail Market Sizing",
    skill_focus: "quantitative",
    drill_type: "math_exercise",
    difficulty: "medium",
    industry: "retail_consumer",
    prompt: "Estimate the annual US market for premium coffee (defined as coffee purchased at specialty cafes, not grocery). Walk through a top-down and bottom-up approach and reconcile the two estimates.",
    expected_traits: ["Top-down: US adults × % who drink premium coffee × frequency × price per cup × 52 weeks","Bottom-up: number of specialty cafes × average daily transactions × average ticket","Both approaches should land in the $40-60B range","Reconciliation: explain why the two differ and which you trust more"],
    estimated_minutes: 8,
  },
  {
    title: "DTC vs. Wholesale Hypothesis",
    skill_focus: "hypothesis",
    drill_type: "mini_case",
    difficulty: "medium",
    industry: "retail_consumer",
    prompt: "A CPG brand currently sells 80% through mass retail (Walmart, Target) and 20% direct-to-consumer online. The CEO wants to shift to 50/50 within 3 years. Give me three reasons this is a good idea and three reasons it might fail. Rank each list.",
    expected_traits: ["Benefits: higher gross margin DTC (no retailer margin), direct customer relationship, faster product feedback","Risks: customer acquisition costs at DTC scale, losing shelf space as retailer relationship deteriorates, logistics complexity","Ranking with specific logic — not just listing","Recognition that the transition path matters as much as the endpoint"],
    estimated_minutes: 6,
  },

  // ── Energy ──
  {
    title: "Oil Major Renewable Allocation",
    skill_focus: "structure",
    drill_type: "mini_case",
    difficulty: "hard",
    industry: "energy",
    prompt: "A large integrated oil company is deciding how to allocate its $15B annual capex budget between legacy oil & gas projects and renewable energy investments. Build a MECE framework for making this capital allocation decision.",
    expected_traits: ["Financial returns: risk-adjusted IRR comparison across project types","Strategic fit: which investments build durable competitive advantage","Transition risk: stranded asset exposure in oil, execution risk in renewables","Stakeholder constraints: investor pressure, regulatory requirements, credit rating implications"],
    estimated_minutes: 7,
  },
  {
    title: "Energy Project ROI",
    skill_focus: "quantitative",
    drill_type: "math_exercise",
    difficulty: "hard",
    industry: "energy",
    prompt: "A utility is evaluating a 200MW solar farm. Capital cost: $250M. Annual generation: 440,000 MWh (capacity factor 25%). Power purchase agreement price: $45/MWh. Annual O&M: $5M. Project life: 25 years. Discount rate: 7%. Estimate simple payback period and comment on whether the project clears a typical utility hurdle rate.",
    expected_traits: ["Annual revenue: 440K MWh × $45 = $19.8M","Annual EBITDA: $19.8M - $5M = $14.8M","Simple payback: $250M / $14.8M ≈ 17 years","NPV comment: 25-year project at 7% discount rate with 17-year payback is marginal; needs to check against regulated return allowance","Recognition that regulated utilities earn ROE on rate base, so the economics may be evaluated differently than merchant projects"],
    estimated_minutes: 9,
  },
  {
    title: "Utility Decarbonization Synthesis",
    skill_focus: "synthesis",
    drill_type: "synthesis_prompt",
    difficulty: "hard",
    industry: "energy",
    prompt: "A regulated electric utility has committed to net-zero emissions by 2040. It currently operates 3,000MW of coal generation (average age: 22 years, book value: $800M). Grid demand is expected to grow 15% from EV adoption. Synthesize a generation transition strategy covering asset retirement, replacement, and customer rate impact.",
    expected_traits: ["Asset retirement phasing based on age, book value, and stranded cost recovery from regulators","Replacement mix: utility-scale solar + storage as base, gas peakers for reliability during transition","Rate impact: stranded costs must be recovered from ratepayers; regulatory filing required","Timeline logic: retirements sequenced to avoid reliability gaps","Customer communication and regulatory engagement as parallel workstreams"],
    estimated_minutes: 10,
  },
]

let drillsInserted = 0
for (const d of newDrills) {
  await sql`
    INSERT INTO drills (id, title, skill_focus, drill_type, difficulty, industry, prompt, expected_traits, estimated_minutes, is_active, times_attempted, created_at)
    VALUES (
      gen_random_uuid(), ${d.title}, ${d.skill_focus}, ${d.drill_type}, ${d.difficulty},
      ${d.industry}, ${d.prompt}, ${d.expected_traits}, ${d.estimated_minutes}, true, 0, NOW()
    )`
  drillsInserted++
  console.log(`Inserted drill: ${d.title}`)
}

console.log(`\nDone. ${drillsInserted} drills inserted.`)
await sql.end()
