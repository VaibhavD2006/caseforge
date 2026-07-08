import { Ollama } from "ollama"

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST ?? "http://localhost:11434",
})

const DEFAULT_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2"

export type Message = {
  role: "system" | "user" | "assistant"
  content: string
}

export async function chatCompletion(
  messages: Message[],
  options?: { model?: string; temperature?: number }
): Promise<string> {
  const response = await ollama.chat({
    model: options?.model ?? DEFAULT_MODEL,
    messages,
    options: {
      temperature: options?.temperature ?? 0.7,
    },
  })
  return response.message.content
}

export async function* chatStream(
  messages: Message[],
  options?: { model?: string; temperature?: number }
): AsyncGenerator<string> {
  const stream = await ollama.chat({
    model: options?.model ?? DEFAULT_MODEL,
    messages,
    stream: true,
    options: {
      temperature: options?.temperature ?? 0.7,
    },
  })

  for await (const chunk of stream) {
    if (chunk.message.content) {
      yield chunk.message.content
    }
  }
}

export async function jsonCompletion<T>(
  messages: Message[],
  options?: { model?: string }
): Promise<T> {
  const response = await ollama.chat({
    model: options?.model ?? DEFAULT_MODEL,
    messages,
    format: "json",
    options: {
      temperature: 0.1,
    },
  })
  return JSON.parse(response.message.content) as T
}
