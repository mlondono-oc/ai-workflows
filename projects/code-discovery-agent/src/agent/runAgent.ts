import type { AgentExecutor } from "langchain/agents";
import { getEnv } from "../config/env.js";
import { buildAgentExecutor } from "./createAgent.js";
import { validateInput } from "./guardrails/validateInput.js";

type AgentResult = { output?: unknown };
type AgentInvoker = Pick<AgentExecutor, "invoke"> | { invoke(input: { input: string }): Promise<AgentResult> };

export interface RunAgentOptions {
  executor?: AgentInvoker;
  verbose?: boolean;
}

function isModelAuthError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return /MODEL_AUTHENTICATION|401\s+User not found|401/i.test(error.message);
}

function mapModelAuthError(error: unknown): Error {
  if (!isModelAuthError(error)) {
    return error instanceof Error ? error : new Error(String(error));
  }

  return new Error(
    "Fallo de autenticacion con el modelo (OpenRouter). Verifica OPENROUTER_API_KEY en .env.local, confirma que la clave este activa en OpenRouter y vuelve a ejecutar.",
  );
}

function normalizeOutput(rawOutput: unknown): string {
  if (typeof rawOutput === "string") {
    return rawOutput;
  }

  if (Array.isArray(rawOutput)) {
    return rawOutput
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (item && typeof item === "object" && "text" in item && typeof item.text === "string") {
          return item.text;
        }
        return "";
      })
      .join("\n")
      .trim();
  }

  return String(rawOutput ?? "");
}

function sanitizeOutput(output: string): string {
  const env = getEnv();
  if (!env.AGENT_ENABLE_OUTPUT_FILTER) {
    return output;
  }

  if (output.length <= env.AGENT_MAX_OUTPUT_LENGTH) {
    return output;
  }

  return `${output.slice(0, env.AGENT_MAX_OUTPUT_LENGTH)}\n[Respuesta truncada por limite de seguridad]`;
}

export async function runAgent(input: string, options: RunAgentOptions = {}): Promise<string> {
  const env = getEnv();
  const normalizedInput = validateInput(input, {
    maxInputLength: env.AGENT_MAX_INPUT_LENGTH,
    enableInputFilter: env.AGENT_ENABLE_INPUT_FILTER,
  });
  const executor =
    options.executor ??
    (await buildAgentExecutor({
      verbose: options.verbose ?? env.AGENT_VERBOSE,
      maxIterations: env.AGENT_MAX_ITERATIONS,
    }));
  let result: AgentResult;
  try {
    result = await executor.invoke({ input: normalizedInput });
  } catch (error) {
    throw mapModelAuthError(error);
  }
  const output = normalizeOutput(result.output);
  return sanitizeOutput(output);
}
