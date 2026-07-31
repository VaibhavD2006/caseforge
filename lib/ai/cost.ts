// Gemini Flash Lite approximate pricing (mid-2025 rates)
// ponytail: char-based token estimate; swap for exact usageMetadata if Gemini SDK exposes it
const INPUT_CENTS_PER_MILLION_TOKENS = 7.5  // $0.075 / 1M input tokens
const OUTPUT_CENTS_PER_MILLION_TOKENS = 30  // $0.30 / 1M output tokens
const CHARS_PER_TOKEN = 4

export function estimateTurnCostCents(inputChars: number, outputChars: number): number {
  const inputTokens = Math.ceil(inputChars / CHARS_PER_TOKEN)
  const outputTokens = Math.ceil(outputChars / CHARS_PER_TOKEN)
  return (inputTokens / 1_000_000) * INPUT_CENTS_PER_MILLION_TOKENS
       + (outputTokens / 1_000_000) * OUTPUT_CENTS_PER_MILLION_TOKENS
}

// cents → "$0.0034" format
export function formatCostDollars(cents: number): string {
  return `$${(cents / 100).toFixed(4)}`
}
