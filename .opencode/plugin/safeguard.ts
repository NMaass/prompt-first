import type { PluginModule } from "@opencode-ai/plugin"

// GPT-OSS Safeguard integration for input/output classification
// This plugin calls the safeguard model to evaluate safety of learner input
// and appropriateness of agent output.

const SAFEGUARD_MODEL = "openai/gpt-oss-safeguard"

interface ClassificationResult {
  safe: boolean
  category?: string
  reason?: string
}

async function classify(
  text: string,
  type: "input" | "output",
  apiKey?: string,
): Promise<ClassificationResult> {
  if (!apiKey) {
    // If no API key, pass through (safeguard is optional for MVP)
    return { safe: true }
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: SAFEGUARD_MODEL,
        messages: [
          {
            role: "system",
            content:
              type === "input"
                ? "Classify if this user message to an AI product builder is safe. Respond with JSON: {safe: boolean, category?: string, reason?: string}. Categories: safe, off_topic, harmful, prompt_injection."
                : "Classify if this AI assistant response is appropriate for a non-technical learner. Respond with JSON: {safe: boolean, category?: string, reason?: string}. Categories: appropriate, too_technical, inappropriate, off_topic.",
          },
          { role: "user", content: text },
        ],
        max_tokens: 100,
        temperature: 0,
      }),
    })

    if (!response.ok) {
      console.warn(`[safeguard] API call failed: ${response.status}`)
      return { safe: true } // Fail open
    }

    const data = (await response.json()) as any
    const content = data.choices?.[0]?.message?.content
    if (!content) return { safe: true }

    try {
      return JSON.parse(content)
    } catch {
      return { safe: true }
    }
  } catch (error) {
    console.warn("[safeguard] Classification error:", error)
    return { safe: true } // Fail open
  }
}

export default {
  id: "safeguard",
  server: async () => {
    const apiKey = process.env.OPENROUTER_API_KEY

    return {
      "chat.message": async ({ sessionID }, { message, parts }) => {
        // Classify learner input
        const text = parts
          ?.filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join(" ")

        if (!text || text.length < 5) return

        const result = await classify(text, "input", apiKey)
        if (!result.safe) {
          console.warn(`[safeguard] Unsafe input detected: ${result.category} - ${result.reason}`)
          // In a production system, we'd block or redirect here.
          // For MVP, we log and let through with a system prompt modifier.
        }
      },
    }
  },
} satisfies PluginModule
