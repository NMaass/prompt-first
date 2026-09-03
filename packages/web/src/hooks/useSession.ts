import type { Event, Part } from "@opencode-ai/sdk"
import { useCallback, useEffect, useRef, useState } from "react"
import { client, model } from "@/api/client"

export type TimelineMessage = {
  id: string
  role: "user" | "assistant"
  createdAt: number
  parts: Part[]
}

type SessionState = {
  id: string | null
  directory: string | null
  messages: TimelineMessage[]
  loading: boolean
  streaming: boolean
  error: string | null
}

const empty: SessionState = {
  id: null,
  directory: null,
  messages: [],
  loading: false,
  streaming: false,
  error: null,
}

export function useSession() {
  const [state, setState] = useState<SessionState>(empty)
  const stream = useRef<AbortController | null>(null)
  const current = useRef<{ id: string; directory: string } | null>(null)

  const consume = useCallback(async (directory: string, controller: AbortController) => {
    try {
      const events = await client.event.subscribe({ query: { directory }, signal: controller.signal })
      for await (const event of events.stream) {
        handleEvent(event, setState, current.current?.id)
      }
    } catch (error) {
      if (controller.signal.aborted) return
      setState((value) => ({ ...value, error: message(error), streaming: false }))
    }
  }, [])

  const start = useCallback(
    async (input: { directory: string; title: string; prompt: string }) => {
      stream.current?.abort()
      const controller = new AbortController()
      stream.current = controller
      current.current = null
      setState({ ...empty, directory: input.directory, loading: true })
      void consume(input.directory, controller)

      try {
        const created = await client.session.create({
          query: { directory: input.directory },
          body: { title: input.title },
        })
        if (!created.data) throw new Error("OpenCode did not return a session")
        const session = created.data
        current.current = { id: session.id, directory: input.directory }
        const messageID = crypto.randomUUID()
        const optimistic = userMessage(session.id, messageID, input.prompt)
        setState((value) => ({
          ...value,
          id: session.id,
          loading: false,
          streaming: true,
          messages: [optimistic],
        }))
        await client.session.promptAsync({
          path: { id: session.id },
          query: { directory: input.directory },
          body: {
            messageID,
            agent: "studio-builder",
            model: model(),
            parts: [{ type: "text", text: input.prompt }],
          },
        })
        return session.id
      } catch (error) {
        setState((value) => ({ ...value, loading: false, streaming: false, error: message(error) }))
        return null
      }
    },
    [consume],
  )

  const send = useCallback(async (text: string) => {
    const session = current.current
    if (!session || !text.trim()) return
    const messageID = crypto.randomUUID()
    setState((value) => ({
      ...value,
      streaming: true,
      error: null,
      messages: [...value.messages, userMessage(session.id, messageID, text.trim())],
    }))
    try {
      await client.session.promptAsync({
        path: { id: session.id },
        query: { directory: session.directory },
        body: {
          messageID,
          agent: "studio-builder",
          model: model(),
          parts: [{ type: "text", text: text.trim() }],
        },
      })
    } catch (error) {
      setState((value) => ({ ...value, streaming: false, error: message(error) }))
    }
  }, [])

  const stop = useCallback(async () => {
    const session = current.current
    if (!session) return
    try {
      await client.session.abort({ path: { id: session.id }, query: { directory: session.directory } })
    } finally {
      setState((value) => ({ ...value, streaming: false }))
    }
  }, [])

  const reset = useCallback(() => {
    stream.current?.abort()
    stream.current = null
    current.current = null
    setState(empty)
  }, [])

  useEffect(() => () => stream.current?.abort(), [])

  return { session: state, start, send, stop, reset }
}

function handleEvent(event: Event, setState: React.Dispatch<React.SetStateAction<SessionState>>, sessionID?: string) {
  if (event.type === "message.updated") {
    const info = event.properties.info
    if (sessionID && info.sessionID !== sessionID) return
    setState((value) => upsertMessage(value, info.id, info.role, info.time.created))
    return
  }

  if (event.type === "message.part.updated") {
    const part = event.properties.part
    if (sessionID && part.sessionID !== sessionID) return
    setState((value) => upsertPart(value, part))
    return
  }

  if (event.type === "session.status") {
    if (sessionID && event.properties.sessionID !== sessionID) return
    setState((value) => ({ ...value, streaming: event.properties.status.type === "busy" }))
    return
  }

  if (event.type === "session.idle") {
    if (sessionID && event.properties.sessionID !== sessionID) return
    setState((value) => ({ ...value, streaming: false }))
    return
  }

  if (event.type === "session.error") {
    if (sessionID && event.properties.sessionID && event.properties.sessionID !== sessionID) return
    const error = event.properties.error
    setState((value) => ({ ...value, streaming: false, error: eventError(error) }))
  }
}

function upsertMessage(state: SessionState, id: string, role: "user" | "assistant", createdAt: number) {
  const index = state.messages.findIndex((item) => item.id === id)
  if (index < 0) return { ...state, messages: [...state.messages, { id, role, createdAt, parts: [] }] }
  const messages = [...state.messages]
  messages[index] = { ...messages[index]!, role, createdAt }
  return { ...state, messages }
}

function upsertPart(state: SessionState, part: Part) {
  const index = state.messages.findIndex((item) => item.id === part.messageID)
  const messages = [...state.messages]
  const message = index < 0 ? { id: part.messageID, role: "assistant" as const, createdAt: Date.now(), parts: [] } : messages[index]!
  const parts = [...message.parts]
  const partIndex = parts.findIndex((item) => item.id === part.id)
  if (partIndex < 0) parts.push(part)
  else parts[partIndex] = part
  const next = { ...message, parts }
  if (index < 0) messages.push(next)
  else messages[index] = next
  return { ...state, messages }
}

function userMessage(sessionID: string, messageID: string, text: string): TimelineMessage {
  return {
    id: messageID,
    role: "user",
    createdAt: Date.now(),
    parts: [
      {
        id: crypto.randomUUID(),
        sessionID,
        messageID,
        type: "text",
        text,
      },
    ],
  }
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "Request failed"
}

function eventError(error: { data?: unknown } | undefined) {
  if (!error || !error.data || typeof error.data !== "object") return "The builder session failed"
  const data = error.data as Record<string, unknown>
  return typeof data.message === "string" ? data.message : "The builder session failed"
}
