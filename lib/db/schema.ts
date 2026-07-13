import {
  boolean,
  date,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"

// ─── Auth.js v5 Adapter Tables ──────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
})

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
)

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
    passwordHash: text("password_hash"),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
)

// ─── Enums ───────────────────────────────────────────────────────────────────

export const experienceLevelEnum = pgEnum("experience_level", [
  "undergrad",
  "mba",
  "professional",
  "career_switcher",
])

export const planTierEnum = pgEnum("plan_tier", ["free", "pro", "premium"])

export const firmStyleEnum = pgEnum("firm_style", [
  "mbb",
  "big4",
  "boutique",
  "generic",
])

export const interviewTypeEnum = pgEnum("interview_type", [
  "case",
  "market_sizing",
  "behavioral",
  "drill",
  "case_math",
  "pressure_round",
])

export const sessionStatusEnum = pgEnum("session_status", [
  "in_progress",
  "completed",
  "abandoned",
  "evaluation_pending",
  "evaluated",
])

export const readinessLevelEnum = pgEnum("readiness_level", [
  "not_started",
  "developing",
  "approaching_ready",
  "interview_ready",
])

export const tierEnum = pgEnum("tier", ["bronze", "silver", "gold", "emerald"])

export const drillStatusEnum = pgEnum("drill_status", [
  "pending",
  "in_progress",
  "completed",
  "skipped",
])

export const drillTypeEnum = pgEnum("drill_type", [
  "mini_case",
  "math_exercise",
  "synthesis_prompt",
  "communication_exercise",
])

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"])

export const caseTypeEnum = pgEnum("case_type", [
  "profitability",
  "market_entry",
  "growth",
  "operations",
  "market_sizing",
  "strategy",
])

export const promptTemplateTypeEnum = pgEnum("prompt_template_type", [
  "interviewer_system",
  "evaluator_dimension",
  "drill_generation",
  "recommendation",
])

export const dimensionEnum = pgEnum("dimension", [
  "structure",
  "framing",
  "hypothesis",
  "quantitative",
  "business_judgment",
  "creativity",
  "synthesis",
  "recommendation_quality",
  "communication",
  "confidence",
  "presence",
])

export const goalTypeEnum = pgEnum("goal_type", [
  "score_target",
  "drill_count",
  "session_count",
  "firm_readiness",
  "dimension_target",
])

export const goalStatusEnum = pgEnum("goal_status", [
  "active",
  "completed",
  "abandoned",
])

// ─── CaseForge Entities ───────────────────────────────────────────────────────

