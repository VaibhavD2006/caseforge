import { describe, it, expect } from 'vitest'
import { estimateTurnCostCents, formatCostDollars } from './cost'

describe('estimateTurnCostCents', () => {
  it('returns 0 for empty input and output', () => {
    expect(estimateTurnCostCents(0, 0)).toBe(0)
  })

  it('is positive for non-zero chars', () => {
    expect(estimateTurnCostCents(1000, 500)).toBeGreaterThan(0)
  })

  it('scales with input size', () => {
    const small = estimateTurnCostCents(100, 100)
    const large = estimateTurnCostCents(10_000, 10_000)
    expect(large).toBeGreaterThan(small)
  })

  it('output tokens cost more than equivalent input tokens', () => {
    // 4000 chars = 1000 tokens for each; output rate is 4× input rate
    const inputOnly = estimateTurnCostCents(4_000, 0)
    const outputOnly = estimateTurnCostCents(0, 4_000)
    expect(outputOnly).toBeGreaterThan(inputOnly)
  })

  it('typical turn (5k input, 1k output) is sub-penny', () => {
    const cents = estimateTurnCostCents(5_000, 1_000)
    expect(cents).toBeGreaterThan(0)
    expect(cents).toBeLessThan(1) // less than 1 cent per turn
  })
})

describe('formatCostDollars', () => {
  it('formats zero', () => {
    expect(formatCostDollars(0)).toBe('$0.0000')
  })

  it('formats 100 cents as $1.0000', () => {
    expect(formatCostDollars(100)).toBe('$1.0000')
  })

  it('formats fractional cents correctly', () => {
    expect(formatCostDollars(0.5)).toBe('$0.0050')
  })
})
