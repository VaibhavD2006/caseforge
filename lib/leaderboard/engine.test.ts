import { describe, it, expect } from "vitest"
import { computeLeaderboardScore, computeRankMovement } from "./engine"

function card(score: number, daysAgo: number, status = "evaluated", flag = false) {
  return {
    overallScore: score,
    createdAt: new Date(Date.now() - daysAgo * 86_400_000),
    reliabilityFlag: flag,
    sessionStatus: status,
  }
}

describe("computeLeaderboardScore", () => {
  it("returns zero when fewer than 3 eligible sessions", () => {
    expect(computeLeaderboardScore([card(8, 1), card(7, 2)]).leaderboardScore).toBe(0)
  })

  it("returns positive score for 3+ valid sessions", () => {
    const result = computeLeaderboardScore([card(8, 1), card(7, 2), card(9, 3)])
    expect(result.leaderboardScore).toBeGreaterThan(0)
    expect(result.eligibleSessionCount).toBe(3)
  })

  it("caps at 3 sessions per day (anti-gaming)", () => {
    const fiveSameDay = Array.from({ length: 5 }, () => card(9, 0))
    expect(computeLeaderboardScore(fiveSameDay).eligibleSessionCount).toBeLessThanOrEqual(3)
  })

  it("excludes reliability-flagged sessions", () => {
    const flagged = [card(10, 1, "evaluated", true), card(10, 2, "evaluated", true), card(10, 3, "evaluated", true)]
    expect(computeLeaderboardScore(flagged).leaderboardScore).toBe(0)
  })

  it("excludes non-evaluated sessions", () => {
    const bad = [card(9, 1, "in_progress"), card(9, 2, "completed"), card(9, 3, "completed")]
    expect(computeLeaderboardScore(bad).leaderboardScore).toBe(0)
  })

  it("score is always in range 0–10", () => {
    const cards = Array.from({ length: 10 }, (_, i) => card(10, i + 1))
    const { leaderboardScore } = computeLeaderboardScore(cards)
    expect(leaderboardScore).toBeGreaterThanOrEqual(0)
    expect(leaderboardScore).toBeLessThanOrEqual(10)
  })
})

describe("computeRankMovement", () => {
  it("returns new when no previous rank", () => {
    expect(computeRankMovement(1, null).direction).toBe("new")
  })
  it("returns up when rank improved", () => {
    expect(computeRankMovement(2, 5).direction).toBe("up")
  })
  it("returns down when rank fell", () => {
    expect(computeRankMovement(5, 2).direction).toBe("down")
  })
  it("returns same when rank unchanged", () => {
    expect(computeRankMovement(3, 3).direction).toBe("same")
  })
})
