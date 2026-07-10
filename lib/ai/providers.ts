import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const DEFAULT_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash"

export type Message = {
  role: "system" | "user" | "assistant"
  content: string
}

function buildGeminiMessages(messages: Message[]) {
  const systemMessage = messages.find((m) => m.role === "system")
  const chatMessages = messages.filter((m) => m.role !== "system")

  const history = chatMessages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }))

  const lastMessage = chatMessages[chatMessages.length - 1]

  return { systemMessage, history, lastMessage }
}

export async function chatCompletion(
  messages: Message[],
  options?: { model?: string; temperature?: number }
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: options?.model ?? DEFAULT_MODEL,
    systemInstruction: messages.find((m) => m.role === "system")?.content,
    generationConfig: { temperature: options?.temperature ?? 0.7 },
  })

  const { history, lastMessage } = buildGeminiMessages(messages)
  const chat = model.startChat({ history })
  const result = await chat.sendMessage(lastMessage?.content ?? "")
  return result.response.text()
}

export async function* chatStream(
  messages: Message[],
  options?: { model?: string; temperature?: number }
): AsyncGenerator<string> {
  const model = genAI.getGenerativeModel({
    model: options?.model ?? DEFAULT_MODEL,
    systemInstruction: messages.find((m) => m.role === "system")?.content,
    generationConfig: { temperature: options?.temperature ?? 0.7 },
  })

  const { history, lastMessage } = buildGeminiMessages(messages)
  const chat = model.startChat({ history })
  const result = await chat.sendMessageStream(lastMessage?.content ?? "")

  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) yield text
  }
}

export async function jsonCompletion<T>(
  messages: Message[],
  options?: { model?: string }
): Promise<T> {
  const model = genAI.getGenerativeModel({
    model: options?.model ?? DEFAULT_MODEL,
    systemInstruction: messages.find((m) => m.role === "system")?.content,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  })

  const { history, lastMessage } = buildGeminiMessages(messages)
  const chat = model.startChat({ history })
  const result = await chat.sendMessage(lastMessage?.content ?? "")
  return JSON.parse(result.response.text()) as T
}
