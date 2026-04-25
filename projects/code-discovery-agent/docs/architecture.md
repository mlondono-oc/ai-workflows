# Architecture

This project implements a code discovery agent with LangChain tools using a modular structure designed for clarity, testability, and incremental extension. Its purpose is to help developers and new team members understand existing codebases through natural language analysis and visual diagrams.

## End-to-end flow

1. The CLI receives a natural language `input` (file path, directory, or function name) in `src/index.ts`.
2. `runAgent` in `src/agent/runAgent.ts` creates or receives an `AgentExecutor`.
3. `buildAgentExecutor` in `src/agent/createAgent.ts` composes model, prompt, and tools.
4. The agent selects and executes the appropriate tool based on the request:
   - `code_analyzer` — scans a directory, extracts symbols and dependencies, and **automatically reads and embeds the content of all documentation files found** (`.md`, `.txt`) in the `documentation` field of the output. This ensures the agent has the project's documented purpose in its context from the first tool call, without relying on prompt instructions.
   - `file_reader` — reads the full content of a source file, or extracts the body of a specific function. Used to read actual code before explaining it.
   - `diagram_generator` — two modes: (A) receives a Mermaid `sequenceDiagram` string in `mermaidContent` and persists it as both a `.md` and a self-rendering `.html` file (using Mermaid CDN); (B) receives only `targetPath` and produces an Excalidraw-compatible JSON diagram of module structure.
   - `flow_explainer` — locates a function by name, returns its file path, dependencies, collaborators, and the actual function body extracted from source.
5. `AgentExecutor` returns a structured response adapted to the query type (project overview, module explanation, function deep-dive, or end-to-end flow).

## Module responsibilities

- `src/config/env.ts`
  - Loads `env.local`.
  - Validates required environment variables with `zod` (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`).
  - Fails fast with a clear, actionable error message if any variable is missing or invalid.
- `src/agent/model.ts`
  - Creates the `ChatOpenAI` model configured against OpenRouter.
- `src/agent/prompt.ts`
  - Defines agent behavior, language (Spanish), output format per query type, and security rules.
  - Kept intentionally slim (~50 lines): behavioral context is delivered through tool outputs, not prompt instructions.
- `src/agent/tools/codeAnalyzer.ts`
  - Scans files or directories in read-only mode.
  - Extracts module structure, exported symbols, and inter-module dependencies.
  - Calls `scanDocumentation()` in parallel with `collectFiles()` to find and embed `.md`/`.txt` files found in the scanned tree, ordered by relevance (brief > spec > overview > readme > other). Up to 5 files, 8 000 chars each.
  - Returns a `NormalizedAnalysis` object including the `documentation` array.
- `src/agent/tools/fileReader.ts`
  - Reads the full content of any allowed file in the repository.
  - Optionally extracts the body of a named function using brace-counting (TS/JS) or indentation-based (Python) parsing.
  - Respects `AGENT_MAX_FILE_SIZE_BYTES` and the `validatePath` guardrail.
- `src/agent/tools/diagramGenerator.ts`
  - Mode A (`mermaidContent`): strips any existing fences, wraps content in a `.md` code block, and generates a self-contained `.html` file using the Mermaid CDN so the diagram renders in any browser without extensions. Returns paths to both artifacts.
  - Mode B (`targetPath` only): builds an Excalidraw-compatible JSON diagram of module structure from `code_analyzer` output.
- `src/agent/tools/flowExplainer.ts`
  - Locates a target function within the analyzed code.
  - Returns the file path, inbound dependencies, collaborators, and the actual `functionBody` extracted from source (arrow functions and `function` declarations both supported).
- `src/agent/tools/shared/analysis.ts`
  - Core shared logic: `collectFiles()`, `extractSymbols()`, `extractDependencies()`, `scanDocumentation()`, and `buildAnalysis()`.
  - `scanDocumentation()` scores doc files by name priority and reads up to `MAX_DOC_FILES` (5) with `MAX_DOC_CHARS` (8 000) truncation per file.
- `src/agent/createAgent.ts`
  - Assembles model, tools, and prompt into the executable agent.
  - Registered tools: `codeAnalyzerTool`, `fileReaderTool`, `flowExplainerTool`, `diagramGeneratorTool`.
- `src/agent/runAgent.ts`
  - Exposes a focused execution interface for CLI and tests.
  - Accepts an injectable `AgentExecutor` for isolated unit tests.

## Output structure

The agent adapts its response format based on query type:

| Query type | Sections |
|---|---|
| **Project / directory** | **Que es** — Estructura — Flujo principal — Diagrama (`.md` + `.html` paths) |
| **Module / folder** | **Proposito del modulo** — Archivos clave — Como se relacionan |
| **Specific function** | **Proposito** — Firma — Logica interna (citing real code) — Llamadas que hace |
| **End-to-end flow** | **Punto de entrada** — Cadena de llamadas — Diagrama de secuencia (`.md` + `.html` paths) |

For project and flow queries a Mermaid `sequenceDiagram` is generated and persisted via `diagram_generator`. The tool produces both a `.md` artifact and a self-contained `.html` file viewable in any browser.

## Design decisions

- TypeScript ESM for alignment with the modern Node.js ecosystem.
- Centralized environment validation to fail fast on invalid configuration.
- OpenRouter is integrated through the OpenAI-compatible API surface with provider-specific headers.
- All file system access is strictly read-only; the agent never writes, moves, or deletes files in the analyzed repository (except for persisting diagram artifacts under `.artifacts/`).
- **Documentation embedded in tool output, not in the prompt.** `code_analyzer` auto-reads `.md`/`.txt` files and returns their content in the `documentation` field. This makes the agent's understanding of project purpose data-driven rather than instruction-driven, which is more reliable across different LLMs.
- **Slim prompt principle.** The system prompt defines output format and security rules only. It does not contain procedural instructions on what to read first — that context arrives through the tool. This avoids prompt bloat and instruction-following failures.
- `NormalizedAnalysis` is the shared contract between all tools. Adding the `documentation` field to the type keeps the data model as the single source of truth.
- Injectable executor support in `runAgent` for isolated and fast unit tests.
- Guardrails are enforced in code: `validateInput` runs before agent execution and `validatePath` restricts tool access to `AGENT_REPO_ROOT`.
- Responses are always in Spanish, regardless of the language of the analyzed code.
- Diagram artifacts are generated in two formats: `.md` (for version-controlled documentation) and `.html` (self-rendering via Mermaid CDN, no browser extension needed).

## Recommended evolution

- Add a `pr_reviewer` tool under `src/agent/tools` to annotate pull request diffs with findings.
- Add a `bug_detector` tool that flags suspicious patterns within analyzed files.
- Replace direct `fs` reads in `code_analyzer` with a streaming approach for large repositories.
- Add structured logging when deeper runtime diagnostics are required.
- Register new tools exclusively in `createAgent.ts` to keep extension isolated from core execution logic.
