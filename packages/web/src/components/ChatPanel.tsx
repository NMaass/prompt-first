import type { Part, ToolPart } from "@opencode-ai/sdk"
import { useEffect, useRef, useState } from "react"
import type { TimelineMessage } from "@/hooks/useSession"
import type { LearningNote } from "@/studio/types"
import { LearningTray } from "@/components/LearningTray"

export function ChatPanel(input: {
  messages: TimelineMessage[]
  learning: LearningNote[]
  streaming: boolean
  error: string | null
  onSend: (text: string) => void
  onStop: () => void
  onEnd: () => void
}) {
  const [draft, setDraft] = useState("")
  const scroll = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scroll.current) return
    const nearBottom = scroll.current.scrollHeight - scroll.current.scrollTop - scroll.current.clientHeight < 160
    if (nearBottom) scroll.current.scrollTop = scroll.current.scrollHeight
  }, [input.messages])

  const send = () => {
    const text = draft.trim()
    if (!text || input.streaming) return
    input.onSend(text)
    setDraft("")
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-[var(--border)] bg-[var(--bg)] lg:border-b-0 lg:border-r" aria-label="Builder conversation">
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Agentic Product Studio</div>
          <div className="mt-1 truncate text-xs text-[var(--text-muted)]">
            {input.streaming ? "Builder active · reversible work can continue" : "Builder ready · inspect evidence and redirect as needed"}
          </div>
        </div>
        <button
          type="button"
          onClick={input.onEnd}
          className="min-h-9 shrink-0 rounded-lg border border-[var(--border)] px-3 text-xs font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
        >
          End mission
        </button>
      </header>
      <LearningTray notes={input.learning} />

      <div ref={scroll} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
        {input.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {input.error ? (
          <div role="alert" className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger-text)]">
            {input.error}
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] p-3">
        <label htmlFor="builder-message" className="sr-only">Message the builder</label>
        <textarea
          id="builder-message"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.shiftKey) return
            event.preventDefault()
            send()
          }}
          rows={3}
          placeholder={input.streaming ? "You can draft your next direction while the builder works…" : "Describe a requirement, problem you observed, or product decision…"}
          className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm leading-6 text-[var(--text)] outline-none placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)]"
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={input.onStop}
            disabled={!input.streaming}
            className="min-h-10 rounded-lg border border-[var(--border)] px-3 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--danger)] disabled:cursor-default disabled:opacity-35"
          >
            Stop
          </button>
          <button
            type="button"
            onClick={send}
            disabled={input.streaming || !draft.trim()}
            className="min-h-10 rounded-lg bg-[var(--accent)] px-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-default disabled:opacity-35"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  )
}

function MessageBubble({ message }: { message: TimelineMessage }) {
  const user = message.role === "user"
  const text = message.parts.filter(isText).map((part) => part.text).join("")
  const tools = message.parts.filter(isTool)
  if (!text && !tools.length) return null

  return (
    <article className={`flex ${user ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[92%] rounded-xl px-3.5 py-2.5 text-sm leading-6 ${user ? "bg-[var(--accent)] text-white" : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"}`}>
        {text ? <div className="whitespace-pre-wrap">{text}</div> : null}
        {tools.length ? <ToolActivity tools={tools} /> : null}
      </div>
    </article>
  )
}

function ToolActivity({ tools }: { tools: ToolPart[] }) {
  return (
    <div className={`${tools.length ? "mt-2" : ""} space-y-1 border-t border-[var(--border)] pt-2`}>
      {tools.map((part) => (
        <div key={part.callID} className="grid grid-cols-[1rem_1fr] gap-1.5 text-xs text-[var(--text-muted)]">
          <span aria-hidden="true">{part.state.status === "completed" ? "✓" : part.state.status === "error" ? "!" : "•"}</span>
          <span>{toolLabel(part)}</span>
        </div>
      ))}
    </div>
  )
}

function toolLabel(part: ToolPart) {
  const names: Record<string, string> = {
    "studio-contract": "Updated Mission Contract",
    "studio-map": "Updated Product Map",
    "studio-evidence": "Recorded product evidence",
    "studio-preview": "Published product preview",
    "studio-browser-check": "Ran browser verification",
    "studio-effect-request": "Requested an external effect",
    "studio-learning-note": "Published a just-in-time learning note",
    skill: "Loaded a specialist skill",
    task: "Delegated specialist review",
    bash: "Ran the product environment",
    read: "Inspected project files",
    write: "Created project files",
    edit: "Updated project files",
  }
  const title = part.state.status === "running" || part.state.status === "completed" ? part.state.title : undefined
  return title || names[part.tool] || part.tool
}

function isText(part: Part): part is Extract<Part, { type: "text" }> {
  return part.type === "text"
}

function isTool(part: Part): part is ToolPart {
  return part.type === "tool"
}
