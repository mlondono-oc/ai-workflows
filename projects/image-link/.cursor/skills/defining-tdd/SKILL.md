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

-   Adding a new feature to ImageLink (e.g., image upload, tagging, similarity search).
-   Fixing a bug in the platform (e.g., a thumbnail display issue, an export error).
-   Changing existing behavior (e.g., modifying how embeddings are calculated).
-   Refactoring logic with behavior guarantees (e.g., restructuring the database access module).
-   "Do TDD", "create use cases", "define tests", "test first", or any mention of "tests", "acceptance criteria" in the context of development.

## Test Context in this Repo

### Where Tests Are Located

Current monorepo structure:

-   `frontend`: React + Vite client application
-   `backend`: Python API (FastAPI/Flask)

Recommended unit test location:

-   **Backend:** `backend/tests/test_<module_name>.py`
-   **Frontend:** Co-located with productive code (`*.test.tsx` or `*.test.ts`)
    -   Examples:
        -   `frontend/src/components/ImageGrid/ImageGrid.test.tsx`
        -   `frontend/src/services/imageService.test.ts`

Practical Rule:

-   If the module lives in `backend/src/api/images.py`, its test should live in `backend/tests/test_images.py`.
-   If the component lives in `frontend/src/components/ImageDisplay.tsx`, its test should live in `frontend/src/components/ImageDisplay.test.tsx`.

### How Tests Are Implemented

Base Framework:

-   **Backend:** `pytest`
-   **Frontend:** `Vitest` (runner/assertions) + `Testing Library` (for React components)

Minimum Implementation Pattern:

1.  `describe(<behavior unit>)` (to group related tests).
2.  `it(<observable outcome>)` (to describe a specific test).
3.  Given/When/Then structure within the test for clarity.
4.  Assertions on behavior (not on internal details).

Test Naming Guide:

-   Good: `displays all image thumbnails when provided with a list of images`
-   Avoid: `calls internal method X with param Y`

### How Tests Are Verified

Canonical Commands:

-   Full monorepo suite:
    -   `npm test` (will run frontend tests)
    -   `pytest` (will run backend tests)
-   Watch mode (Frontend):
    -   `npm test -- --watch`
-   Per workspace:
    -   `npm test -- --run <path_to_frontend_test_file>`
    -   `pytest backend/tests` (for backend tests)
-   Type/Lint validation:
    -   `npm run lint` (if applicable for frontend)
    -   `uv run ruff check .` / `uv run black .` (if applicable for backend)

Expected TDD Verification Sequence:

1.  Run specific test and confirm RED (fails for the expected reason).
2.  Implement minimum change.
3.  Re-run specific test and confirm GREEN (passes).
4.  Run `npm test` and `pytest` for monorepo regressions.
5.  Run `npm run lint` or `uv run ruff check .` if code/config changes occurred.

Minimum Evidence to Report:

-   Command(s) executed.
-   Test(s) that failed in RED.
-   Test(s) that passed in GREEN.
-   Remaining risks or coverage gaps.

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

### Step 1: Clarify Use Cases

Before editing productive code, define:

-   Actor/context (e.g., "User interacting with the image grid").
-   Input/trigger (e.g., "User clicks on a thumbnail").
-   Expected output/effect (e.g., "Selected image is displayed in the detailed view").
-   Edge cases (e.g., "Grid is empty", "Image does not exist").
-   Error paths (e.g., "Server returns an error when loading images").

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
-   Run specific tests and confirm they fail for the expected reason (e.g., "function not implemented", "endpoint does not exist", "component does not render as expected").
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
4.  Delegate verification to the `qa-engineer` sub-agent for every change, explicitly listing the applicable test cases.

Report using this format:

```md
Verification Report
- Use Cases Covered: <n>/<total>
- Tests Added: <list of paths and test names>
- Tests Updated: <list of paths and test names>
- Commands Executed: <list of test and lint commands>
- Result: <PASS/FAIL + key details, e.g., "All tests pass", "1 integration test fails">
- Remaining Risks: <bullets or "none identified">
- QA Verification: <qa-engineer report reference + status>
```

## Enforcement Rules

-   Do not start implementation before defining explicit test cases.
-   If tests cannot be written (rare, but possible in very specific cases), explicitly explain why and propose a robust alternative verification method.
-   Prioritize deterministic tests over assertions dependent on time or external factors.
-   Keep test names focused on **behavior**, not internal implementation.
-   For reported bugs, a failing reproduction test is **mandatory** before applying the fix.
-   Delegating verification to `qa-engineer` is **mandatory** before closing the task.

## Practical Prompts

Use these questions internally during work:

-   "Which ImageLink use case does this line of code cover?"
-   "Which failing test demonstrates that this behavior is missing?"
-   "What is the minimum change to go from RED to GREEN?"
-   "How do we verify that no regressions occurred in frontend and backend?"
-   "Does the `qa-engineer` need to manually verify this in the UI?"

## Output Contract

When this skill is used, the response must include:

1.  Explicit use cases for the ImageLink functionality.
2.  An explicit test plan tied to the use cases.
3.  Clear confirmation that tests were written first and executed in RED.
4.  Test verification results with executed commands, in the "Verification Report" format.
5.  A mandatory invocation to `qa-engineer` with the relevant test cases and the resulting QA status.

If any point is missing, explicitly mark it as a gap before closing.