import postgres from "postgres"
import { config } from "dotenv"
config({ path: ".env" })

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" })

// Category IDs (confirmed from DB)
const CAT = {
  consultingBasics: "5ac46d05-54d1-4f00-9fb8-e6870a2eeef4",
  frameworks: "d85c514e-a83f-400d-805f-819edf0a21ae",
  caseBooks: "12901848-c53c-4155-900d-705e7a107219",
  guides: "b5875ed4-5cc6-4a06-be98-3282831b9912",
  books: "e69355a9-3fa1-47f6-a96d-f95299f00d06",
  videos: "4189016b-64aa-40f2-b7d4-46cf4a7f25d6",
}

// ── 1. Assign categories to existing resources ──────────────────────────────
const categoryAssignments = [
  { slug: "what-is-consulting",        categoryId: CAT.consultingBasics },
  { slug: "what-is-case-interview",    categoryId: CAT.consultingBasics },
  { slug: "what-is-mbb",              categoryId: CAT.consultingBasics },
  { slug: "profitability-framework",   categoryId: CAT.frameworks },
  { slug: "market-sizing-guide",       categoryId: CAT.frameworks },
  { slug: "case-interview-fundamentals", categoryId: CAT.guides },
  { slug: "fit-interview-guide",       categoryId: CAT.guides },
  { slug: "case-in-point",             categoryId: CAT.books },
]

for (const { slug, categoryId } of categoryAssignments) {
  await sql`UPDATE resources SET category_id = ${categoryId} WHERE slug = ${slug}`
  console.log(`Assigned category: ${slug}`)
}

// ── 2. Update what-is-case-interview with clearer anatomy ───────────────────
const caseInterviewContent = `## What a Case Interview Is

A case interview is a simulated business problem you solve out loud with an interviewer. Unlike behavioral interviews, there are no scripted right answers — the interviewer is watching how you think, not just what you conclude.

The format typically runs 30-45 minutes. The behavioral portion (fit questions) is usually covered in the first 10 minutes, then the case begins. You will have one case per interview slot.

## How a Case Interview Actually Flows

Understanding the sequence helps you stop reacting and start leading. A well-run case moves through five distinct phases:

### Phase 1: The Prompt

The interviewer gives you a brief, intentionally vague scenario. Something like: "Our client is a mid-sized airline that has seen profits decline over the past two years. They have hired us to understand why and what to do." You will not be given enough information to solve the problem yet — that is intentional.

**Your job:** Listen carefully, take brief notes, and prepare to ask one or two clarifying questions. Do not start structuring yet.

### Phase 2: Clarify and Structure

Ask 1-2 targeted questions to pin down the scope: What does "profits" mean here — operating profit, net income? Are we looking at a specific geography or the whole business? Is there a particular hypothesis the client has already formed?

Then pause briefly (10-15 seconds) and say so: "I would like to take a moment to structure my approach." Build a MECE framework — typically 3-4 branches that together cover the full problem space. State your structure out loud, briefly preview each branch, and tell the interviewer where you want to start and why.

### Phase 3: Digging In

You pick one branch and begin exploring it. The interviewer will respond in one of three ways:

- **Provide data or numbers** — a chart, a table, or a specific figure. Your job is to interpret what it means and what it implies for the case.
- **Ask you to brainstorm** — "What are the possible reasons costs have increased?" Brainstorm out loud, group your ideas, and prioritize the most likely.
- **Redirect you** — "Let us come back to that. What about the revenue side?" Follow their lead; they are signaling where the case wants to go.

This phase is iterative. You may go through 3-5 exchanges before the picture becomes clear. Each exchange should end with a synthesis: "So what this tells us is..." before you move to the next question.

### Phase 4: The Pivot

At some point, usually after 15-20 minutes, the interviewer signals it is time to wrap up: "We are running short on time. What is your recommendation?" This is not a failure — it is a standard part of the format. Shift immediately to recommendation mode.

### Phase 5: The Recommendation

Your final recommendation should follow a consistent structure:

- **Recap (1-2 sentences):** Restate the core problem you were solving and what the analysis revealed.
- **Solution:** State a clear, specific recommendation. "I recommend the client focus on reducing variable costs in ground operations, specifically fuel and crew scheduling."
- **Why it works:** Give 2-3 supporting reasons grounded in what you found during the case.
- **Risks:** Name 1-2 risks or assumptions that could undermine the recommendation.
- **Next steps:** Suggest 1-2 concrete actions the client should take in the next 30-60 days.

The recommendation should take 60-90 seconds. Do not trail off. End with a complete sentence.

## Types of Cases

Most cases fall into one of these categories:

- **Profitability** — a client's profits are declining; find out why and what to do
- **Market Entry** — should a company enter a new market or geography?
- **Market Sizing** — estimate the size of a market or quantity of something
- **Growth Strategy** — how should a company grow revenue over the next 3-5 years?
- **Mergers and Acquisitions** — should a company acquire a target, and at what price?
- **Pricing** — how should a company price a new or existing product?
- **Operations/Cost Reduction** — why are costs too high and how can they be lowered?

## Common Mistakes

- Starting to structure before clarifying the objective
- Using a generic framework without adapting it to the specific case
- Narrating math without interpreting the result
- Delivering a list of findings as the recommendation instead of a clear conclusion
- Going silent under pressure instead of thinking aloud

## How Many Cases Do You Need?

Top candidates complete 30-50 practice cases before their first real interview, with at least half done with a live partner who gives feedback. Reading through cases and checking answers does not build the same muscle as performing under observation.`

