import { useState, useRef, useEffect } from "react"
import type { Message } from "@/hooks/useSession"

interface ChatPanelProps {
  messages: Message[]
  streaming: boolean
  onSend: (text: string) => void
}

export function ChatPanel({ messages, streaming, onSend }: ChatPanelProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || streaming) return
    onSend(input.trim())
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full border-r border-[var(--border)]">
      {/* Coaching bar */}
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="text-xs text-[var(--accent)] font-medium uppercase tracking-wide">
          {messages.length === 0 ? "Getting Started" : "Building"}
        </div>
        <div className="text-xs text-[var(--text-muted)] mt-1">
          {messages.length === 0
            ? "Describe what you want to build. Be specific about who will use it and what problem it solves."
            : streaming
              ? "The builder is working..."
              : "Review the output, then describe what to change or improve."}
        </div>
      </div>

      {/* Message timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="text-lg font-medium text-[var(--text)] mb-2">Product Studio</div>
            <div className="text-sm text-[var(--text-muted)] max-w-xs">
              Describe the product you want to build. The AI will help you create it step by step.
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {streaming && (
          <div className="flex gap-1 px-3 py-2">
            <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              messages.length === 0
                ? "Describe what you want to build..."
                : "What should change or improve?"
            }
            disabled={streaming}
            rows={2}
            className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] resize-none focus:outline-none focus:border-[var(--accent)] disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || streaming}
            className="self-end px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-[var(--accent)] text-white rounded-br-sm"
            : "bg-[var(--surface)] text-[var(--text)] rounded-bl-sm border border-[var(--border)]"
        }`}
      >
        {message.content || (
          <span className="text-[var(--text-muted)] italic">Working...</span>
        )}
        {/* Show tool activity for assistant messages */}
        {!isUser && message.parts && message.parts.length > 0 && (
          <ToolActivity parts={message.parts} />
        )}
      </div>
    </div>
  )
}

function ToolActivity({ parts }: { parts: any[] }) {
  const tools = parts.filter((p) => p.type === "tool-call" || p.type === "tool-result")
  if (tools.length === 0) return null

  return (
    <div className="mt-2 pt-2 border-t border-[var(--border)] space-y-1">
      {tools.map((tool, i) => (
        <div key={i} className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
          <span className={tool.state === "completed" ? "text-[var(--success)]" : "text-[var(--warning)]"}>
            {tool.state === "completed" ? "+" : "~"}
          </span>
          <span>{simplifyToolName(tool.tool || tool.toolName || "")}</span>
        </div>
      ))}
    </div>
  )
}

function simplifyToolName(tool: string): string {
  const map: Record<string, string> = {
    read: "Reading file",
    write: "Creating file",
    edit: "Updating file",
    glob: "Finding files",
    grep: "Searching",
    skill: "Loading guide",
    task: "Delegating task",
  }
  return map[tool] || tool
}
