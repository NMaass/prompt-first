import { useState } from "react"
import type { EffectReceipt, Evidence, MissionContract, ProductMap } from "@/studio/types"

type Tab = "preview" | "contract" | "map" | "evidence"
type Viewport = "desktop" | "tablet" | "mobile"

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "preview", label: "Preview" },
  { id: "contract", label: "Mission Contract" },
  { id: "map", label: "Product Map" },
  { id: "evidence", label: "Evidence" },
]

export function OutputPanel(input: {
  contract: MissionContract
  map: ProductMap
  evidence: Evidence[]
  previewUrl: string | null
  receipts: EffectReceipt[]
}) {
  const [tab, setTab] = useState<Tab>("preview")

  return (
    <section className="flex min-h-0 min-w-0 flex-col bg-[var(--workspace)]" aria-label="Product workspace">
      <div className="flex min-h-12 shrink-0 overflow-x-auto border-b border-[var(--border)] bg-[var(--surface)]" role="tablist" aria-label="Product artifacts">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`min-w-32 shrink-0 border-b-2 px-4 text-xs font-semibold uppercase tracking-wide transition-colors ${tab === item.id ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        {tab === "preview" ? <Preview url={input.previewUrl} /> : null}
        {tab === "contract" ? <Contract contract={input.contract} /> : null}
        {tab === "map" ? <MapView map={input.map} /> : null}
        {tab === "evidence" ? <EvidenceView evidence={input.evidence} receipts={input.receipts} /> : null}
      </div>
    </section>
  )
}

function Preview({ url }: { url: string | null }) {
  const [viewport, setViewport] = useState<Viewport>("desktop")
  const width = viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "390px"

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-11 shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-subtle)] px-3">
        <div className="text-xs text-[var(--text-muted)]">{url ? "Live sandbox preview" : "Waiting for the builder to publish a preview"}</div>
        <div className="grid grid-cols-3 rounded-lg border border-[var(--border)]" aria-label="Preview size">
          {(["desktop", "tablet", "mobile"] as Viewport[]).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={viewport === item}
              onClick={() => setViewport(item)}
              className={`min-h-8 min-w-16 px-2 text-[11px] font-medium capitalize transition-colors ${viewport === item ? "bg-[var(--surface-hover)] text-[var(--text)]" : "text-[var(--text-muted)]"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-[#111] p-4">
        <div className="mx-auto h-full overflow-hidden preview-frame rounded-xl border border-[#343434] bg-white shadow-2xl" style={{ width, maxWidth: "100%" }}>
          {url ? (
            <iframe
              title="Product preview"
              src={url}
              sandbox="allow-forms allow-modals allow-scripts allow-same-origin"
              className="h-full w-full preview-frame border-0 bg-white"
            />
          ) : (
            <div className="grid h-full place-items-center preview-frame px-8 text-center text-sm text-gray-500">
              The builder can edit the product immediately. This reserved frame will be replaced in place when the preview server is ready.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Contract({ contract }: { contract: MissionContract }) {
  return (
    <div className="h-full overflow-y-auto p-5 sm:p-7">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Mission Contract</div>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">{contract.title}</h2>
        </header>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card title="User" items={[contract.user]} />
          <Card title="Problem" items={[contract.problem]} />
          <Card title="Desired outcome" items={[contract.outcome]} />
        </div>
        <Card title="Acceptance criteria" items={contract.acceptance} numbered />
        <Card title="Quality requirements" items={contract.quality} />
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Constraints" items={contract.constraints} empty="No explicit constraints yet." />
          <Card title="Consequences" items={contract.consequences} empty="No consequential actions identified yet." />
          <Card title="Assumptions" items={contract.assumptions} empty="No active assumptions." />
          <Card title="Unresolved decisions" items={contract.unresolved} empty="No unresolved product decisions." />
        </div>
      </div>
    </div>
  )
}

function MapView({ map }: { map: ProductMap }) {
  const groups = [
    ["Actors", map.actors],
    ["Surfaces", map.surfaces],
    ["Data", map.data],
    ["Integrations", map.integrations],
    ["Critical flows", map.flows],
    ["Permissions", map.permissions],
  ] as const
  return (
    <div className="h-full overflow-y-auto p-5 sm:p-7">
      <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map(([title, items]) => <Card key={title} title={title} items={items} empty="The builder has not mapped this yet." />)}
      </div>
    </div>
  )
}

function EvidenceView({ evidence, receipts }: { evidence: Evidence[]; receipts: EffectReceipt[] }) {
  const passed = evidence.filter((item) => item.status === "passed").length
  return (
    <div className="h-full overflow-y-auto p-5 sm:p-7">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Evidence Ledger</div>
            <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">{passed} of {evidence.length} requirements proven</h2>
          </div>
          <div className="text-xs text-[var(--text-muted)]">Unverified is an explicit state, not a failure to render.</div>
        </div>
        <div className="mt-5 space-y-3">
          {evidence.map((item) => (
            <article key={item.requirementId} className="grid min-h-24 gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-[7rem_1fr]">
              <div>
                <div className="text-xs font-semibold text-[var(--text-muted)]">{item.requirementId}</div>
                <Status status={item.status} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text)]">{item.requirement}</h3>
                <div className="mt-1 text-xs font-medium text-[var(--text-muted)]">{item.method}</div>
                <p className="mt-2 text-sm leading-5 text-[var(--text-muted)]">{item.detail}</p>
                {item.receipt ? <div className="mt-2 font-mono text-[10px] text-[var(--text-subtle)]">receipt {item.receipt}</div> : null}
              </div>
            </article>
          ))}
        </div>
        {receipts.length ? (
          <section className="mt-8" aria-labelledby="effect-receipts-heading">
            <h2 id="effect-receipts-heading" className="text-sm font-semibold text-[var(--text)]">External effect receipts</h2>
            <div className="mt-3 space-y-2">
              {receipts.map((receipt) => (
                <div key={receipt.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
                  <div className="font-medium text-[var(--text)]">{receipt.summary}</div>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">{receipt.mode} · {receipt.kind} · {receipt.status} · receipt {receipt.id}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}

function Card({ title, items, empty, numbered }: { title: string; items: string[]; empty?: string; numbered?: boolean }) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{title}</h3>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-5 text-[var(--text)]">
          {items.map((item, index) => <li key={`${index}-${item}`}>{numbered ? `${index + 1}. ` : ""}{item}</li>)}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-5 text-[var(--text-subtle)]">{empty}</p>
      )}
    </section>
  )
}

function Status({ status }: { status: Evidence["status"] }) {
  return <div className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide status-${status}`}>{status}</div>
}
