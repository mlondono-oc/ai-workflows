# Changelog

## 0.1.2 - 2026-04-25

- Added `file_reader` tool to read file content and extract specific function bodies from TypeScript, JavaScript, and Python files.
- Introduced shared `analysis` module with file collection, symbol/dependency extraction, and documentation scanning logic.
- Enhanced `flow_explainer` tool to analyze exported functions and provide context for missing ones.
- Enhanced `diagram_generator` tool with richer analysis output.
- Refactored `code_analyzer` to delegate shared analysis logic to the new shared module.
- Updated environment config with higher limits for file size and iterations.
- Extended tests to cover new tool functionalities and updated contract compliance checks.
- Updated architecture docs, agent brief, and manual test scenarios to reflect new capabilities.

## 0.1.1 - 2026-04-23

- Implemented MVP architecture for code discovery with LangChain using `createToolCallingAgent` and `AgentExecutor`.
- Added domain tools: `code_analyzer`, `diagram_generator`, and `flow_explainer`, with a shared `NormalizedAnalysis` contract.
- Added MVP guardrails: typed `GuardrailError`, input validation, and safe path validation limited to `AGENT_REPO_ROOT`.
- Added environment validation for OpenRouter and operational limits (input length, iterations, file size, file count, depth).
- Added automated tests for env validation, guardrails, tool contracts, and `runAgent`.
- Added manual MVP scenarios documentation and refreshed architecture/readme alignment.

## 0.1.0 - 2026-04-20

- Initial project setup with TypeScript ESM and npm.
- Base LangChain agent scaffolding with CLI entry point.
- Initial documentation (`README.md`, `docs/brief-agent.md`, `docs/plan-agent.md`, `docs/architecture.md`, `docs/guardrials.md`).