await sql`UPDATE resources SET content = ${caseInterviewContent} WHERE slug = 'what-is-case-interview'`
console.log("Updated: what-is-case-interview content")

// ── 3. Add new resources ────────────────────────────────────────────────────
const newResources = [
  // ── MBB Recruiting Guide ──
  {
    slug: "mbb-recruiting-guide",
    title: "MBB Recruiting: Timeline, Networking & Interview Process",
    description: "A complete guide to the MBB recruiting process — from first networking coffee chat through offer. Covers timelines, resume tips, and what to expect in each round.",
    format: "guide",
    difficulty: "beginner",
    category_id: CAT.consultingBasics,
    tags: ["recruiting", "networking", "mbb", "timeline", "resume"],
    is_featured: true,
    is_published: true,
    content: `## How MBB Recruiting Actually Works

Management consulting recruiting follows a predictable annual calendar, but the specific timelines depend heavily on whether you are recruiting as an undergraduate, an MBA student, or an experienced hire. This guide focuses on the undergraduate and MBA tracks, which share the same basic structure.

## Recruiting Timeline

**July through September** is when most activity begins for the upcoming cycle. Firms open their applications in this window, host information sessions on campus, and start accepting coffee chat requests from students who reach out proactively.

**October through November** is when the bulk of first-round interviews happen. For undergrads, this often means an on-campus interview day. For MBAs, it may be virtual or at the firm's office.

**November through December** is when final rounds occur for most firms. Offers are typically extended within a week of the final round, sometimes within 48 hours.

For experienced hires (those applying outside of campus recruiting), the timeline is rolling and does not follow this calendar. Applications are reviewed year-round.

## The Interview Structure

MBB firms do not have a separate behavioral interview. Fit questions — "Why consulting?", "Tell me about a time you led a team" — are asked in the first 8-12 minutes of each case interview slot. Once that portion concludes, the case begins.

Most candidates go through two rounds:

- **Round 1:** 2 interviews (each with one case and a short fit section). Both interviewers assess independently. You need to pass both to advance.
- **Round 2:** 2-3 interviews. These tend to be more senior interviewers and may include a written case component at some firms (notably BCG's written case exercise).

McKinsey also uses the **Solve assessment** (formerly the Problem Solving Test) as a screening step before interviews. It is a digital problem-solving game, not a traditional standardized test, but it requires preparation.

## Networking: What It Is Actually For

Networking in consulting recruiting serves one purpose: learning enough about the firm to write and speak about it specifically. Firms can tell the difference between a candidate who has spoken to three consultants and one who has not. The "Why this firm?" question gets answered better when you have real conversations to draw from.

**How to reach out:** LinkedIn is the standard channel. Send a short, specific message — mention your school, your interest in consulting, and ask for 20 minutes to learn about their experience. Attach nothing.

**What to ask:** Focus on their day-to-day work, their client experience, and what surprised them about the job. Avoid asking questions that are answered on the firm's website.

**What not to expect:** Coffee chats rarely move your application forward directly. They are not referrals unless someone explicitly offers to submit your name. Their value is informational.

## Resume Essentials

MBB resume screens are done in under 30 seconds. Three things matter:

- **Academic credentials:** GPA (3.7+ is generally competitive at target schools), school name, relevant coursework or honors
- **Impact-driven bullets:** Each experience should have a quantified result. "Led team of 8 to reduce reporting time by 40%" beats "Managed reporting processes"
- **Extracurricular leadership:** A genuine leadership role in one or two activities carries more weight than a long list of memberships

One page. No objective statement. No photos. No functional format.

## What Makes a Strong Application

Firms receive far more qualified applicants than they can interview. Beyond the minimum bar (school, GPA, experience), what differentiates candidates is usually:

- **A compelling "why consulting" story** that is specific to the firm and grounded in real experience
- **Evidence of structured thinking** in how they describe their work experience
- **Genuine intellectual curiosity** that comes through in conversations and cover letters

The case interview itself is the biggest differentiator. Firms know that most candidates are academically strong. The case is designed to surface who can actually think through ambiguous problems on their feet.`,
  },

  // ── Porter's Five Forces ──
  {
    slug: "porter-five-forces",
    title: "Porter's Five Forces Framework",
    description: "How to use the Five Forces model to assess industry attractiveness and competitive dynamics in case interviews and real strategic analysis.",
    format: "guide",
    difficulty: "intermediate",
    category_id: CAT.frameworks,
    tags: ["frameworks", "competitive analysis", "strategy", "industry analysis"],
    is_featured: false,
    is_published: true,
    content: `## What the Five Forces Framework Is

Porter's Five Forces is a framework developed by Harvard Business School professor Michael Porter in 1979 to analyze the competitive intensity and profitability potential of an industry. In case interviews, it appears most often in market entry, competitive response, and industry attractiveness cases.

The five forces collectively determine how much of an industry's value gets captured by firms within it versus being competed away or extracted by suppliers and buyers.

## The Five Forces

### Force 1: Threat of New Entrants

How easy is it for a new competitor to enter this market? High threat of new entrants reduces industry profitability because incumbents must either lower prices or increase investment to defend their position.

**Barriers to entry to analyze:**
- **Economies of scale** — does a new entrant need massive volume before its unit economics work?
- **Capital requirements** — how much upfront investment does entry require?
- **Regulatory barriers** — are licenses, permits, or government approvals required?
- **Brand loyalty** — how much would a customer need to be paid to switch?
- **Access to distribution** — do incumbents control the channels new entrants need?
- **Switching costs** — how painful is it for customers to change providers?

**Low barrier example:** Food delivery apps. The technology stack is replicable, capital requirements are moderate, and customers switch easily. This explains the intense competition and thin margins.

### Force 2: Bargaining Power of Suppliers

How much leverage do the firms supplying inputs to this industry have? High supplier power means input costs are harder to control and margins get compressed.

**Indicators of high supplier power:**
- Few suppliers, many buyers (concentrated supply)
- The supplier's input is critical and has no substitute
- Switching suppliers is costly or time-consuming
- The supplier could credibly integrate forward (sell directly to end customers)

### Force 3: Bargaining Power of Buyers

How much leverage do customers have to demand lower prices or better terms? High buyer power erodes margins.

**Indicators of high buyer power:**
- Buyers purchase in large volumes (and losing one hurts)
- The product is undifferentiated; buyers can switch easily
- Buyers have good price information
- Buyers could integrate backward (produce the input themselves)

### Force 4: Threat of Substitutes

Are there alternative ways for customers to meet the same need? Substitutes cap how high prices can go.

Substitutes are not the same as competitors. A substitute for airline travel is a video conference call, not a competing airline. In case interviews, substitutes often get overlooked — always ask whether the customer could solve their problem a fundamentally different way.

### Force 5: Competitive Rivalry

How intensely do existing firms compete within the industry? High rivalry reduces margins as firms discount, invest in marketing, and copy each other's innovations.

**Drivers of high rivalry:**
- Many competitors of similar size (no dominant player)
- Slow industry growth (firms fight for share rather than riding the tide)
- High fixed costs that create pressure to maintain volume
- Low differentiation (products are commodities)
- High exit barriers (firms stay in even when losing money)

## How to Use This in a Case

Five Forces is most useful for **framing an industry attractiveness question**, not for solving every case. Use it when:

- A client is considering entering a new market
- A client is trying to understand why margins in their industry are declining
- You need to assess whether a target acquisition operates in an attractive industry

In practice, do not recite all five forces mechanically. Identify which two or three are most relevant to the specific situation, explain why, and draw a conclusion about overall attractiveness. "This market has high entry barriers due to regulatory requirements and significant capital intensity, which partly offsets the strong buyer power from large retail chains. Overall, it is a moderately attractive industry for an established player but difficult to enter."`,
  },

  // ── M&A Framework ──
  {
    slug: "ma-framework",
    title: "Mergers & Acquisitions Framework",
    description: "A structured approach to M&A and acquisition cases in consulting interviews — covering strategic fit, valuation, synergies, and integration risk.",
    format: "guide",
    difficulty: "advanced",
    category_id: CAT.frameworks,
    tags: ["frameworks", "m&a", "acquisitions", "valuation", "synergies"],
    is_featured: false,
    is_published: true,
    content: `## M&A Cases in Consulting Interviews

Mergers and acquisitions cases appear frequently in MBB and Big 4 consulting interviews, particularly in final rounds. They test whether you can think simultaneously about strategy, finance, and execution — three distinct analytical lenses that must all point in the same direction before a deal makes sense.

The central question in every M&A case: **Should this company acquire this target, and if so, at what price and under what conditions?**

## The Three-Part Framework

Structure your analysis around three sequential questions:

### Part 1: Strategic Rationale — Why Acquire?

Before any financial analysis, establish whether the acquisition makes strategic sense. A deal that fails strategically will fail regardless of price.

**Four types of strategic rationale:**

- **Market position:** Buying a competitor to gain share, eliminate a rival, or achieve scale economies. Ask: will the combined entity have meaningfully stronger competitive position?
- **Capability acquisition:** Buying a firm for its technology, talent, IP, or processes that would take years to build internally. Ask: is acquisition faster and cheaper than building?
- **Market entry:** Using an acquisition to enter a new geography or customer segment. Ask: is an acquisition necessary, or could a partnership or organic entry work?
- **Vertical integration:** Acquiring a supplier or distributor to control costs or secure access. Ask: does control of this part of the value chain materially improve economics?

Always probe whether the strategic rationale is genuinely strong or whether this is "empire building" — an acquisition driven by executive ambition rather than shareholder value.

### Part 2: Financial Analysis — Does the Price Work?

An acquisition creates value only if the price paid is less than the value received. The value received has two components:

**Standalone value of the target:** What is the business worth on its own, independent of the acquirer? Common methods: revenue or EBITDA multiples benchmarked to comparable transactions, or a simplified DCF. In case interviews, you will be given data; the skill is interpreting it correctly.

**Synergies:** The additional value created because the two businesses are combined, which would not exist independently. Two types:

- **Revenue synergies:** Cross-selling, new market access, combined customer bases. These are harder to achieve and slower to realize — treat estimates skeptically and apply a discount.
- **Cost synergies:** Eliminating duplicate functions (overlapping corporate overhead, redundant facilities, consolidated procurement). These are more predictable and tend to be realized within 12-24 months post-close.

**The key calculation in most cases:**

Maximum price = Standalone value + Net present value of synergies

If the seller's asking price exceeds this, the deal destroys value for the acquirer. In practice, acquirers routinely overpay — the "winner's curse" is well documented in academic research.

### Part 3: Integration — Can It Actually Be Done?

A deal that is strategically sound and financially attractive can still fail at execution. Integration risk is the most commonly underweighted factor.

**Integration questions to raise:**

- **Cultural fit:** How similar or different are the two organizations? Culture clashes destroy synergies — employees leave, clients follow.
- **Integration complexity:** How intertwined are the systems, processes, and teams? A technology company acquiring another tech company may share infrastructure; a manufacturing firm acquiring a software company almost certainly does not.
- **Management retention:** Is the target's value in its management team? If key people leave post-acquisition, what was actually purchased?
- **Regulatory risk:** Does the combined entity raise antitrust concerns? Is regulatory approval required, and how long will it take?

## Delivering the Recommendation

In an M&A case, your recommendation should answer three questions:

1. **Should they proceed?** State a clear yes or no with one primary reason.
2. **At what price / under what conditions?** If yes, what makes the deal sensible? If no, what would need to change?
3. **What are the key risks?** Name the one or two factors most likely to cause the deal to underperform expectations.

A clean M&A recommendation sounds like: "I recommend proceeding with the acquisition at a price below $X, which represents the standalone value plus achievable cost synergies. The primary risk is management retention — the target's product team is the core asset, and retention packages should be built into the deal terms before signing."`,
  },

  // ── Free Case Books Collection ──
  {
    slug: "free-case-books",
    title: "Free Case Books from Top University Consulting Clubs",
    description: "A curated collection of free case books produced by consulting clubs at Darden, NYU Stern, Northeastern, and other top programs — all available as free PDF downloads.",
    format: "case_book",
    difficulty: "all_levels",
    category_id: CAT.caseBooks,
    tags: ["case books", "practice cases", "free resources", "darden", "nyu", "northeastern"],
    is_featured: true,
    is_published: true,
    content: `## Why University Case Books Are Worth Your Time

Every top MBA and undergraduate consulting club publishes an annual case book for its members — and most make them publicly available. These books contain practice cases written and edited by students who went through the same process, often with cases sourced directly from real interviews at MBB and other firms.

The quality varies, but the best ones offer something case coaching and prep courses do not: a large volume of raw case material covering every industry and case type, formatted the way real cases are delivered.

## The Essential Case Books

### Darden (University of Virginia)

The Darden case book is consistently one of the highest-quality free prep resources available. It covers a wide range of case types — profitability, market entry, market sizing, M&A — and includes interviewer guides alongside candidate-facing materials. Cases are organized by difficulty level, making it easy to build progressively. Darden's consulting club releases a new edition annually; search "Darden case book PDF" to find the current version.

### NYU Stern

The Stern case book is known for its finance and private equity-adjacent cases, reflecting NYU's strength in those areas. Particularly useful if you are targeting firms with strong PE practices (Bain, Oliver Wyman) or financial services-focused engagements. NYU Stern releases the book through its consulting club — search "Stern consulting case book."

### Northeastern University

Northeastern's case book is notable for its clear case structure and strong interviewee answer guides, which make it particularly good for self-study. The cases skew toward operations and supply chain — useful for Deloitte S&O and Kearney targeting. Search "Northeastern case book consulting."

### Additional Strong Options

- **Wharton (University of Pennsylvania):** Strong on strategy and M&A cases; the Wharton Consulting Club releases materials annually
- **Ross (University of Michigan):** Particularly good coverage of market entry and competitive dynamics cases
- **Kellogg (Northwestern):** Excellent behavioral question guides alongside case content; useful for fit prep as well
- **Columbia Business School:** Strong coverage of growth strategy and retail/consumer cases
- **Harvard Business School:** Cases tend to be more ambiguous and qualitative — useful for advanced practice

## How to Use Case Books Effectively

**Do not read them passively.** A case book is not a textbook. Reading through a case and its solution teaches you almost nothing. The value is in working each case aloud — ideally with a partner acting as the interviewer — and then reviewing where your structure or math diverged from the model answer.

**Prioritize the interviewer guide.** Most case books include a separate interviewer guide with the full case walkthrough, data exhibits, and common candidate mistakes. This is the most useful section. When practicing solo, cover the candidate guide and work from the interviewer guide only.

**Track what you practice.** Keep a log of the cases you have completed, which category each fell into, and what you would do differently. Pattern recognition develops faster when you can see your own history.

**Do not over-rely on templates.** University case books sometimes present overly rigid frameworks — "always use the 3 C's for X type of case." Real interviews reward candidates who build custom structures, not ones who recite frameworks. Use the cases for practice repetitions, not as a framework source.

## Where to Find Them

Search "[school name] consulting case book PDF [current year]" on Google. Most are hosted directly on university consulting club websites or shared publicly via Google Drive. Case Interview Wiki and several Reddit communities (r/consulting, r/MBA) maintain curated lists of download links updated annually.`,
  },

  // ── Strategy Simplified ──
  {
    slug: "strategy-simplified",
    title: "Strategy Simplified — YouTube Channel & Podcast",
    description: "One of the most-watched free resources for consulting interview prep — full case walkthroughs, MBB breakdowns, and recruiting advice on YouTube and podcast.",
    format: "video",
    difficulty: "all_levels",
    category_id: CAT.videos,
    tags: ["video", "podcast", "case walkthroughs", "youtube", "mbb", "free"],
    is_featured: true,
    is_published: true,
    external_url: "https://www.youtube.com/@StrategySimplified",
    content: `## What Strategy Simplified Is

Strategy Simplified is one of the most widely followed free consulting interview prep resources. The channel and podcast cover full case interview walkthroughs, MBB recruiting advice, and breakdowns of what firms actually look for — all delivered in a format that is easy to follow for candidates at any stage of prep.

## What You Will Find

**YouTube Channel:** Full-length case interview mock sessions, including both candidate and interviewer perspectives. The walkthroughs are particularly useful because they show candidates making real mistakes and recovering — not polished "perfect answer" demonstrations. Watching a case go sideways and get corrected is often more instructive than watching a flawless run.

**The Podcast:** Available on Spotify and Apple Podcasts. Episodes cover recruiting timelines, insider perspectives from ex-consultants, case frameworks explained conversationally, and deep dives on specific industries. The podcast format works well for commutes or passive review — you are absorbing the consulting mindset rather than drilling specific techniques.

## How to Use It

**For beginners:** Start with the introductory case walkthroughs. Watch one case, pause before the structure is revealed, and attempt to build your own framework. Then compare. This is more effective than watching passively.

**For intermediate candidates:** Use the podcast to fill in strategic context. Episodes on why consulting firms hire who they hire, what distinguishes a "round 3 vs. round 1 candidate," and how to think about the fit portion are useful at the 15-20 case mark in your preparation.

**For advanced candidates:** The channel's harder cases — market entry for complex industries, M&A scenarios with ambiguous data — are good final round simulation material.

## Complement With

Strategy Simplified works best as a visual and audio supplement to hands-on practice. It does not replace doing cases with a live partner, and it does not provide structured drilling of mental math or quantitative technique. Pair it with peer practice sessions and written case books for full coverage.`,
  },

  // ── RocketBlocks ──
  {
    slug: "rocketblocks",
    title: "RocketBlocks — Interactive Case Interview Practice",
    description: "A structured online practice platform for case interviews — drills, mock cases, and a large question bank built for MBB-style interviews.",
    format: "link",
    difficulty: "all_levels",
    category_id: CAT.videos,
    tags: ["practice", "drills", "interactive", "case practice", "platform"],
    is_featured: false,
    is_published: true,
    external_url: "https://www.rocketblocks.me/",
    content: `## What RocketBlocks Is

RocketBlocks is a structured online prep platform built specifically for management consulting case interviews. Unlike watching YouTube or reading a case book, RocketBlocks provides interactive drills — math exercises, brainstorming prompts, and mini-case modules — that simulate the individual components of a case interview rather than just full walkthroughs.

## Core Features

**Math Drills:** Timed mental math practice calibrated to case interview difficulty. Covers percentage calculations, market size arithmetic, CAGR, and unit economics. The drills are designed to push you beyond comfortable pacing — if you can do them under RocketBlocks' time pressure, the actual interview will feel slower.

**Brainstorming Drills:** Practice generating structured lists of ideas on a timer. "What are all the reasons a company's revenue might decline?" is the type of prompt. These drills build the brainstorming fluency that candidates often neglect until they freeze mid-case.

**Case Question Bank:** A library of case interview questions broken out by type (market sizing, profitability, market entry) and by difficulty. Questions can be attempted solo with a model answer for comparison, or used as material for partner practice sessions.

**Firm-Specific Prep:** RocketBlocks organizes content by target firm, which is useful for candidates with a specific offer as their primary goal. The McKinsey, BCG, and Bain tracks differ in emphasis — McKinsey prep focuses on hypothesis-driven structuring; Bain prep emphasizes synthesis and recommendation delivery.

## Pricing

RocketBlocks operates on a freemium model. A meaningful portion of the question bank and drills are available without payment. The paid tier unlocks additional cases, firm-specific modules, and some community features. For most candidates, the free tier is sufficient to run the math and brainstorming drills; the paid content is most valuable for candidates targeting a single specific firm.

## How to Use It

RocketBlocks works best for targeted skill drilling rather than as a primary prep source. Use it to:

- Warm up before a practice case session (10 minutes of math drills)
- Identify specific weak spots (are you slow on percentages? Weak on brainstorming structure?)
- Get volume on specific case types you are less comfortable with

It does not replace practicing full cases with a live partner, and it does not build the communication and presence skills that matter in real interviews. Think of it as a gym for your case mechanics — necessary conditioning, but not the whole game.`,
  },
]

for (const r of newResources) {
  const existing = await sql`SELECT id FROM resources WHERE slug = ${r.slug}`
  if (existing.length > 0) {
    console.log(`Skipping (already exists): ${r.slug}`)
    continue
  }

  await sql`
    INSERT INTO resources (
      id, slug, title, description, content, format, difficulty,
      category_id, tags, is_featured, is_published,
      external_url, view_count, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      ${r.slug},
      ${r.title},
      ${r.description},
      ${r.content},
      ${r.format},
      ${r.difficulty},
      ${r.category_id},
      ${r.tags},
      ${r.is_featured},
      ${r.is_published},
      ${r.external_url ?? null},
      0,
      NOW(),
      NOW()
    )
  `
  console.log(`Inserted: ${r.slug}`)
}

console.log("\nAll done.")
await sql.end()
