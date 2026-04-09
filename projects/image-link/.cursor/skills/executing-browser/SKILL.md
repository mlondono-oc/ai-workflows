---
name: executing-browser
description: >-
  Runs reliable browser automation with the agent-browser CLI (open, snapshot,
  interact by @refs, screenshots, CDP). Use when the user asks for browser
  automation, E2E checks via terminal, scraping with a real browser, verifying
  UI flows, open URLs, take a DOM snapshot, interact using refs (@e1, @e2), or
  capture screenshots.
---

# Executing browser (agent-browser)

## When to read this skill

Use this skill to control a browser from the terminal with **agent-browser** (Vercel Labs CLI). It's useful for:

- Testing app flows (login, publishing, browsing)
- Obtaining the accessibility tree with references so the AI ​​can decide what to do
- Interacting using references (`@e1`, `@e2`) instead of fragile selectors
- Capturing screenshots or PDFs
- Viewing the app in headed mode for debugging

Documentation: [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser)

## Recommended Workflow (Snapshot → Refs Pattern)

1.  **Open the page**
    ```bash
    agent-browser open http://localhost:5173
    ```

2.  **Get snapshot with refs** (Accessibility tree; refs are stable for AI context)
    ```bash
    agent-browser snapshot -i
    ```
    `-i` = interactive elements only (buttons, inputs, links). Optional: `-c` (compact), `-d 5` (max depth).

3.  **Interact by ref** (Use refs from the snapshot, e.g., `[ref=e2]`)
    ```bash
    agent-browser click @e2
    agent-browser fill @e3 "text"
    agent-browser type @e4 "more text"
    ```

4.  **If the page changes**, take a new snapshot and use the updated refs.

5.  **Close when finished**
    ```bash
    agent-browser close
    ```

---

## Compatibility with Reactive Frameworks (React 19+, Vue, etc.)

> **IMPORTANT:** `fill` and `click` use Playwright internally. In apps with React 19+ or controlled inputs, these commands might NOT trigger React handlers correctly because the event delegation system differs from the native DOM.

### Symptoms of the Issue
* `fill @eN "text"` sets the DOM value, but the framework state remains empty (buttons might still appear disabled in the next snapshot).
* `click @eN` does not trigger `onClick` handlers.
* The form looks filled visually but performs no business logic (no network requests).

### Solution: Use `eval` with Native Events

For controlled inputs, replace `fill` and `click` with `eval`:

**Fill an input/textarea:**
```bash
agent-browser eval "
var el = document.querySelector('textarea[aria-label=\"My textarea\"]');
var setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
setter.call(el, 'Input text');
el.dispatchEvent(new Event('input', { bubbles: true }));
"
```
*Note: Use `HTMLInputElement` for standard inputs.*

**Click a button:**
```bash
agent-browser eval "
var btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Publish');
btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
"
```

---

## Important Tips

### Chaining Commands
The browser persists between commands (daemon). Use `&&` to chain actions:
```bash
agent-browser open http://localhost:5173 && agent-browser wait --load networkidle && agent-browser snapshot -i
```

### Waits
* **Element:** `agent-browser wait "#submit"`
* **Time:** `agent-browser wait 2000`
* **Text:** `agent-browser wait --text "Welcome"`
* **Network:** `agent-browser wait --load networkidle`

### Semantic Locators (Without Refs)
```bash
agent-browser find role button click --name "Submit"
agent-browser find label "Email" fill "test@test.com"
```

### Captures and Debugging
* **Screenshot:** `agent-browser screenshot --annotate` (Labels elements as [1]=@e1, [2]=@e2).
* **Headed Mode:** `agent-browser open http://localhost:5173 --headed` (To see the browser).
* **JSON Output:** Add `--json` to commands for script parsing.

### Persistence
* **Profiles:** `agent-browser --profile ./browser-data open ...` (Saves cookies/sessions).
* **State:** `agent-browser --state ./auth.json open ...`

---

## Quick Reference Table

| Command | Usage |
|---------|-------|
| `open <url>` | Navigate to page |
| `snapshot -i` | Get tree with interactive refs |
| `click @eN` / `fill @eN` | Interact via ref |
| `get text @eN` | Read content |
| `wait --load networkidle` | Wait for network to settle |
| `screenshot [path]` | Capture image |
| `close` | Kill browser process |

## Quick Checklist
- [ ] Ensure Chrome is installed.
- [ ] Use `snapshot -i` to identify elements.
- [ ] **React 19+:** Use `eval` with native event dispatchers if `fill` or `click` fail.
- [ ] Use `wait --load networkidle` for SPAs.
- [ ] Run `agent-browser close` to clean up.
