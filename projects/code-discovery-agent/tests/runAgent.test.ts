import { afterEach, describe, expect, it, vi } from "vitest";
import { runAgent } from "../src/agent/runAgent.js";

const ENV_KEYS = [
  "OPENROUTER_API_KEY",
  "AGENT_ENABLE_OUTPUT_FILTER",
  "AGENT_MAX_OUTPUT_LENGTH",
] as const;

function resetEnv(): void {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
}

describe("runAgent", () => {
  afterEach(() => {
    resetEnv();
  });

  it("usa el executor inyectado", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    const invoke = vi.fn().mockResolvedValue({ output: "ok" });

    const output = await runAgent("Analiza src/index.ts", {
      executor: { invoke },
    });

    expect(output).toBe("ok");
    expect(invoke).toHaveBeenCalledWith({ input: "Analiza src/index.ts" });
  });

  it("rechaza entrada vacia", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";

    await expect(
      runAgent("   ", {
        executor: { invoke: vi.fn() },
      }),
    ).rejects.toThrow("La entrada no puede estar vacia.");
  });

  it("trunca salida cuando supera el limite configurado", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.AGENT_MAX_OUTPUT_LENGTH = "5";

    const output = await runAgent("Analiza src/index.ts", {
      executor: {
        invoke: vi.fn().mockResolvedValue({ output: "0123456789" }),
      },
    });

    expect(output).toContain("01234");
    expect(output).toContain("[Respuesta truncada por limite de seguridad]");
  });

  it("normaliza salida en formato array de bloques", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.AGENT_ENABLE_OUTPUT_FILTER = "0";
    const invoke = vi.fn().mockResolvedValue({
      output: [{ text: "Paso 1" }, { text: "Paso 2" }],
    });

    const output = await runAgent("Analiza src/index.ts", {
      executor: { invoke },
    });

    expect(output).toBe("Paso 1\nPaso 2");
  });

  it("mapea errores de autenticacion del modelo con mensaje accionable", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";

    await expect(
      runAgent("Analiza src/index.ts", {
        executor: {
          invoke: vi.fn().mockRejectedValue(new Error("401 User not found. MODEL_AUTHENTICATION")),
        },
      }),
    ).rejects.toThrow("Fallo de autenticacion con el modelo (OpenRouter)");
  });
});
