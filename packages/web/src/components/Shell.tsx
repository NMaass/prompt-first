import { useEffect, useMemo, useRef, useState } from "react"
import { approveEffect, createWorkspace, destroyWorkspace, executeEffect, registerEffect } from "@/api/studio"
import { ChatPanel } from "@/components/ChatPanel"
import { EffectQueue, type EffectView } from "@/components/EffectQueue"
import { MissionLauncher } from "@/components/MissionLauncher"
import { OutputPanel } from "@/components/OutputPanel"
import { useSession } from "@/hooks/useSession"
import { deriveStudioState } from "@/studio/state"
import type { EffectReceipt, HostEffect, Mission, Workspace } from "@/studio/types"

export function Shell() {
  const { session, start, send, stop, reset } = useSession()
  const [mission, setMission] = useState<Mission | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  const [registered, setRegistered] = useState<Record<string, HostEffect>>({})
  const [receipts, setReceipts] = useState<Record<string, EffectReceipt>>({})
  const [effectErrors, setEffectErrors] = useState<Record<string, string>>({})
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set())
  const registering = useRef(new Set<string>())

  const studio = useMemo(() => (mission ? deriveStudioState(session.messages, mission) : null), [mission, session.messages])

  useEffect(() => {
    if (!workspace || !studio) return
    for (const effect of studio.effects) {
      if (registered[effect.callId] || registering.current.has(effect.callId)) continue
      registering.current.add(effect.callId)
      void registerEffect(workspace.id, effect)
        .then(async (host) => {
          setRegistered((value) => ({ ...value, [effect.callId]: host }))
          if (effect.mode !== "mock") return
          const receipt = await executeEffect(host.id, effect.callId)
          setReceipts((value) => ({ ...value, [host.id]: receipt }))
        })
        .catch((error: unknown) => {
          setEffectErrors((value) => ({ ...value, [effect.callId]: error instanceof Error ? error.message : "Effect failed" }))
        })
    }
  }, [workspace, studio, registered])

  const begin = async (selected: Mission) => {
    let next: Workspace | null = null
    setStarting(true)
    setStartError(null)
    try {
      next = await createWorkspace(selected)
      setMission(selected)
      setWorkspace(next)
      const prompt = buildPrompt(selected)
      const id = await start({ directory: next.directory, title: selected.title, prompt })
      if (!id) throw new Error("The builder session could not start")
    } catch (error) {
      if (next) await destroyWorkspace(next.id).catch(() => undefined)
      reset()
      setStartError(error instanceof Error ? error.message : "Mission could not start")
      setMission(null)
      setWorkspace(null)
    } finally {
      setStarting(false)
    }
  }

  const end = async () => {
    await stop().catch(() => undefined)
    if (workspace) await destroyWorkspace(workspace.id).catch(() => undefined)
    reset()
    setMission(null)
    setWorkspace(null)
    setRegistered({})
    setReceipts({})
    setEffectErrors({})
    setDismissed(new Set())
    registering.current.clear()
  }

  const approve = async (view: EffectView) => {
    if (!view.host) return
    try {
      const approval = await approveEffect(view.host.id)
      const receipt = await executeEffect(view.host.id, view.draft.callId, approval.token)
      setReceipts((value) => ({ ...value, [view.host!.id]: receipt }))
    } catch (error) {
      setEffectErrors((value) => ({ ...value, [view.draft.callId]: error instanceof Error ? error.message : "Live effect failed" }))
    }
  }

  const effectViews: EffectView[] = studio?.effects.map((draft) => {
    const host = registered[draft.callId]
    return {
      draft,
      host,
      receipt: host ? receipts[host.id] : undefined,
      error: effectErrors[draft.callId],
      dismissed: dismissed.has(draft.callId),
    }
  }) ?? []

  if (!mission || !workspace || !studio) {
    return (
      <>
        <MissionLauncher onStart={begin} starting={starting} />
        {startError ? <div role="alert" className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-[var(--danger)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--danger-text)] shadow-xl">{startError}</div> : null}
      </>
    )
  }

  return (
    <main className="grid h-dvh min-h-0 grid-rows-[minmax(300px,45%)_1fr] bg-[var(--bg)] lg:grid-cols-[minmax(320px,34%)_1fr] lg:grid-rows-1">
      <div className="flex min-h-0 flex-col">
        <ChatPanel messages={session.messages} learning={studio.learning} streaming={session.streaming} error={session.error} onSend={send} onStop={stop} onEnd={end} />
        <EffectQueue
          effects={effectViews}
          onApprove={approve}
          onDismiss={(callId) => setDismissed((value) => new Set(value).add(callId))}
        />
      </div>
      <OutputPanel contract={studio.contract} map={studio.map} evidence={studio.evidence} previewUrl={studio.previewUrl} receipts={Object.values(receipts)} />
    </main>
  )
}

function buildPrompt(mission: Mission) {
  const acceptance = mission.acceptance.map((item, index) => `A${index + 1}: ${item}`).join("\n")
  const quality = mission.quality.map((item, index) => `Q${index + 1}: ${item}`).join("\n")
  return `${mission.starter}\n\nEvidence IDs for this mission:\n${acceptance}\n${quality}\n\nPublish the Mission Contract and Product Map early. Get a useful preview running quickly. Use these IDs when recording evidence. Do not wait for plan approval before reversible work.`
}
