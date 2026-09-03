import { useState } from "react"
import type { LearningNote } from "@/studio/types"

export function LearningTray({ notes }: { notes: LearningNote[] }) {
  const [open, setOpen] = useState(false)
  const note = notes.at(-1)
  const video = note?.videoKey ? tutorialUrl(note.videoKey) : undefined

  return (
    <div className="relative h-10 shrink-0 border-b border-[var(--border)] bg-[var(--surface-subtle)]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={!note}
        aria-expanded={open}
        className="flex h-10 w-full items-center justify-between gap-3 px-4 text-left text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text)] disabled:cursor-default"
      >
        <span className="font-semibold uppercase tracking-wide">Learning lens</span>
        <span className="truncate">{note?.title || "Context appears when a product concept becomes relevant"}</span>
      </button>
      {open && note ? (
        <aside className="absolute left-3 right-3 top-full z-30 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-4 shadow-2xl" aria-label="Just-in-time learning note">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">{note.concept}</div>
          <h2 className="mt-2 text-sm font-semibold text-[var(--text)]">{note.title}</h2>
          <p className="mt-2 text-sm leading-5 text-[var(--text-muted)]">{note.explanation}</p>
          <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-xs leading-5 text-[var(--text-muted)]">
            <strong className="text-[var(--text)]">Why now:</strong> {note.whyNow}
          </div>
          {video ? (
            <a href={video} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-9 items-center rounded-md border border-[var(--border)] px-3 text-xs font-semibold text-[var(--text)] transition-colors hover:border-[var(--accent)]">
              Open tutorial video
            </a>
          ) : null}
        </aside>
      ) : null}
    </div>
  )
}

function tutorialUrl(key: string) {
  const urls: Record<string, string | undefined> = {
    requirements: import.meta.env.VITE_TUTORIAL_REQUIREMENTS_URL,
    responsive: import.meta.env.VITE_TUTORIAL_RESPONSIVE_URL,
    accessibility: import.meta.env.VITE_TUTORIAL_ACCESSIBILITY_URL,
    consequences: import.meta.env.VITE_TUTORIAL_CONSEQUENCES_URL,
    performance: import.meta.env.VITE_TUTORIAL_PERFORMANCE_URL,
    evidence: import.meta.env.VITE_TUTORIAL_EVIDENCE_URL,
  }
  return urls[key]
}
