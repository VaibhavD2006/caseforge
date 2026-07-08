"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"

type Turn = {
  role: "interviewer" | "user"
  content: string
}

export default function InterviewPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [ending, setEnding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // On mount, load initial opening message from storage or fetch
  useEffect(() => {
    const stored = sessionStorage.getItem(`interview_${sessionId}`)
    if (stored) {
      const data = JSON.parse(stored) as { openingMessage: string }
      setTurns([{ role: "interviewer", content: data.openingMessage }])
    }
  }, [sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [turns, streaming])

  async function handleSend() {
    const message = input.trim()
    if (!message || streaming) return

    setInput("")
    setError(null)
    setTurns((prev) => [...prev, { role: "user", content: message }])
    setStreaming(true)

    try {
      const res = await fetch("/api/interview/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userMessage: message }),
      })

      if (!res.ok || !res.body) {
        throw new Error("Failed to get response")
      }

      // Stream the response
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let streamed = ""

      setTurns((prev) => [...prev, { role: "interviewer", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        streamed += chunk
        setTurns((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: "interviewer", content: streamed }
          return updated
        })
      }
    } catch {
      setError("Response failed. Please try again.")
    } finally {
      setStreaming(false)
      textareaRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  async function handleEnd() {
    if (ending) return
    setEnding(true)

    try {
      await fetch("/api/interview/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
      router.push(`/feedback/${sessionId}`)
    } catch {
      setError("Could not end session. Please try again.")
      setEnding(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[oklch(0.11_0.012_258)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[oklch(0.62_0.19_258)] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">CF</span>
          </div>
          <span className="text-[oklch(0.93_0.005_258)] text-sm font-medium">
            Mock Interview
          </span>
          <span className="text-[oklch(0.40_0.008_258)] text-xs">
            · {sessionId.slice(0, 8)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => void handleEnd()}
          disabled={ending || streaming}
          className="px-3 py-1.5 rounded border border-[oklch(0.25_0.015_258)] text-[oklch(0.62_0.010_258)] text-xs hover:border-[oklch(0.60_0.18_22)] hover:text-[oklch(0.60_0.18_22)] transition-colors duration-150 disabled:opacity-40 cursor-pointer"
        >
          {ending ? "Ending..." : "End interview"}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {turns.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-[oklch(0.40_0.008_258)] text-sm">
              Loading interview...
            </p>
          </div>
        )}

        {turns.map((turn, i) => (
          <div
            key={i}
            className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                turn.role === "interviewer"
                  ? "bg-[oklch(0.15_0.013_258)] border border-[oklch(0.25_0.015_258)] text-[oklch(0.93_0.005_258)]"
                  : "bg-[oklch(0.20_0.05_258)] border border-[oklch(0.35_0.10_258)] text-[oklch(0.93_0.005_258)]"
              }`}
            >
              {turn.role === "interviewer" && (
                <div className="text-[oklch(0.62_0.19_258)] text-xs font-medium mb-1">
                  Interviewer
                </div>
              )}
              <p className="whitespace-pre-wrap">{turn.content}</p>
            </div>
          </div>
        ))}

        {streaming && turns[turns.length - 1]?.role === "interviewer" && turns[turns.length - 1]?.content === "" && (
          <div className="flex justify-start">
            <div className="bg-[oklch(0.15_0.013_258)] border border-[oklch(0.25_0.015_258)] rounded-lg px-4 py-3">
              <div className="text-[oklch(0.62_0.19_258)] text-xs font-medium mb-1">
                Interviewer
              </div>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.40_0.008_258)] animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.40_0.008_258)] animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.40_0.008_258)] animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-[oklch(0.18_0.05_22)] border-t border-[oklch(0.60_0.18_22)]">
          <p className="text-[oklch(0.60_0.18_22)] text-xs">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] px-4 py-3">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your response... (Enter to send, Shift+Enter for new line)"
            rows={3}
            disabled={streaming}
            className="flex-1 resize-none rounded-md border border-[oklch(0.25_0.015_258)] bg-[oklch(0.19_0.014_258)] text-[oklch(0.93_0.005_258)] text-sm px-3 py-2.5 placeholder:text-[oklch(0.40_0.008_258)] focus:outline-none focus:border-[oklch(0.62_0.19_258)] focus:ring-1 focus:ring-[oklch(0.62_0.19_258)] transition-colors disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!input.trim() || streaming}
            className="px-4 py-2.5 rounded-md bg-[oklch(0.62_0.19_258)] hover:bg-[oklch(0.67_0.19_258)] text-white text-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
          >
            Send
          </button>
        </div>
        <p className="text-[oklch(0.40_0.008_258)] text-xs mt-2">
          Enter to send · Shift+Enter for new line · Click "End interview" when
          finished
        </p>
      </div>
    </div>
  )
}