export const candidateProfiles = pgTable("candidate_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  targetFirms: text("target_firms").array().notNull().default([]),
  targetRole: text("target_role"),
  experienceLevel: experienceLevelEnum("experience_level"),
  interviewDate: date("interview_date"),
  selfAssessmentScores: jsonb("self_assessment_scores"),
  planTier: planTierEnum("plan_tier").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // Screener fields
  screenerCompleted: boolean("screener_completed").notNull().default(false),
  behavioralConfidenceRating: integer("behavioral_confidence_rating"),
  quantComfortRating: integer("quant_comfort_rating"),
  screenerBaselineResponse: text("screener_baseline_response"),
  screenerCompletedAt: timestamp("screener_completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const promptTemplates = pgTable("prompt_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  type: promptTemplateTypeEnum("type").notNull(),
  content: text("content").notNull(),
  version: integer("version").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const rubricConfigs = pgTable("rubric_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  dimensions: jsonb("dimensions").notNull(),
  version: integer("version").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const interviewTemplates = pgTable("interview_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  firmStyle: firmStyleEnum("firm_style").notNull(),
  interviewType: interviewTypeEnum("interview_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  systemPromptRef: text("system_prompt_ref").notNull(),
  rubricRef: text("rubric_ref").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const caseLibrary = pgTable("case_library", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  industry: text("industry").notNull(),
  firmStyle: firmStyleEnum("firm_style").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  caseType: caseTypeEnum("case_type").notNull(),
  contextText: text("context_text").notNull(),
  idealAnswerOutline: jsonb("ideal_answer_outline"),
  keyMetrics: jsonb("key_metrics"),
  isActive: boolean("is_active").notNull().default(true),
  version: integer("version").notNull().default(1),
  timesUsed: integer("times_used").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const interviewSessions = pgTable("interview_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  templateId: uuid("template_id").references(() => interviewTemplates.id),
  caseId: uuid("case_id").references(() => caseLibrary.id),
  firmStyle: firmStyleEnum("firm_style").notNull(),
  firmId: text("firm_id"),
  interviewType: interviewTypeEnum("interview_type").notNull(),
  status: sessionStatusEnum("status").notNull().default("in_progress"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  durationSeconds: integer("duration_seconds"),
  turnCount: integer("turn_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const transcripts = pgTable("transcripts", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .unique()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  turns: jsonb("turns").notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const scorecards = pgTable("scorecards", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .unique()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  overallScore: decimal("overall_score", { precision: 4, scale: 2 }),
  dimensionScores: jsonb("dimension_scores"),
  topStrengths: text("top_strengths").array().default([]),
  topWeaknesses: text("top_weaknesses").array().default([]),
  strengthTagKeys: text("strength_tag_keys").array().default([]),
  weaknessTagKeys: text("weakness_tag_keys").array().default([]),
  evaluatorModel: text("evaluator_model"),
  evaluatorPromptVersion: text("evaluator_prompt_version"),
  reliabilityFlag: boolean("reliability_flag").default(false),
  nextActions: text("next_actions").array().default([]),
  recruiterSummary: text("recruiter_summary"),
  improvementReport: text("improvement_report"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const weaknessTags = pgTable("weakness_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tagKey: text("tag_key").notNull(),
  tagLabel: text("tag_label").notNull(),
  dimension: dimensionEnum("dimension").notNull(),
  occurrenceCount: integer("occurrence_count").notNull().default(1),
  isPersistent: boolean("is_persistent").notNull().default(false),
  lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
  firstSeenAt: timestamp("first_seen_at").notNull().defaultNow(),
  sessionIds: uuid("session_ids").array().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const drillRecommendations = pgTable("drill_recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sourceSessionId: uuid("source_session_id").references(
    () => interviewSessions.id
  ),
  targetTagKeys: text("target_tag_keys").array().notNull().default([]),
  drillType: drillTypeEnum("drill_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  promptContent: text("prompt_content").notNull(),
  status: drillStatusEnum("status").notNull().default("pending"),
  completedAt: timestamp("completed_at"),
  sessionId: uuid("session_id").references(() => interviewSessions.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const progressSnapshots = pgTable("progress_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  snapshotDate: date("snapshot_date").notNull(),
  triggerSessionId: uuid("trigger_session_id").references(
    () => interviewSessions.id
  ),
  sessionCount: integer("session_count").notNull().default(0),
  avgOverallScore: decimal("avg_overall_score", { precision: 4, scale: 2 }),
  dimensionAvgScores: jsonb("dimension_avg_scores"),
  readinessLevel: readinessLevelEnum("readiness_level")
    .notNull()
    .default("not_started"),
  tier: tierEnum("tier").notNull().default("bronze"),
  persistentWeaknessTagKeys: text("persistent_weakness_tag_keys")
    .array()
    .default([]),
  firmReadinessScores: jsonb("firm_readiness_scores").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  goalType: goalTypeEnum("goal_type").notNull(),
  targetValue: decimal("target_value", { precision: 5, scale: 2 }),
  currentValue: decimal("current_value", { precision: 5, scale: 2 }).default("0"),
  dimension: dimensionEnum("dimension"),
  firmStyle: firmStyleEnum("firm_style"),
  targetDate: date("target_date"),
  status: goalStatusEnum("goal_status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const drills = pgTable("drills", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  skillFocus: dimensionEnum("skill_focus").notNull(),
  drillType: drillTypeEnum("drill_type").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  prompt: text("prompt").notNull(),
  expectedTraits: text("expected_traits").array().notNull().default([]),
  estimatedMinutes: integer("estimated_minutes").notNull().default(5),
  interviewMode: interviewTypeEnum("interview_mode"),
  isActive: boolean("is_active").notNull().default(true),
  timesAttempted: integer("times_attempted").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const drillAttempts = pgTable("drill_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  drillId: uuid("drill_id")
    .notNull()
    .references(() => drills.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  response: text("response").notNull(),
  score: decimal("score", { precision: 4, scale: 2 }),
  feedback: text("feedback"),
  improvementNote: text("improvement_note"),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
})

// ─── Type exports ─────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect
export type Account = typeof accounts.$inferSelect
export type CandidateProfile = typeof candidateProfiles.$inferSelect
export type InterviewTemplate = typeof interviewTemplates.$inferSelect
export type CaseLibraryItem = typeof caseLibrary.$inferSelect
export type InterviewSession = typeof interviewSessions.$inferSelect
export type Transcript = typeof transcripts.$inferSelect
export type Scorecard = typeof scorecards.$inferSelect
export type WeaknessTag = typeof weaknessTags.$inferSelect
export type DrillRecommendation = typeof drillRecommendations.$inferSelect
export type ProgressSnapshot = typeof progressSnapshots.$inferSelect
export type PromptTemplate = typeof promptTemplates.$inferSelect
export type RubricConfig = typeof rubricConfigs.$inferSelect
export type Goal = typeof goals.$inferSelect
export type Drill = typeof drills.$inferSelect
export type DrillAttempt = typeof drillAttempts.$inferSelect
