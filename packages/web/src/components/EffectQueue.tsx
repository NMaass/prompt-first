import { useState } from "react"
import type { EffectDraft, EffectReceipt, HostEffect } from "@/studio/types"

export type EffectView = {
  draft: EffectDraft
  host?: HostEffect
  receipt?: EffectReceipt
  error?: string
  dismissed?: boolean
}

export function EffectQueue(input: {
  effects: EffectView[]
  onApprove: (effect: EffectView) => void
  onDismiss: (callId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const pending = input.effects.filter((item) => item.draft.mode === "live" && !item.receipt && !item.dismissed).length

  return (
    <section className="relative h-11 shrink-0 border-t border-[var(--border)] bg-[var(--surface)]" aria-label="External effects">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={!input.effects.length}
        aria-expanded={open}
        className="flex h-11 w-full items-center justify-between px-4 text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)] disabled:cursor-default disabled:opacity-60"
      >
        <span>External effects</span>
        <span>{pending ? `${pending} approval${pending === 1 ? "" : "s"} required` : `${input.effects.length} receipt${input.effects.length === 1 ? "" : "s"}`}</span>
      </button>

      {open && input.effects.length ? (
        <div className="absolute bottom-full left-3 right-3 z-30 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-3 shadow-2xl">
          {input.effects.map((item) => (
            <article key={item.draft.callId} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-[var(--text)]">{item.draft.summary}</div>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">{item.draft.kind} · {item.draft.mode} · {item.draft.destination}</div>
                </div>
                <Status item={item} />
              </div>
              {item.error ? <div className="mt-2 text-xs text-[var(--danger-text)]">{item.error}</div> : null}
              {item.draft.mode === "live" && item.host && !item.receipt && !item.dismissed ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => input.onDismiss(item.draft.callId)} className="min-h-9 rounded-md border border-[var(--border)] text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]">
                    Do not execute
                  </button>
                  <button type="button" onClick={() => input.onApprove(item)} className="min-h-9 rounded-md bg-[var(--danger)] px-2 text-xs font-semibold text-white transition-colors hover:brightness-110">
                    Approve live effect
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function Status({ item }: { item: EffectView }) {
  const label = item.dismissed
    ? "Not executed"
    : item.receipt
      ? item.receipt.status === "succeeded"
        ? item.receipt.mode === "mock" ? "Simulated" : "Executed"
        : "Failed"
      : item.host
        ? item.draft.mode === "live" ? "Approval required" : "Running"
        : "Registering"
  return <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
}
