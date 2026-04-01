import type { PluginModule } from "@opencode-ai/plugin"

// Map of technical terms to plain language equivalents
const REPLACEMENTS: [RegExp, string][] = [
  [/\bfunction\b/gi, "feature"],
  [/\bvariable\b/gi, "setting"],
  [/\bcomponent\b/gi, "section"],
  [/\bstate\b(?!\s+of)/gi, "data"],
  [/\bhandler\b/gi, "action"],
  [/\bcallback\b/gi, "response"],
  [/\bAPI\b/g, "connection"],
  [/\bendpoint\b/gi, "connection point"],
  [/\bDOM\b/g, "page structure"],
  [/\bCSS\b/g, "styling"],
  [/\bHTML\b/g, "page layout"],
  [/\bJSON\b/g, "data format"],
  [/\barray\b/gi, "list"],
  [/\bobject\b(?!\s+of)/gi, "item"],
  [/\bstring\b/gi, "text"],
  [/\bboolean\b/gi, "yes/no value"],
  [/\binteger\b/gi, "number"],
  [/\bparameter\b/gi, "input"],
  [/\bargument\b/gi, "input"],
  [/\breturn value\b/gi, "result"],
  [/\brender\b/gi, "display"],
  [/\bre-render\b/gi, "update the display"],
  [/\bparse\b/gi, "read"],
  [/\bserialize\b/gi, "save"],
  [/\bdeserialize\b/gi, "load"],
  [/\bmutate\b/gi, "change"],
  [/\bmutation\b/gi, "change"],
  [/\biterate\b/gi, "go through"],
  [/\binstantiate\b/gi, "create"],
  [/\binitialize\b/gi, "set up"],
  [/\bpropagat(e|ion)\b/gi, "spread"],
  [/\brefactor\b/gi, "reorganize"],
  [/\bdebug\b/gi, "fix"],
  [/\bdeployed?\b/gi, "published"],
  [/\brepository\b/gi, "project"],
  [/\bbranch\b(?!.*tree)/gi, "version"],
  [/\bcommit\b/gi, "save point"],
]

// Detect code blocks and technical content
function containsCode(text: string): boolean {
  return (
    /```[\s\S]*?```/.test(text) ||
    /`[^`]+`/.test(text) ||
    /\b(const|let|var|function|class|import|export|return)\s/.test(text) ||
    /[{}\[\]];?\s*$/.test(text) ||
    /\w+\.\w+\(/.test(text)
  )
}

function simplifyText(text: string): string {
  // Don't modify code blocks — wrap them in a collapsible instead
  let result = text.replace(/```[\s\S]*?```/g, (match) => {
    return `\n<details><summary>Technical details (you can ignore this)</summary>\n\n${match}\n\n</details>\n`
  })

  // Replace inline code references
  result = result.replace(/`([^`]+)`/g, (_, code) => {
    // If it looks like a file path, simplify
    if (code.includes("/") || code.includes(".")) return `"${code}"`
    // Otherwise just remove the backticks
    return code
  })

  // Apply term replacements
  for (const [pattern, replacement] of REPLACEMENTS) {
    result = result.replace(pattern, replacement)
  }

  return result
}

export default {
  id: "output-simplifier",
  server: async () => {
    return {
      "experimental.text.complete": async ({ sessionID }, { text }) => {
        // Simplify the agent's final text output
        if (containsCode(text)) {
          text = simplifyText(text)
        }
      },

      "tool.execute.after": async ({ tool, sessionID }, output) => {
        // Simplify tool output that the agent will relay to the user
        if (output.output && containsCode(output.output)) {
          // Don't simplify raw file content the agent reads internally
          if (tool === "read" || tool === "glob" || tool === "grep") return
          output.output = simplifyText(output.output)
        }
      },
    }
  },
} satisfies PluginModule
