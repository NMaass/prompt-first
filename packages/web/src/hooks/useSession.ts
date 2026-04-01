import { useState, useCallback, useRef, useEffect } from "react"
import { client } from "@/api/client"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  parts?: Part[]
}

export interface Part {
  type: string
  text?: string
  tool?: string
  args?: Record<string, unknown>
  state?: string
  output?: string
}

interface SessionState {
  id: string | null
  messages: Message[]
  loading: boolean
  streaming: boolean
}

export function useSession() {
  const [state, setState] = useState<SessionState>({
    id: null,
    messages: [],
    loading: false,
    streaming: false,
  })
  const eventSource = useRef<EventSource | null>(null)

  const createSession = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }))
    try {
      const result = await client.session.create()
      const session = result.data as any
      if (session?.id) {
        setState((s) => ({ ...s, id: session.id, loading: false }))
        connectEvents(session.id)
        return session.id
      }
    } catch (err) {
      console.error("Failed to create session:", err)
    }
    setState((s) => ({ ...s, loading: false }))
    return null
  }, [])

  const connectEvents = useCallback((sessionId: string) => {
    if (eventSource.current) {
      eventSource.current.close()
    }

    const es = new EventSource(`/event?directory=${encodeURIComponent(process.cwd?.() || ".")}`)
    eventSource.current = es

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleEvent(data, sessionId)
      } catch {
        // Skip non-JSON events
      }
    }

    es.onerror = () => {
      // Reconnect after delay
      setTimeout(() => {
        if (eventSource.current === es) {
          connectEvents(sessionId)
        }
      }, 3000)
    }
  }, [])

  const handleEvent = useCallback((event: any, sessionId: string) => {
    const type = event.type

    if (type === "message.updated" || type === "message.created") {
      const msg = event.properties
      if (msg?.sessionID !== sessionId) return

      setState((s) => {
        const existing = s.messages.findIndex((m) => m.id === msg.id)
        const message: Message = {
          id: msg.id,
          role: msg.role || "assistant",
          content: "",
          timestamp: Date.now(),
          parts: msg.parts || [],
        }

        if (existing >= 0) {
          const updated = [...s.messages]
          updated[existing] = message
          return { ...s, messages: updated }
        }
        return { ...s, messages: [...s.messages, message] }
      })
    }

    if (type === "message.part.updated" || type === "message.part.added") {
      const part = event.properties
      if (!part) return

      setState((s) => {
        const msgIdx = s.messages.findIndex((m) => m.id === part.messageID)
        if (msgIdx < 0) return s

        const updated = [...s.messages]
        const msg = { ...updated[msgIdx]! }
        const parts = [...(msg.parts || [])]

        const partIdx = parts.findIndex((p: any) => p.id === part.id)
        if (partIdx >= 0) {
          parts[partIdx] = part
        } else {
          parts.push(part)
        }

        // Build content from text parts
        msg.parts = parts
        msg.content = parts
          .filter((p) => p.type === "text")
          .map((p) => p.text || "")
          .join("")

        updated[msgIdx] = msg
        return { ...s, messages: updated, streaming: part.state === "pending" || part.state === "running" }
      })
    }
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!state.id || !text.trim()) return

      // Add user message immediately
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: Date.now(),
      }
      setState((s) => ({ ...s, messages: [...s.messages, userMsg], streaming: true }))

      try {
        await client.session.prompt({
          sessionID: state.id,
          parts: [{ type: "text", text }],
        })
      } catch (err) {
        console.error("Failed to send message:", err)
        setState((s) => ({ ...s, streaming: false }))
      }
    },
    [state.id],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      eventSource.current?.close()
    }
  }, [])

  return {
    session: state,
    createSession,
    sendMessage,
  }
}
