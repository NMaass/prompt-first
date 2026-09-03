import { useState } from "react"

type Tab = "preview" | "contract" | "map" | "evidence"

const tabs: { id: Tab; label: string }[] = [
  { id: "preview", label: "Preview" },
  { id: "contract", label: "Mission Contract" },
  { id: "map", label: "Product Map" },
  { id: "evidence", label: "Evidence" },
]

export function OutputPanel() {
  const [tab, setTab] = useState<Tab>("preview")

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-[var(--border)] bg-[var(--surface)]" role="tablist" aria-label="Product workspace">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`min-h-11 px-4 text-xs font-medium transition-colors ${
              tab === item.id
                ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === "preview" && <PreviewTab />}
        {tab === "contract" && <EmptyArtifact title="Mission Contract" description="Your users, outcome, acceptance criteria, quality requirements, constraints, consequences, and unresolved decisions will live here." />}
        {tab === "map" && <EmptyArtifact title="Product Map" description="Screens, actors, data, integrations, permissions, critical flows, and consequential actions will be mapped here." />}
        {tab === "evidence" && <EmptyArtifact title="Evidence Ledger" description="Requirements will be marked proven, failed, inferred, or unverified and linked to browser runs, tests, screenshots, and other receipts." />}
      </div>
    </div>
  )
}

function PreviewTab() {
  return (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e] p-6">
      <div className="flex h-full max-h-[800px] w-full max-w-[1200px] items-center justify-center rounded-xl border border-[#333] bg-white shadow-2xl">
        <div className="max-w-md px-8 text-center text-sm text-gray-500">
          The live product preview will appear here as soon as the builder starts reversible implementation.
        </div>
      </div>
    </div>
  )
}

function EmptyArtifact({ title, description }: { title: string; description: string }) {
  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="mx-auto max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-base font-semibold text-[var(--text)]">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{description}</p>
      </div>
    </div>
  )
}
