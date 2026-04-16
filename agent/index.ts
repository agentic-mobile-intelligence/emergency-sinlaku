/**
 * emergency-sinlaku — Application Error Detection Agent
 *
 * A self-contained Claude-powered agent that scans the codebase for real
 * application errors: hooks violations, missing routes, unhandled async
 * errors, null-access bugs, security gaps, and more.
 *
 * Prerequisites:
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *
 * Run:
 *   bun run index.ts            # pretty-printed report
 *   bun run index.ts --json     # also writes report.json
 */

import Anthropic from "@anthropic-ai/sdk"
import * as fs from "fs"
import * as path from "path"
import { glob } from "glob"

// ── Config ────────────────────────────────────────────────────────────────────

const APP_ROOT = path.resolve(import.meta.dirname, "..")

const SOURCE_GLOBS = [
  "src/**/*.{ts,tsx}",
  "workers/**/*.js",
  "scripts/**/*.ts",
  "supabase/migrations/**/*.sql",
]

const IGNORE_GLOBS = [
  "**/node_modules/**",
  "**/dist/**",
  "**/.git/**",
]

const MODEL = "claude-sonnet-4-6"

// ── Types ─────────────────────────────────────────────────────────────────────

interface ErrorReport {
  file: string
  line?: number
  severity: "error" | "warning" | "info"
  category:
    | "hooks-violation"
    | "missing-route"
    | "unhandled-error"
    | "null-access"
    | "race-condition"
    | "security"
    | "logic-error"
    | "missing-validation"
    | "type-error"
  description: string
  suggestion: string
}

// ── Tools ─────────────────────────────────────────────────────────────────────

const tools: Anthropic.Tool[] = [
  {
    name: "report_error",
    description: "Record one application error found in the codebase.",
    input_schema: {
      type: "object" as const,
      properties: {
        file: {
          type: "string",
          description: "Relative file path (e.g. src/pages/IslandPage.tsx)",
        },
        line: {
          type: "number",
          description: "Approximate line number of the issue",
        },
        severity: {
          type: "string",
          enum: ["error", "warning", "info"],
          description:
            "'error' = definite bug; 'warning' = likely bug / risky pattern; 'info' = potential issue worth noting",
        },
        category: {
          type: "string",
          enum: [
            "hooks-violation",
            "missing-route",
            "unhandled-error",
            "null-access",
            "race-condition",
            "security",
            "logic-error",
            "missing-validation",
            "type-error",
          ],
        },
        description: {
          type: "string",
          description: "Precise description of the bug including what goes wrong at runtime.",
        },
        suggestion: {
          type: "string",
          description: "Concrete fix — what to change and how.",
        },
      },
      required: ["file", "severity", "category", "description", "suggestion"],
    },
  },
  {
    name: "analysis_complete",
    description: "Signal that the full analysis is done and no more errors will be reported.",
    input_schema: {
      type: "object" as const,
      properties: {
        summary: {
          type: "string",
          description: "One-paragraph summary of the most critical findings.",
        },
      },
      required: ["summary"],
    },
  },
]

// ── File collection ───────────────────────────────────────────────────────────

async function collectSourceFiles(): Promise<Record<string, string>> {
  const files: Record<string, string> = {}

  for (const pattern of SOURCE_GLOBS) {
    const matches = await glob(pattern, { cwd: APP_ROOT, ignore: IGNORE_GLOBS })
    for (const match of matches.sort()) {
      const fullPath = path.join(APP_ROOT, match)
      files[match] = fs.readFileSync(fullPath, "utf-8")
    }
  }

  return files
}

// ── Agent loop ────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert code reviewer specialising in React 18, TypeScript, and Supabase applications.

Analyse the source files provided by the user and identify APPLICATION ERRORS — real bugs that cause incorrect behaviour, crashes, or security issues at runtime. Ignore style, formatting, and naming conventions.

Bug categories to look for (use the exact string in the category field):

hooks-violation
  - Hooks (useState, useEffect, useMemo, useRef, useCallback, custom hooks) called after an
    early return or inside a condition/loop — violates Rules of Hooks, breaks React's
    internal hook order between renders.

missing-route
  - Code calls navigate() or <Link to="..."> with a path that is not registered in the
    BrowserRouter <Routes> in App.tsx. Results in a 404 / blank screen.

unhandled-error
  - Async calls (Supabase queries, fetch, auth) that never surface errors to the user —
    no try/catch, no .catch(), or the Supabase 'error' field is silently ignored.

null-access
  - A value that can be null/undefined is accessed without a guard, causing a runtime
    TypeError (e.g. array.map on a possibly-null result, optional chaining missing).

race-condition
  - Async state updates that may apply to an already-unmounted component or override a
    later update. Missing cleanup / stale-closure issues.

