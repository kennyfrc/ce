Title: TypeScript Type-Safety Audit and Anti-Pattern Review

Scope
- Codebase audited for type-safety practices: any usage, type assertions (as), double assertions, non-null assertions, config/linting.
- Principles derived from TS docs and community guidance (see Sources).

Key Principles for Strong Type Safety
- Prefer unknown over any; enable noImplicitAny and avoid explicit any except as a last resort.
- Minimize type assertions; prefer narrowing (typeof, instanceof, in), user-defined type guards, and assertion functions (asserts ...), and the satisfies operator for object literals.
- Avoid double assertions (x as unknown as T) and especially as any as T; model APIs or add guards instead.
- Avoid non-null assertion (!) in favor of explicit checks or refined types; initialize state to remove optionals.
- Enable strict mode and complementary flags (noUncheckedIndexedAccess, exactOptionalPropertyTypes, useUnknownInCatchVariables, etc.).
- Use eslint typed rules to prohibit unsafe gaps: no-explicit-any, no-unsafe-assignment/call/member-access/argument/return, no-unnecessary-type-assertion, no-non-null-assertion, consistent-type-assertions.
- Use as const and const type parameters to preserve literal inference when needed (safe assertion).

Findings (repo state on 2025-08-29)
- any usage
  - In src (excluding backups/temp): 1 explicit any found.
    - src/utils/helpers.ts:243 uses header.getAttribute(...) as any to set ColumnDefinition.type (helpers.ts:243).
  - Tests: test/orderBy.ts:49-50 uses any in inline sort callbacks (acceptable for tests, but can be typed).
  - Note: numerous any tokens exist only in backup/original files (ignored by build): src/utils/*.backup*, *.original, *.tmp.

- Type assertions (as)
  - Widespread use across src (e.g., DOM casts, data model casts, function returns). Many are reasonable, but several are risky or avoidable.
  - Double assertions (as unknown as ...):
    - src/index.ts:129 value as unknown as HelperFn
    - src/webcomponent.ts:48 shadowRoot as unknown as HTMLElement
    - src/utils/internal.ts:554 jSuites.calendar as unknown as { extractDateFromString: ... }
    - src/utils/factory.ts:162,294; src/utils/events.ts:211,547,767,1264; src/utils/dispatch.ts:65; src/utils/worksheets.ts:569,651,685; src/utils/orderBy.ts:108; src/utils/pagination.ts:20-32,67,129; src/utils/copyPaste.ts:492; src/utils/merges.ts:153,201; src/utils/toolbar.ts:598
  - Notes:
    - jSuites is typed in src/types/global.d.ts; many double assertions can be removed in favor of those types (e.g., calendar.extractDateFromString exists).
    - webcomponent passes ShadowRoot where an HTMLElement is expected, hence the cast.

- Non-null assertions (!)
  - Present in selection, factory, worksheets, events, etc. Examples:
    - src/utils/selection.ts:222-225, 349-352, 388, 417, 432, 445-448
    - src/utils/factory.ts:232,247,250,252
    - src/utils/worksheets.ts:601,607
    - src/utils/filter.ts:122,126
    - src/utils/freeze.ts:9,16
    - src/index.ts:30
  - Many can be replaced by explicit guards or by shaping types/state to avoid optionals.

- Config & linting
  - tsconfig.json: strict suite enabled (good). Consider adding:
    - "noUncheckedIndexedAccess": true
    - "exactOptionalPropertyTypes": true
    - Optionally: "noPropertyAccessFromIndexSignature": true
  - skipLibCheck is true (fine for perf; set to false for maximum thoroughness if feasible).
  - .eslintrc.js: uses @typescript-eslint and no-explicit-any, but not the typed recommended sets nor unsafe rules.

Actionable Recommendations
- Remove the remaining as any
  - helpers.ts:243 — parse the data-celltype attribute and assign only if it matches ColumnDefinition["type"]. Example approach:
    - Create an isColumnType(x: string): x is "text"|"numeric"|... guard and use it; else default to "text".

- Replace double assertions with typed APIs
  - jSuites interop: rely on declared types (global.d.ts/shims.d.ts). Ex:
    - internal.ts:554 → jSuites.calendar.extractDateFromString(String(value), format)
  - index.ts:129 map helpers without double assertion:
    - Narrow import: import type { HelperFn } from "./types/core"; define a typed record or explicitly cast once (value as HelperFn) if necessary.

- Fix root typing in webcomponent
  - webcomponent.ts:48 — pass container (HTMLElement) as root instead of ShadowRoot, or change SpreadsheetOptions["root"] to HTMLElement | ShadowRoot.

- Reduce non-null assertions
  - selection.ts and others — early-return if selection bounds are incomplete; initialize plugins, contextMenu, etc., so properties aren’t optional at use sites.
  - Consider assertion functions for invariants (function assertOk(x: T | null): asserts x is T).

- Strengthen tsconfig
  - Enable: noUncheckedIndexedAccess, exactOptionalPropertyTypes, useUnknownInCatchVariables (already on via strict), optionally noPropertyAccessFromIndexSignature.

- Strengthen ESLint
  - Extend: "plugin:@typescript-eslint/recommended-type-checked" and/or "plugin:@typescript-eslint/strict-type-checked" (with parserOptions.project set).
  - Add rules: no-unsafe-assignment, no-unsafe-call, no-unsafe-member-access, no-unsafe-argument, no-unsafe-return, no-unnecessary-type-assertion, no-non-null-assertion, consistent-type-assertions.

Progress Assessment
- The migration is progressing well: strict mode enabled, core types modeled, and most any usages removed.
- Remaining gaps are primarily assertion-heavy interop and a few correctness issues (ShadowRoot cast, non-null prevalence).
- Addressing the above will significantly increase soundness without large code churn.

TODOs
- [ ] helpers.ts: replace as any with a proper type guard for data-celltype.
- [ ] webcomponent.ts: pass container as root or widen root type.
- [ ] jSuites calls: remove as unknown as ...; use declared JSuites types; add/adjust shims if needed.
- [ ] selection/factory/worksheets: replace ! with guards or initialization; add asserts helpers where needed.
- [ ] tsconfig: add noUncheckedIndexedAccess and exactOptionalPropertyTypes.
- [ ] ESLint: adopt typed recommended configs; enable no-unsafe-* and no-unnecessary-type-assertion; optionally ban non-null assertions.
- [ ] Tests: replace any in test/orderBy.ts with typed comparators.

Concrete References
- as any
  - src/utils/helpers.ts:243
- Double assertions
  - src/index.ts:129; src/webcomponent.ts:48; src/utils/internal.ts:554; src/utils/factory.ts:162,294; src/utils/events.ts:211,547,767,1264; src/utils/dispatch.ts:65; src/utils/worksheets.ts:569,651,685; src/utils/orderBy.ts:108; src/utils/pagination.ts:20-32,67,129; src/utils/copyPaste.ts:492; src/utils/merges.ts:153,201; src/utils/toolbar.ts:598
- Non-null assertions
  - src/utils/selection.ts:222-225,349-352,388,417,432,445-448; src/utils/factory.ts:232,247,250,252; src/utils/worksheets.ts:601,607; src/utils/filter.ts:122,126; src/utils/freeze.ts:9,16; src/index.ts:30

Sources (selected)
- Official docs: typescriptlang.org/tsconfig (strict, exactOptionalPropertyTypes, etc.); TS Handbook (any, unknown, type assertions); TS 4.4 blog (aliased control flow); TS 4.9 satisfies.
- typescript-eslint: no-explicit-any; no-unnecessary-type-assertion; no-unsafe-*: assignment/call/member-access/argument/return; no-non-null-assertion; consistent-type-assertions.
- Style guides: Google TypeScript Style Guide; ts.dev style.
- Articles/notes: satisfies operator (refine.dev); compiler flags (lucaspaganini.com).
