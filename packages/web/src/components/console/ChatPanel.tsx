import { useEffect, useRef, useState } from "react"
import type { Message, Part } from "@/hooks/useSession"

interface ChatPanelProps {
  messages: Message[]
  streaming: boolean
  onSend: (text: string) => void
}

export function ChatPanel({ messages, streaming, onSend }: ChatPanelProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const send = () => {
    const text = input.trim()
    if (!text || streaming) return
    onSend(text)
    setInput("")
  }

  return (
    <div className="flex h-full flex-col border-r border-[var(--border)]">
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">Agentic Product Studio</div>
        <div className="mt-1 text-xs text-[var(--text-muted)]">
          {streaming
            ? "The builder is working. Reversible implementation can continue while requirements and evidence are refined."
            : "Define what the product should do, inspect what the agent proves, and redirect it when the result is not good enough."}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="text-lg font-medium text-[var(--text)]">What do you want to make?</div>
            <div className="mt-2 max-w-xs text-sm text-[var(--text-muted)]">
              Describe the product, who it is for, and what you want it to accomplish. The builder can start immediately and surface important decisions as they matter.
            </div>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <div className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.shiftKey) return
              event.preventDefault()
              send()
            }}
            placeholder="Describe the product, a requirement, a problem you observed, or what should change..."
            disabled={streaming}
            rows={3}
            className="flex-1 resize-none rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim() || streaming}
            className="self-end rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const user = message.role === "user"

  return (
    <div className={`flex ${user ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
          user
            ? "rounded-br-sm bg-[var(--accent)] text-white"
            : "rounded-bl-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
        }`}
      >
        {message.content || <span className="italic text-[var(--text-muted)]">Working…</span>}
        {!user && message.parts?.length ? <ToolActivity parts={message.parts} /> : null}
      </div>
    </div>
  )
}

function ToolActivity({ parts }: { parts: Part[] }) {
  const tools = parts.filter((part) => part.type === "tool-call" || part.type === "tool-result")
  if (!tools.length) return null

  return (
    <div className="mt-2 space-y-1 border-t border-[var(--border)] pt-2">
      {tools.map((tool, index) => (
        <div key={`${tool.tool ?? "tool"}-${index}`} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <span aria-hidden="true">{tool.state === "completed" ? "✓" : "•"}</span>
          <span>{label(tool.tool ?? "tool")}</span>
        </div>
      ))}
    </div>
  )
}

function label(tool: string) {
  const names: Record<string, string> = {
    read: "Read project file",
    write: "Created project file",
    edit: "Updated project file",
    glob: "Inspected project structure",
    grep: "Searched project",
    skill: "Used specialist skill",
    task: "Delegated specialist work",
  }
  return names[tool] ?? tool
}
