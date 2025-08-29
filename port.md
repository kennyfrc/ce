# Javascript to Typescript Porting Program

## Goal

Reach and maintain zero TypeScript type errors with strict settings, remove explicit any usage from hot paths and public API, and prevent regressions via CI.

## Guiding principles

- Fix at the source: strengthen types at data/model boundaries and public API.
- Prioritize hotspots and shared utilities to maximize impact.
- Replace any with exact types or unknown + narrowing; avoid Record<string, any>.
- Consolidate third‑party typings into single sources of truth.
- Add guardrails (tests, lint, CI) before tightening config toggles.
- Keep skipLibCheck:true during consolidation; tighten later.
- Land changes in small PRs per file/module with type tests.

## Prescriptive type-safety playbook (do this)

- Strengthen config (simple and pragmatic)
  - Use only "strict": true; keep skipLibCheck:true during migration. Avoid additional strict flags unless a specific issue requires them.
  - Do not use explicit any anywhere; prefer precise types or unknown + narrowing.

- Model data at the edges
  - Define precise unions for public options and records; prefer discriminated unions with kind where applicable.
  - Treat unknown as the boundary type; write type guards (typeof/instanceof/in) and assertion functions (asserts cond) to narrow.
  - Use satisfies on object literals to validate shape while preserving inference; use as const for constant tables/tuples.

- DOM and interop patterns
  - Always narrow Element/EventTarget to specific HTMLElement/Node types before property access; prefer early returns.
  - Use Array.isArray, typeof, and truthiness checks to drive control-flow narrowing; avoid casting to skip checks.
  - For jSuites, use the declared types in src/types/global.d.ts; add tiny typed wrappers if an API isn’t modeled—do not double-assert.

- Replace casts with code
  - Minimize assertions (as); never use as any or double assertions (as unknown as); prefer guards, satisfies, and typed helpers.
  - Use targeted assertions only when narrowing can’t express intent; add a brief comment; avoid non-null (!) except well-documented invariants.
  - Prefer readonly where mutation is not needed and const type parameters to preserve literal inference.

- Pragmatic enforcement
  - Apply rules incrementally: enforce on new/changed code; refactor legacy areas opportunistically to avoid churn.
  - Keep lint light; rely primarily on tsc strict and targeted code fixes.
  - Allow localized @ts-expect-error or minimal boundary casts only with a comment and tracking ticket; encapsulate in small wrappers.
  - Favor the smallest change that improves types without adding complexity; prefer improving data models over widespread cast edits.



## `plan.json` format

IMPORTANT: All line and column numbers in plan.json and the files are 1-based (matching what editors and error messages show), not 0-based.

Schema (v1 — flat tasks with phase field):

```json
{
  "schemaVersion": 1,
  "metadata": {
    "currentBranch": "$branchName",
    "updatedAt": "2025-08-27T00:00:00Z"
  },
  "tasks": [
    {
      "id": "ts-zero-20250827-0001",
      "name": "API: Type libraryBase to JSpreadsheet",
      "description": "Apply JSpreadsheet interface to libraryBase",
      "phase": 1,
      "state": "pending",
      "candidateFiles": [
        "src/utils/libraryBase.ts",
        "src/types/core.ts"
      ],
      "fileHints": [
        { "path": "src/utils/libraryBase.ts", "lineStart": 1, "lineEnd": 60 }
      ],
      "owners": ["@team/types"],
      "labels": ["api", "types"],
      "acceptanceCriteria": [
        "No any on public API surface for libraryBase"
      ],
      "links": [],
      "createdAt": "2025-08-27T00:00:00Z",
      "updatedAt": "2025-08-27T00:00:00Z"
    }
  ]
}
```

Conventions:

- state enum: pending | in_progress | blocked | completed | cancelled
- phase: integer 1–6 aligned to program phases
- candidateFiles may include globs; fileHints are optional targeted 1-based ranges
- ids are immutable and unique; names may change
- updatedAt must be ISO 8601 (UTC)
- Backward-compatible additions must bump schemaVersion

## Tools

### Progress Tracking with plan.json and jq

```bash
# 1) Count tasks by state
jq -r '.tasks | group_by(.state) | map({state:.[0].state,count:length})[] | "\(.state): \(.count)"' plan.json

# 2) List pending tasks with phase and name (TSV)
jq -r '.tasks[] | select(.state=="pending") | [.id,.phase,.name] | @tsv' plan.json

# 3) Move a task to in_progress
id=ts-zero-20250827-0007; tmp=$(mktemp); \
jq --arg id "$id" --arg state in_progress '.tasks |= (map(if .id==$id then .state=$state else . end))' plan.json > "$tmp" && mv "$tmp" plan.json

# 4) Unique candidate files for Phase 3 tasks
jq -r '.tasks[] | select(.phase==3) | .candidateFiles[]' plan.json | sort -u
```

### Find any types

Find all any types in the codebase.

```bash
node find-any-types.js
```

## Verification (must pass before merge)

- Type-check: npx tsc -p tsconfig.test.json --noEmit
- Unit tests (canonical runner): npx tsc -p tsconfig.run.json || true; npx mocha --recursive -r mocha.config.js "dist-test/test/*/*.js"
- Alternative dev runner (ts-node): TS_NODE_PROJECT=tsconfig.test.json npx mocha --recursive -r ts-node/register -r mocha.config.js --extension ts "test/*/*.ts"
- E2E (Playwright): npx playwright install; npx playwright test

## Final Verification Results (current)

- TypeScript: tsconfig.test.json passes (0 errors); tsconfig.json fails (TS6059 from playwright includes); webpack build fails (TS2339 in src/test.ts).
- Any Types: 0 explicit any in src; some 'as any' remain in tests.
- Unit Tests: Not running via npm test (Mocha TS discovery/ts-node error); script needs --extension ts or build-first approach.
- E2E Tests: 10 Playwright tests → 7 passing, 3 failing (outdated selectors/expectations; manual init expectations).
- Demo: demo.html loads without JavaScript errors.

### Quality Gate (enforced)

- Playwright: 10/10 passing locally and in CI.
- Mocha: TS tests run via npm script and pass.
- Type-check: tsconfig.json and tsconfig.test.json both pass with --noEmit.
- Build: npm run build succeeds (no TS errors); demo.html loads with 0 console errors under http-server on port 8080.

## Workflow

Autonomously complete this workflow step by step until it is fully resolved. Do this to your fullest, before coming back to the user. Do NOT ask for permission - just complete the full workflow to to your highest standards of completeness.

0. Setup: using jq, check plan.json and check porting-notes.md. use jq to find the next work that needs to be done.
1. Baseline: run type-check and measure any counts; record in notes
2. Identify upstream/core types to fix first; prefer data boundaries
3. Update plan.json: add/adjust tasks, phases, owners; set one task in_progress
4. Implement the solution fully - be proactive and do not ask for permission - just implement it and the user will review it later; prefer removing any at public/API edges
5. Verify: run gates; keep commits small; avoid casting-only fixes
6. Record Learnings: add learnings through 2-3 concise bullets to porting-notes.md
7. Record Plan: update plan.json updatedAt
8. Commit: git add & commit to record progress
