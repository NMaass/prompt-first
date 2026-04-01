import { useState } from "react"

type Tab = "preview" | "spec" | "blocks" | "guide"

export function OutputPanel() {
  const [tab, setTab] = useState<Tab>("preview")

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-[var(--border)] bg-[var(--surface)]">
        {(["preview", "spec", "blocks", "guide"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wide transition-colors ${
              tab === t
                ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {tab === "preview" && <PreviewTab />}
        {tab === "spec" && <SpecTab />}
        {tab === "blocks" && <BlocksTab />}
        {tab === "guide" && <GuideTab />}
      </div>
    </div>
  )
}

function PreviewTab() {
  return (
    <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
      {/* Phone frame */}
      <div className="w-[375px] h-[667px] bg-white rounded-[2.5rem] border-4 border-[#333] shadow-2xl overflow-hidden relative">
        {/* Status bar */}
        <div className="h-11 bg-white flex items-center justify-center">
          <div className="w-20 h-5 bg-black rounded-full" />
        </div>
        {/* App content area */}
        <div className="h-[calc(100%-2.75rem)] overflow-auto">
          <div className="flex items-center justify-center h-full text-gray-400 text-sm px-8 text-center">
            Your app will appear here once the builder starts creating it.
          </div>
        </div>
      </div>
    </div>
  )
}

function SpecTab() {
  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="text-[var(--text-muted)] text-sm text-center mt-20">
        The product specification will appear here once you describe your idea
        and the builder drafts it.
      </div>
    </div>
  )
}

function BlocksTab() {
  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="text-[var(--text-muted)] text-sm text-center mt-20">
        The visual block editor will appear here once the builder starts
        creating your app.
      </div>
    </div>
  )
}

function GuideTab() {
  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="max-w-lg mx-auto">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Getting Started</h2>

        <div className="space-y-4 text-sm text-[var(--text-muted)] leading-relaxed">
          <p>
            Welcome to Product Studio. You're going to build a real software
            product by describing what you want and guiding an AI builder.
          </p>

          <h3 className="text-[var(--text)] font-medium mt-6">How it works</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong className="text-[var(--text)]">Describe your idea</strong> — Tell the builder what
              you want to create and who it's for.
            </li>
            <li>
              <strong className="text-[var(--text)]">Review the spec</strong> — The builder will draft a
              product specification. Make sure it matches your vision.
            </li>
            <li>
              <strong className="text-[var(--text)]">Approve the plan</strong> — The builder will propose a
              step-by-step plan. Check that it covers everything.
            </li>
            <li>
              <strong className="text-[var(--text)]">Watch it build</strong> — See your app take shape in
              the preview panel.
            </li>
            <li>
              <strong className="text-[var(--text)]">Test and improve</strong> — Try the app, find issues,
              and describe what should change.
            </li>
          </ol>

          <h3 className="text-[var(--text)] font-medium mt-6">Tips for good prompts</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Be specific about who will use it</li>
            <li>Describe the main features</li>
            <li>Mention how it should feel (calm, energetic, professional)</li>
            <li>Say what it should NOT do</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
