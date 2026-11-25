<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.


# Project Guidelines & Token Optimization Rules

## 1. Context & File Reading
- **Targeted Exploration:** Never read entire large files (>200 lines) unless strictly required. Always use `grep` / symbol search first to locate relevant code, then read specific line ranges (`offset` and `limit`).
- **Scope Discipline:** Only inspect and modify files directly related to the current task. Do not explore unrelated modules or directories.
- **Ignore Heavy Files:** Never read lockfiles (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `Cargo.lock`), build artifacts (`dist/`, `build/`, `.next/`), logs, or large static data files.

## 2. Execution & Loop Prevention
- **Strict Retry Limit:** Maximum **3 attempts** to fix any compilation, linting, or test error. If the issue persists after 3 attempts, STOP immediately, explain the root cause, and ask the user for guidance.
- **Minimal Command Output:** When running tests, builds, or linters, suppress verbose logs and capture only errors (e.g., use `--silent`, `--quiet`, or pipe through `tail -n 50`). Never dump full stack traces or hundreds of log lines into context.
- **Plan Before Editing:** Before making multi-file changes, briefly outline the exact files to be modified and the intended changes.

## 3. Communication & Output
- **Be Concise:** Do not repeat existing code or print full modified files in responses. Summarize changes in brief bullet points.
- **No Unnecessary Chatter:** Skip introductory filler and closing summaries. Focus strictly on execution and technical facts.

## 4. Project Architecture & Commands
*(Uzupełnij poniżej krótko swój stack, aby agent nie musiał go zgadywać przy każdym starcie)*
- **Tech Stack:** [np. TypeScript, Next.js, Node.js, PostgreSQL]
- **Directory Structure:** [np. `src/api/` - endpointy, `src/components/` - UI, `src/lib/` - logika]
- **Build Command:** [np. `npm run build`]
- **Test Command:** [np. `npm test -- --run`]
<!-- END:nextjs-agent-rules -->
