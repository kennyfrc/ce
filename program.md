# Incorporate Original CE Diffs

## Goal

Successfully merge upstream JavaScript changes from the original jspreadsheet repository into our TypeScript port, ensuring all new features, events, bug fixes, and documentation updates are incorporated while preserving TypeScript type safety, functionality, and code quality.

## Specifications / Guiding principles

### Problem Statement:
The original jspreadsheet repository is maintained in JavaScript, while our fork has been ported to TypeScript for better type safety and developer experience. Upstream changes (commits) need to be manually incorporated to keep the TypeScript version up-to-date. This involves applying diffs, resolving JavaScript-to-TypeScript conversion issues, updating type definitions, tests, and documentation, and verifying that the merged changes work correctly in the TS context.

### Usage Code / Examples:
- **Applying a diff manually**: Read the diff file (e.g., `diffs/2b1a29f.diff`), identify the changes, locate the corresponding TS file, apply the logic while adding types.
- **Verifying a merge**: Run tests with `npm test`, check for TypeScript errors with `npm run type-check`, and ensure the feature works in the demo (`demo.html`).
- **Example workflow**: For adding an event, update the TS file to dispatch the event, add the event type to `src/types/core.ts`, and add a test case in `test/`.

### Data Model:
- **Diff files**: Plain text patches stored in `diffs/` directory, each representing a commit from upstream.
- **Repository structure**: 
  - `src/`: TypeScript source code with types in `src/types/`, utils in `src/utils/`.
  - `test/`: Test files mirroring source structure.
  - `docs/`: Documentation in Markdown.
- **Relationships**: Each diff references specific files and line ranges; tasks link diffs to candidate files and strategies for application.

### Data Flow:
1. **Identify diff**: Read the next diff file from `diffs/` (e.g., `2b1a29f.diff`).
2. **Analyze changes**: Parse the diff to understand added/removed code, focusing on JS-specific patterns needing TS conversion.
3. **Locate target files**: Map JS files to TS equivalents in `src/`, `test/`, or `docs/`.
4. **Apply changes**: Edit TS files to incorporate logic, add type annotations, update interfaces.
5. **Resolve conflicts**: Handle JS-to-TS issues like `any` types, missing interfaces, or dynamic property access.
6. **Update related files**: Modify type definitions in `src/types/core.ts`, add tests in `test/`, update docs in `docs/`.
7. **Verify**: Run tests, type checks, and manual verification to ensure correctness.
8. **Record**: Mark task as completed in `plan-incorporate-original-ce-diffs.json`.

Critical functions/APIs: `updateResult`, `removeMerge`, event dispatchers, type interfaces in `core.ts`.

### Architecture
Guiding Principle: Implement a single, correct path for each merge. Avoid fallbacks or alternative logic paths for the same case. The system must "fail fast" if an unexpected state or input is encountered, rather than attempting to handle it with a less-correct alternative.

#### Algorithm Design (Option 1 - for subsystems):
You are pragmatic, direct, and focused on simplicity. You prioritize elegant solutions with minimal complexity, favor data-driven designs over excessive abstraction, and communicate technical ideas clearly without unnecessary verbosity.
Simplify and reduce handler logic by identifying special cases (boundaries, errors, empty/initial states) as regular data variants.
As needed, simplify by challenging the need for distinct logic by reinterpreting problems to eliminate edge cases.
Simplify data structures / switch statements / data tables by finding unifying representations or viewpoints (data, state, iteration) to merge cases.
Simplify core logic for uniform handling; minimize conditional branches for cases.
Simplify by favoring unified handling for simpler runtime flow, accepting potentially complex initial setup.
Document how the chosen design achieves case unification (e.g., nil structs, zero is valid, pointer indirection, sentinels).

For the merge process, we use a unified algorithm to handle all diff incorporations:
- Treat all diffs as regular data: Each diff is a patch with changes, regardless of whether it's adding events, fixing bugs, or updating docs.
- Unify special cases: Empty diffs or no-op changes are handled by skipping without error; JS-specific constructs (e.g., dynamic `this`) are converted to TS equivalents (e.g., explicit `this` typing).
- Merge cases via data: Use a single function to apply diffs: read diff, parse changes, apply to TS code, resolve types, update tests/docs.
- Achieve unification: By representing diffs as structured data (file paths, line ranges, change types), we eliminate branching for different diff types, allowing a single loop to process all tasks.
- Runtime flow: Complex initial setup (parsing diffs, mapping JS to TS) enables simple, uniform application without conditional logic.

## `plan-xxx.json` format

IMPORTANT: All line and column numbers in plan-xxx.json and the files are 1-based (matching what editors and error messages show), not 0-based.

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

### Conventions

- state enum: pending | in_progress | blocked | completed | cancelled
- ids are immutable and unique; names may change
- updatedAt must be ISO 8601 (UTC)
- Backward-compatible additions must bump schemaVersion

## Tools

### Progress Tracking with plan-xxx.json and jq

```bash
# 1) Count tasks by state
jq -r '.tasks | group_by(.state) | map({state:.[0].state,count:length})[] | "\(.state): \(.count)"' plan-xxx.json

# 2) List pending tasks with phase and name (TSV)
jq -r '.tasks[] | select(.state=="pending") | [.id,.phase,.name] | @tsv' plan-xxx.json

# 3) Move a task to in_progress
id=ts-zero-20250827-0007; tmp=$(mktemp); \
jq --arg id "$id" --arg state in_progress '.tasks |= (map(if .id==$id then .state=$state else . end))' plan-xxx.json > "$tmp" && mv "$tmp" plan-xxx.json

# 4) Unique candidate files for Phase 3 tasks
jq -r '.tasks[] | select(.phase==3) | .candidateFiles[]' plan-xxx.json | sort -u
```

### Other Tools
- **Verification scripts**: Use `npm test` to run Mocha tests, `npm run type-check` for TypeScript compilation, and manual checks in `demo.html`.
- **Diff application**: Use `git apply` for simple diffs, or manual editing for complex merges.
- **Code quality**: Run ESLint with `npm run lint` to ensure code style.

## IMPORTANT: Workflow

Autonomously complete this workflow step by step until it is fully resolved. Do this to your fullest, before coming back to the user. Do NOT ask for permission - just complete the full workflow to your highest standards.

0. **Setup**: Read `plan-incorporate-original-ce-diffs.json` to understand the current project plan.
1. **Baseline**: Describe the current state of the codebase relevant to the task, such as existing events, merge functionality, and documentation.
2. **Compare**: Describe the gap between the baseline and the desired goal, e.g., missing events or outdated docs from upstream.
3. **Plan**: Update `plan-incorporate-original-ce-diffs.json` with new or adjusted tasks based on analysis. Set the first task to `in_progress`.
4. **Implement**: Implement the next vertical slice from the plan, applying the diff and resolving TS issues.
5. **Verify**: Run tests, type checks, and manual verification to confirm correctness.
6. **Record Learnings**: Document challenges like JS-to-TS conversions in `learnings.md`.
7. **Record Plan**: Update the plan to mark the task completed and set `updatedAt`.
8. **Commit**: `git add & commit` to record progress.