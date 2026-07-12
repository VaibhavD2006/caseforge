"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Mic, MicOff, Send, Square, Clock } from "lucide-react"

type Turn = { role: "interviewer" | "user"; content: string }

const STAGES = ["Opening", "Clarification", "Analysis", "Synthesis", "Recommendation"] as const
type Stage = (typeof STAGES)[number]

const STAGE_KEYS: Record<string, Stage> = {
  opening: "Opening",
  clarification: "Clarification",
  analysis: "Analysis",
  synthesis: "Synthesis",
  recommendation: "Recommendation",
}

// Strip [STAGE:xxx] markers from AI content, return { content, stage }
function parseStageSignal(text: string): { content: string; stage: Stage | null } {
  const match = text.match(/\[STAGE:(\w+)\]/i)
  if (!match) return { content: text, stage: null }
  return {
    content: text.replace(/\[STAGE:\w+\]/gi, "").trim(),
    stage: STAGE_KEYS[match[1]?.toLowerCase() ?? ""] ?? null,
  }
}

function useTimer() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")
  const color = seconds >= 35 * 60 ? "text-[oklch(0.60_0.18_22)]" : seconds >= 25 * 60 ? "text-[oklch(0.72_0.15_78)]" : "text-brand"
  return { label: `${mm}:${ss}`, color }
}

type SR = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((e: { resultIndex: number; results: { isFinal: boolean; [0]: { transcript: string } }[] }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SR
    webkitSpeechRecognition?: new () => SR
  }
}

export default function InterviewPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [caseContext, setCaseContext] = useState<string>("")
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [ending, setEnding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>("Opening")
  const [listening, setListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SR | null>(null)

  const timer = useTimer()

  useEffect(() => {
    setSpeechSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition))
  }, [])

  useEffect(() => {
    const stored = sessionStorage.getItem(`interview_${sessionId}`)
    if (stored) {
      const data = JSON.parse(stored) as { openingMessage: string }
      const { content } = parseStageSignal(data.openingMessage)
      setCaseContext(content)
    }
  }, [sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [turns, streaming])

  const toggleVoice = useCallback(() => {
    if (!speechSupported) return
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const SRClass = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!SRClass) return
    const rec = new SRClass()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = "en-US"
    let finalSoFar = ""
    rec.onresult = (e) => {
      let interim = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r && r.isFinal) finalSoFar += r[0]?.transcript + " "
        else if (r) interim = r[0]?.transcript ?? ""
      }
      setInput(finalSoFar + interim)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    rec.start()
    recognitionRef.current = rec
    setListening(true)
  }, [speechSupported, listening])

  async function handleSend() {
    const message = input.trim()
    if (!message || streaming) return
    if (listening) { recognitionRef.current?.stop(); setListening(false) }
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
      if (!res.ok || !res.body) throw new Error()

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let streamed = ""
      setTurns((prev) => [...prev, { role: "interviewer", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        streamed += decoder.decode(value, { stream: true })
        const { content, stage: sig } = parseStageSignal(streamed)
        if (sig) setStage(sig)
        setTurns((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: "interviewer", content }
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

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend() }
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

  const stageIdx = STAGES.indexOf(stage)

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-border-subtle bg-surface flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-brand flex items-center justify-center">
            <span className="text-[oklch(0.10_0.012_148)] text-[10px] font-bold">CF</span>
          </div>
          <span className="text-ink text-sm font-medium">Mock Interview</span>
          <span className="text-ink-faint text-xs">· {sessionId.slice(0, 8)}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Stage pills */}
          <div className="hidden md:flex items-center gap-1">
            {STAGES.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                  i === stageIdx
                    ? "bg-brand-subtle text-brand border border-brand-muted font-medium"
                    : i < stageIdx
                    ? "text-ink-faint"
                    : "text-ink-faint opacity-40"
                }`}>
                  {s}
                </span>
                {i < STAGES.length - 1 && <span className="text-border-strong text-xs">›</span>}
              </div>
            ))}
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1 ${timer.color}`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-mono font-medium">{timer.label}</span>
          </div>

          <button
            type="button"
            onClick={() => void handleEnd()}
            disabled={ending || streaming}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle text-ink-muted text-xs hover:border-[oklch(0.60_0.18_22)] hover:text-[oklch(0.60_0.18_22)] transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Square className="w-3 h-3" />
            {ending ? "Ending…" : "End"}
          </button>
        </div>
      </div>

      {/* Split panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Case context */}
        <div className="w-[42%] border-r border-border-subtle bg-surface flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border-subtle flex-shrink-0">
            <p className="text-ink-muted text-xs uppercase tracking-wider">Case Brief</p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {caseContext ? (
              <div className="text-ink text-sm leading-relaxed whitespace-pre-wrap">
                {caseContext}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-ink-faint text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-pulse" />
                Loading case…
              </div>
            )}
          </div>

          {/* Stage indicator (mobile) */}
          <div className="md:hidden px-4 py-3 border-t border-border-subtle flex-shrink-0">
            <div className="flex items-center gap-1 flex-wrap">
              {STAGES.map((s, i) => (
                <span key={s} className={`text-xs px-1.5 py-0.5 rounded ${
                  i === stageIdx ? "bg-brand-subtle text-brand" : i < stageIdx ? "text-ink-faint" : "text-ink-faint opacity-40"
                }`}>{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Transcript + input */}
        <div className="flex-1 flex flex-col overflow-hidden bg-bg">
          {/* Transcript */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {turns.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-ink-faint text-sm">Respond to begin the interview.</p>
              </div>
            )}

            {turns.map((turn, i) => (
              <div key={i} className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  turn.role === "interviewer"
                    ? "bg-surface border border-border-subtle text-ink"
                    : "bg-brand-subtle border border-brand-muted text-ink"
                }`}>
                  {turn.role === "interviewer" && (
                    <p className="text-brand text-xs font-medium mb-1">Interviewer</p>
                  )}
                  <p className="whitespace-pre-wrap">{turn.content}</p>
                </div>
              </div>
            ))}

            {streaming && turns[turns.length - 1]?.role === "interviewer" && turns[turns.length - 1]?.content === "" && (
              <div className="flex justify-start">
                <div className="bg-surface border border-border-subtle rounded-xl px-3.5 py-2.5">
                  <p className="text-brand text-xs font-medium mb-1">Interviewer</p>
                  <div className="flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {error && (
            <div className="px-4 py-2 bg-[oklch(0.16_0.05_22)] border-t border-[oklch(0.28_0.08_22)] flex-shrink-0">
              <p className="text-[oklch(0.60_0.18_22)] text-xs">{error}</p>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border-subtle bg-surface px-4 py-3 flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={listening ? "Listening… speak now" : "Type your response…"}
                rows={3}
                disabled={streaming}
                className="flex-1 resize-none rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm px-3 py-2.5 placeholder:text-ink-faint focus:outline-none focus:border-brand-muted focus:ring-1 focus:ring-brand-muted transition-colors disabled:opacity-50"
              />
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleVoice}
                    title={listening ? "Stop recording" : "Start voice input"}
                    className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                      listening
                        ? "border-brand bg-brand-subtle text-brand"
                        : "border-border-subtle text-ink-muted hover:border-brand-muted hover:text-brand"
                    }`}
                  >
                    {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={!input.trim() || streaming}
                  className="p-2.5 rounded-lg bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-ink-faint text-xs mt-1.5">Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  )
}
