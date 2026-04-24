# Changelog

## 0.1.1 - 2026-04-23

- Implemented MVP architecture for code discovery with LangChain using `createToolCallingAgent` and `AgentExecutor`.
- Added domain tools: `code_analyzer`, `diagram_generator`, and `flow_explainer`, with a shared `NormalizedAnalysis` contract.
- Added MVP guardrails: typed `GuardrailError`, input validation, and safe path validation limited to `AGENT_REPO_ROOT`.
- Added environment validation for OpenRouter and operational limits (input length, iterations, file size, file count, depth).
- Added automated tests for env validation, guardrails, tool contracts, and `runAgent`.
- Added manual MVP scenarios documentation and refreshed architecture/readme alignment.

## 0.1.0 - 2026-04-23

- Initial project setup with TypeScript ESM and npm.
- Base LangChain agent scaffolding with CLI entry point.
- Initial documentation (`README.md`, `docs/brief-agent.md`, `docs/plan-agent.md`, `docs/architecture.md`, `docs/guardrials.md`).