security
  - Data exposed to the wrong users (e.g. all providers seeing all aid requests without
    filtering), missing RLS awareness in queries, or direct user-controlled values used
    without sanitization.

logic-error
  - Incorrect conditional logic, wrong comparison operators, state that can become
    permanently inconsistent, features that silently do nothing.

missing-validation
  - Required environment variables or inputs used without checking, leading to silent
    runtime failures.

type-error
  - TypeScript 'as any' casts or non-null assertions (!) that hide real type mismatches
    which could throw at runtime.

Report every distinct bug you find with report_error. When you have examined all files, call analysis_complete.`

async function runAgent(files: Record<string, string>): Promise<{ reports: ErrorReport[]; summary: string }> {
  const client = new Anthropic()
  const reports: ErrorReport[] = []
  let summary = ""

  // Build message content — put cache_control on the last file block so Anthropic
  // caches the entire file payload for follow-up turns.
  const entries = Object.entries(files)
  const fileContent: Anthropic.MessageParam["content"] = [
    ...entries.map(([filePath, content], index) => ({
      type: "text" as const,
      text: `=== ${filePath} ===\n${content}`,
      ...(index === entries.length - 1
        ? { cache_control: { type: "ephemeral" as const } }
        : {}),
    })),
    {
      type: "text" as const,
      text: "Analyse every file above for application errors. Call report_error for each bug you find, then call analysis_complete.",
    },
  ]

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: fileContent },
  ]

  let done = false

  while (!done) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    })

    messages.push({ role: "assistant", content: response.content })

    const toolResults: Anthropic.ToolResultBlockParam[] = []

    for (const block of response.content) {
      if (block.type !== "tool_use") continue

      if (block.name === "report_error") {
        const input = block.input as ErrorReport
        reports.push(input)
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: "Recorded.",
        })
      } else if (block.name === "analysis_complete") {
        const input = block.input as { summary: string }
        summary = input.summary
        done = true
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: "Done.",
        })
      }
    }

    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults })
    }

    if (response.stop_reason === "end_turn" && !done) {
      done = true
    }
  }

  return { reports, summary }
}

// ── Report printer ────────────────────────────────────────────────────────────

const SEVERITY_ICON: Record<ErrorReport["severity"], string> = {
  error: "❌",
  warning: "⚠️ ",
  info: "ℹ️ ",
}

function printReport(reports: ErrorReport[], summary: string) {
  const bySevirity = (s: ErrorReport["severity"]) =>
    reports.filter((r) => r.severity === s)

  const errors = bySevirity("error")
  const warnings = bySevirity("warning")
  const infos = bySevirity("info")

  console.log()
  console.log("=".repeat(72))
  console.log("  EMERGENCY-SINLAKU  —  APPLICATION ERROR REPORT")
  console.log("=".repeat(72))
  console.log(
    `  ${errors.length} error(s)   ${warnings.length} warning(s)   ${infos.length} info(s)   (${reports.length} total)`
  )
  console.log("=".repeat(72))
  console.log()

  for (const severity of ["error", "warning", "info"] as const) {
    const group = bySevirity(severity)
    if (group.length === 0) continue

    console.log(`${SEVERITY_ICON[severity]}  ${severity.toUpperCase()}S  (${group.length})\n`)

    for (const r of group) {
      const loc = r.line ? `${r.file}:${r.line}` : r.file
      console.log(`  [${r.category}]`)
      console.log(`  Location : ${loc}`)
      console.log(`  Problem  : ${r.description}`)
      console.log(`  Fix      : ${r.suggestion}`)
      console.log()
    }
  }

  if (summary) {
    console.log("─".repeat(72))
    console.log("SUMMARY")
    console.log("─".repeat(72))
    console.log(summary)
    console.log()
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY environment variable is not set.")
    process.exit(1)
  }

  const writeJson = process.argv.includes("--json")

  console.log("Collecting source files…")
  const files = await collectSourceFiles()
  const fileList = Object.keys(files)
  console.log(`Found ${fileList.length} files to analyse:`)
  fileList.forEach((f) => console.log(`  ${f}`))
  console.log()
  console.log(`Sending to ${MODEL} for analysis…`)

  const { reports, summary } = await runAgent(files)

  printReport(reports, summary)

  if (writeJson) {
    const outPath = path.join(import.meta.dirname, "report.json")
    fs.writeFileSync(outPath, JSON.stringify({ reports, summary }, null, 2))
    console.log(`JSON report written to: ${outPath}`)
  }

  const errorCount = reports.filter((r) => r.severity === "error").length
  process.exit(errorCount > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error("Fatal:", err)
  process.exit(2)
})
