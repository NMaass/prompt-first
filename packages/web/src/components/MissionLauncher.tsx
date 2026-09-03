import { useState } from "react"
import { customMission, missions } from "@/studio/missions"
import type { Mission } from "@/studio/types"

export function MissionLauncher({ onStart, starting }: { onStart: (mission: Mission) => void; starting: boolean }) {
  const [idea, setIdea] = useState("")

  return (
    <main className="min-h-dvh overflow-y-auto bg-[var(--bg)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Prompt First</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
            Build software by directing the product, not typing the implementation.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-muted)]">
            The builder starts coding autonomously. You own what the product should do, what quality means, which consequences are acceptable, and whether the evidence is good enough to ship.
          </p>
        </header>

        <section className="mt-10" aria-labelledby="guided-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="guided-heading" className="text-lg font-semibold text-[var(--text)]">Guided missions</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Each mission adds a more consequential product-engineering problem.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {missions.map((mission) => (
              <article key={mission.id} className="flex min-h-64 flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">Mission {mission.level}</div>
                <h3 className="mt-2 text-lg font-semibold text-[var(--text)]">{mission.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-[var(--text-muted)]">{mission.summary}</p>
                <div className="mt-5 text-xs text-[var(--text-subtle)]">Practice: {mission.learning.join(" · ")}</div>
                <button
                  type="button"
                  onClick={() => onStart(mission)}
                  disabled={starting}
                  className="mt-5 min-h-11 rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-wait disabled:opacity-50"
                >
                  Start mission
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5" aria-labelledby="custom-heading">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 id="custom-heading" className="text-lg font-semibold text-[var(--text)]">Build your own</h2>
              <label htmlFor="custom-idea" className="mt-2 block text-sm text-[var(--text-muted)]">
                Describe the product you want. The agent can begin with assumptions and surface important decisions as they become consequential.
              </label>
              <textarea
                id="custom-idea"
                value={idea}
                onChange={(event) => setIdea(event.target.value)}
                rows={3}
                placeholder="A simple tool for..."
                className="mt-3 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm leading-6 text-[var(--text)] outline-none placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)]"
              />
            </div>
            <button
              type="button"
              onClick={() => onStart(customMission(idea.trim()))}
              disabled={starting || idea.trim().length < 12}
              className="min-h-11 min-w-36 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-hover)] px-4 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Start building
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
