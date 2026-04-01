import { useEffect } from "react"
import { useSession } from "@/hooks/useSession"
import { ChatPanel } from "@/components/console/ChatPanel"
import { OutputPanel } from "@/components/output/OutputPanel"

export function Shell() {
  const { session, createSession, sendMessage } = useSession()

  useEffect(() => {
    if (!session.id) {
      createSession()
    }
  }, [session.id, createSession])

  if (session.loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg)]">
        <div className="text-[var(--text-muted)] text-sm">Starting Product Studio...</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen grid grid-cols-[minmax(300px,30%)_1fr] bg-[var(--bg)]">
      <ChatPanel
        messages={session.messages}
        streaming={session.streaming}
        onSend={sendMessage}
      />
      <OutputPanel />
    </div>
  )
}
