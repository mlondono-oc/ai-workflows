# Architecture

This project implements a code discovery agent with LangChain tools using a modular structure designed for clarity, testability, and incremental extension. Its purpose is to help developers and new team members understand existing codebases through natural language analysis and visual diagrams.

## End-to-end flow

1. The CLI receives a natural language `input` (file path, directory, or function name) in `src/index.ts`.
2. `runAgent` in `src/agent/runAgent.ts` creates or receives an `AgentExecutor`.
3. `buildAgentExecutor` in `src/agent/createAgent.ts` composes model, prompt, and tools.
4. The agent selects and executes the appropriate tool based on the request:
   - `code_analyzer` — reads a file or directory, extracts component responsibilities, dependencies, and key patterns; operates in read-only mode.
   - `diagram_generator` — receives the structured output from `code_analyzer` and produces an Excalidraw-compatible JSON diagram with labeled nodes and relationships.
   - `flow_explainer` — traces the execution path of a specific function, listing call order, conditionals, and data transformations step by step.
5. `AgentExecutor` returns a structured `output` with five sections: summary, analyzed scope, execution flow, diagram, and a brief explanation of how the answer was produced.

## Module responsibilities

- `src/config/env.ts`
  - Loads `env.local`.
  - Validates required environment variables with `zod` (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`).
  - Fails fast with a clear, actionable error message if any variable is missing or invalid.
- `src/agent/model.ts`
  - Creates the `ChatOpenAI` model configured against OpenRouter.
- `src/agent/prompt.ts`
  - Defines agent behavior, language (Spanish), output structure, and tool-selection criteria.
  - Instructs the agent to declare scope boundaries when a query is too broad.
- `src/agent/tools/codeAnalyzer.ts`
  - Reads files or directories using Node.js `fs` in read-only mode.
  - Extracts module structure, exported symbols, and inter-module dependencies.
  - Returns a normalized representation used by `diagram_generator` and `flow_explainer`.
- `src/agent/tools/diagramGenerator.ts`
  - Transforms the normalized code structure into an Excalidraw-compatible JSON payload.
  - Produces labeled nodes for components and directed edges for dependencies.
- `src/agent/tools/flowExplainer.ts`
  - Locates a target function within the analyzed code.
  - Returns an ordered list of steps describing the execution path, including conditionals and calls to external modules.
- `src/agent/createAgent.ts`
  - Assembles model, tools, and prompt into the executable agent.
- `src/agent/runAgent.ts`
  - Exposes a focused execution interface for CLI and tests.
  - Accepts an injectable `AgentExecutor` for isolated unit tests.

## Output structure

Every response produced by the agent must follow this minimum structure:

```
1. Resumen                      — brief description of what was analyzed and the main finding.
2. Alcance                      — what was included and explicitly what was not evaluated.
3. Flujo                        — ordered steps of the execution path or component relationships.
4. Diagrama                     — Excalidraw JSON or a link to the exported diagram file.
5. Como llegue a esta conclusion — short explanation of which tools were used and why.
```

If the agent cannot fully satisfy the request (e.g. too large a codebase), it must reduce scope, communicate the limitation in the `Alcance` section, and deliver a partial but valid result.

## Design decisions

- TypeScript ESM for alignment with the modern Node.js ecosystem.
- Centralized environment validation to fail fast on invalid configuration.
- OpenRouter is integrated through the OpenAI-compatible API surface with provider-specific headers.
- All file system access is strictly read-only during the MVP; the agent must never write, move, or delete files in the analyzed repository.
- `code_analyzer` output is the single source of truth shared between `diagram_generator` and `flow_explainer` to avoid redundant file reads.
- Injectable executor support in `runAgent` for isolated and fast unit tests.
- Guardrails are enforced in code: `validateInput` runs before agent execution and `validatePath` restricts tool access to `AGENT_REPO_ROOT`.
- Responses are always in Spanish, regardless of the language of the analyzed code.

## Recommended evolution

- Add a `pr_reviewer` tool under `src/agent/tools` to annotate pull request diffs with findings.
- Add a `bug_detector` tool that flags suspicious patterns within analyzed files.
- Replace direct `fs` reads in `code_analyzer` with a streaming approach for large repositories.
- Add structured logging when deeper runtime diagnostics are required.
- Register new tools exclusively in `createAgent.ts` to keep extension isolated from core execution logic.
