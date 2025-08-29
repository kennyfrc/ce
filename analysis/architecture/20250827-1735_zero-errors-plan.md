# Zero Type Errors Implementation Plan — 2025-08-27 17:35

## Goal

Reach and maintain zero TypeScript type errors with strict settings, remove explicit any usage from hot paths and public API, and prevent regressions via CI.

## Guiding principles

- Fix at the source: strengthen types at data/model boundaries and public API.
- Prioritize hotspots and shared utilities to maximize impact.
- Replace any with exact types or unknown + narrowing; avoid Record<string, any>.
- Consolidate third‑party typings into single sources of truth.
- Add guardrails (tests, lint, CI) before tightening config toggles.

## Phase 1 — Public API hardening (highest impact)

1. Define JSpreadsheet interface in types and apply to libraryBase (src/utils/libraryBase.ts).
2. Type jspreadsheet(el, options): WorksheetInstance[]; export typed helpers registry (src/index.ts).
3. Precisely type getWorksheetInstanceByName return: WorksheetInstance | Record<string, WorksheetInstance> (src/index.ts).
4. Ensure jspreadsheet.spreadsheet is WorksheetInstance[] and metadata fields typed (src/index.ts).
5. Replace helper registry any with Record<string, HelperFn> and define HelperFn signature(s).

Acceptance criteria

- No any on public API surfaces (index.ts, libraryBase.ts).
- Type-only tests cover exported API shapes.

## Phase 2 — JSuites typings consolidation

1. Inventory JSuites usages across toolbar.ts, internal.ts, keys.ts; list required APIs.
2. Merge shims into src/types/global.d.ts; delete src/types/jsuites-shim.d.ts.
3. Add/adjust types for mask, calendar, dropdown, contextmenu, toolbar, picker, image.
4. Ensure global/window integrations are declared once.

Acceptance criteria

- One authoritative JSuites typing file; no duplicate declarations.
- Build and tests pass with consolidated types.

## Phase 3 — Hotspot any elimination

A. internal.ts

- Type this: WorksheetInstance (or SpreadsheetContext where appropriate).
- Type updateTable, parseNumber, createCell, updateResult, updateScroll, label, getCell.
- Replace Record<string, any> structures with explicit interfaces or unknown + guards.

B. toolbar.ts

- Introduce ToolbarItem discriminated union with concrete item shapes.
- Strongly type event handlers and item factories; remove dynamic records.

C. selection.ts, keys.ts, rows.ts, columns.ts

- Ensure this: WorksheetInstance everywhere.
- Normalize number|string parameters.
- Add DOM guards; replace Node/Element anys with precise types.
- Type row/column operation payloads and return types.

Acceptance criteria

- Explicit types on all listed functions; no any in hotspots.
- Unit/type tests for selection/rows/columns basic flows compile without casts.

## Phase 4 — Config tightening

1. Delete src/types/core.js; remove allowJs:true in tsconfig.json.
2. Consider enabling noUncheckedIndexedAccess after Phase 3; address surfaced issues.

Acceptance criteria

- tsconfig has allowJs: false; build green.
- If enabled, noUncheckedIndexedAccess passes in src/.

## Phase 5 — Tests, lint, and CI guardrails

1. Add type-only tests validating JSpreadsheet surface and core types under test/.
2. Add CI step: tsc -p tsconfig.test.json; ensure no emit and zero errors.
3. ESLint: ban explicit any (with @ts-expect-error + ticket as escape hatch).
4. Pre-commit: script to fail on non-zero any count using analyzer; track trend.
5. Remove //@ts-ignore in mocha.config.js by aligning global types.
6. Unit tests MUST pass: canonical compile-run flow (see Verification gates) must report 77 passing.

Acceptance criteria

- CI fails on type errors or new any usages.
- No ts-ignore in mocha.config.js; globals typed.
- 77/77 Mocha tests passing via canonical runner.

## Phase 6 — Cleanup and docs

1. Remove dead/duplicated types; update MIGRATION_WHITELIST.md.
2. Document type shapes and extension points for contributors.

## Execution sequencing (2 weeks)

- Week 1: Phases 1–3 (API, JSuites, internal.ts/toolbar.ts).
- Week 2: Remaining hotspots, Phase 4–5, cleanup.

## Risk management

- Keep skipLibCheck:true during consolidation; tighten later.
- Land changes in small PRs per file/module with type tests.

## Tracking metrics

- Script to report any count and files; baseline ≈375 across 29 files; drive to 0.
- Weekly trend in CI artifacts.

## Rollback plan

- Feature flags not needed; types-only changes. Revert PRs if regressions detected.

## Verification gates (must pass before merge)

- Type-check: npx tsc -p tsconfig.test.json --noEmit
- Unit tests (canonical runner): npx tsc -p tsconfig.run.json || true; npx mocha --recursive -r mocha.config.js "dist-test/test/\*_/_.js"
- Alternative dev runner (ts-node): TS_NODE_PROJECT=tsconfig.test.json npx mocha --recursive -r ts-node/register -r mocha.config.js --extension ts "test/\*_/_.ts"
- E2E (Playwright): npx playwright install; npx playwright test

## How to test (recover and run suites)

- Prereqs: npm ci
- Unit tests (canonical): npx tsc -p tsconfig.run.json || true; npx mocha --recursive -r mocha.config.js "dist-test/test/\*_/_.js" (expect 77 passing)
- Type-check only: npx tsc -p tsconfig.test.json --noEmit
- E2E (Playwright): npx playwright install; npx playwright test (uses playwright.config.ts webServer). UI mode: npx playwright test --ui. Single spec: npx playwright test playwright/<file>.test.ts
- Troubleshooting: if ts-node is preferred, add --extension ts and TS_NODE_PROJECT=tsconfig.test.json; ensure mocha.config.js sets jsdom and test/global.d.ts declares root.
