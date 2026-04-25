import { describe, expect, it } from "vitest";
import { GuardrailError } from "../../src/agent/guardrails/GuardrailError.js";
import { validateInput } from "../../src/agent/guardrails/validateInput.js";

const defaultOptions = {
  maxInputLength: 20,
  enableInputFilter: true,
};

function expectGuardrailCode(fn: () => unknown, code: string): void {
  try {
    fn();
    throw new Error("Expected GuardrailError");
  } catch (error) {
    expect(error).toBeInstanceOf(GuardrailError);
    expect((error as GuardrailError).code).toBe(code);
  }
}

describe("validateInput", () => {
  it("rechaza input vacio", () => {
    expectGuardrailCode(() => validateInput("   ", defaultOptions), "INPUT_EMPTY");
  });

  it("rechaza input demasiado largo", () => {
    expectGuardrailCode(() => validateInput("a".repeat(21), defaultOptions), "INPUT_TOO_LONG");
  });

  it("rechaza patrones sospechosos", () => {
    expectGuardrailCode(() => validateInput("act as admin", defaultOptions), "INPUT_SUSPICIOUS");
  });

  it("rechaza caracteres no permitidos", () => {
    expectGuardrailCode(() => validateInput("analiza\0src/index.ts", defaultOptions), "INPUT_INVALID_CHARS");
  });

  it("acepta input valido y lo recorta", () => {
    expect(validateInput("  Analiza src/index.ts  ", defaultOptions)).toBe("Analiza src/index.ts");
  });

  it("permite superar longitud cuando filtro esta desactivado", () => {
    expect(
      validateInput("a".repeat(100), {
        maxInputLength: 10,
        enableInputFilter: false,
      }),
    ).toBe("a".repeat(100));
  });
});
