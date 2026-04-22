# Changelog

## 0.1.1 - 2026-03-22

- Migrated provider configuration from OpenAI env keys to OpenRouter env keys.
- Updated model initialization to use OpenRouter base URL and optional `HTTP-Referer` / `X-Title` headers.
- Updated local environment template and documentation for OpenRouter setup.

## 0.1.0 - 2026-03-22

- Initial project setup with TypeScript ESM and npm.
- LangChain agent implementation using `createToolCallingAgent` and `AgentExecutor`.
- Included tools: `calculator` and `current_time`.
- CLI entry point to run questions from the terminal.
- Vitest tests for tools and runner.
- Initial documentation (`README.md` and `docs/architecture.md`).
- Local environment template in `env.local`.
