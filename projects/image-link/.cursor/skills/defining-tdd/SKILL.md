---
name: defining-tdd
description: Define and enforce a practical TDD workflow for the ImageLink project. Use when implementing features, fixing bugs, or refactoring where use cases must be explicit, tests must be written before implementation, and verification must confirm behavior.
---

# Defining TDD — ImageLink

## Purpose

Use this skill to apply a consistent TDD workflow in the ImageLink repository:

1.  First, clarify use cases for image management functionalities.
2.  Define test cases from those use cases.
3.  Write tests before implementing production code.
4.  Implement the minimum change to pass the tests.
5.  Verify behavior and report coverage/risks.

If there is a tension between speed and order, maintain the TDD order: **tests first, then code**.

## When to Apply

Apply automatically when the user requests:

-   Adding a new feature.
-   Fixing a bug in the platform.
-   Changing existing behavior.
-   Refactoring logic with behavior guarantees.
-   "Do TDD", "create use cases", "define tests", "test first"

## Mandatory Flow

Copy this checklist and keep it updated:

```md
TDD Progress
- [ ] Step 1: Clarify use cases
- [ ] Step 2: Convert use cases into test cases
- [ ] Step 3: Write failing tests first (RED)
- [ ] Step 4: Implement minimum code (GREEN)
- [ ] Step 5: Safe refactor if applicable (REFACTOR)
- [ ] Step 6: Verify and report results
```

## ImageLink Test Context

### Where tests live

- Backend unit tests live in `backend/tests/` and use `pytest`.
- Backend app code lives in `backend/backend/` (for example `backend/backend/main.py`).
- Frontend unit tests live close to components in `frontend/src/**/*.test.tsx`.
- Frontend test setup file is `frontend/src/test/setup.ts`.

### How tests are implemented

- Start from a use case and map it to a single explicit test name.
- Use behavior-focused names (`returns 200`, `shows initial state`, `rejects invalid input`).
- Keep one clear assertion goal per test. Split tests when behavior differs.
- For bugfixes, first add a failing test that reproduces the bug.
- Prefer deterministic tests. Avoid timing/network dependence unless strictly required.

### Fast implementation pattern

1. Write the failing test first (RED).
2. Run only the relevant test file.
3. Implement the minimum change in production code.
4. Re-run the same test file until GREEN.
5. Run the broader suite of the touched area.

### Verification commands in this repository

Backend:

```bash
cd backend
uv run pytest
```

Frontend:

```bash
cd frontend
npm test
```

If `uv` is unavailable in the environment, use the project venv as a fallback:

```bash
cd backend
.venv/bin/pytest
```

### What must be reported after verification

- Exact test commands executed.
- Which tests were added/updated and where.
- RED evidence (test name + failure reason) before code changes.
- GREEN evidence (passing summary) after implementation.
- Remaining risks or coverage gaps.

### Step 1: Clarify Use Cases

Before editing productive code, define:

-   Actor/context
-   Input/trigger
-   Expected output/effect
-   Edge cases
-   Error paths

Write them in short bullet points. If there's ambiguity, ask clarifying questions before coding.

### Step 2: Convert Use Cases into Test Cases

For each use case, define at least:

-   One happy path test.
-   One edge case test.
-   One failure/error test (when applicable).

Map each use case to test names with a 1:1 relationship when possible.

Template:

```md
Use Case: <name of the ImageLink use case>
- Given: <initial state of the system/component>
- When: <action that triggers the behavior>
- Then: <expected and observable outcome>
- Test File: <path to test file, e.g., frontend/src/components/ImageGrid.test.tsx>
- Test Name: <title of the `it()` or `test()` in the code>
```

### Step 3: Write Failing Tests First (RED)

Rules:

-   Create or update test files **before** writing implementation code.
-   Run specific tests and confirm they fail for the expected reason
-   If it's a bugfix: first reproduce the bug with a failing test that captures the incorrect behavior.

Evidence to capture in the response:

-   Test command(s) executed.
-   Names of failing tests.
-   Short reason for failure.

### Step 4: Implement Minimum Code (GREEN)

Rules:

-   Implement only what is necessary to pass the failing tests.
-   Avoid unrelated refactors while moving from RED to GREEN.
-   Keep changes small and local.

### Step 5: Safe Refactor (REFACTOR)

Optional, only after achieving GREEN:

-   Improve code readability.
-   Remove duplication.
-   Optimize performance (if applicable and covered by tests).
-   Maintain behavior without changes.

Run affected tests after each non-trivial refactor to ensure no regressions are introduced.

### Step 6: Verify and Report

Always run:

1.  Specific tests of the changed area (frontend and/or backend).
2.  Broader suite when risk is medium/high.
3.  Lint validation on edited files, if applicable.

Report using this format:

```md
Verification Report
- Use Cases Covered: <n>/<total>
- Tests Added: <list of paths and test names>
- Tests Updated: <list of paths and test names>
- Commands Executed: <list of test and lint commands>
- Result: <PASS/FAIL + key details, e.g., "All tests pass", "1 integration test fails">
- Remaining Risks: <bullets or "none identified">
```

## Enforcement Rules

-   Do not start implementation before defining explicit test cases.
-   If tests cannot be written (rare, but possible in very specific cases), explicitly explain why and propose a robust alternative verification method.
-   Prioritize deterministic tests over assertions dependent on time or external factors.
-   Keep test names focused on **behavior**, not internal implementation.
-   For reported bugs, a failing reproduction test is **mandatory** before applying the fix.

## Practical Prompts

Use these questions internally during work:

-   "Which use case does this line of code cover?"
-   "Which failing test demonstrates that this behavior is missing?"
-   "What is the minimum change to go from RED to GREEN?"
-   "How do we verify that no regressions occurred?"

## Output Contract

When this skill is used, the response must include:

1.  Explicit use cases for the functionality.
2.  An explicit test plan tied to the use cases.
3.  Clear confirmation that tests were written first.
4.  Test verification results with executed commands, in the "Verification Report" format.

If any point is missing, explicitly mark it as a gap before closing.