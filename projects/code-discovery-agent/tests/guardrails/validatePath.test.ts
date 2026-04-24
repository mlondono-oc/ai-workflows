import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GuardrailError } from "../../src/agent/guardrails/GuardrailError.js";
import { validatePath } from "../../src/agent/guardrails/validatePath.js";

describe("validatePath", () => {
  let repoRoot = "";

  beforeEach(async () => {
    repoRoot = await fs.mkdtemp(path.join(os.tmpdir(), "code-discovery-guardrails-"));
    await fs.writeFile(path.join(repoRoot, "index.ts"), "export const ok = true;", "utf8");
  });

  afterEach(async () => {
    if (repoRoot) {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("acepta rutas dentro del repo", async () => {
    const safePath = await validatePath(repoRoot, "index.ts");
    expect(safePath).toBe(path.join(repoRoot, "index.ts"));
  });

  it("rechaza path traversal", async () => {
    await expect(validatePath(repoRoot, "../../etc/passwd")).rejects.toThrowError(GuardrailError);
    await expect(validatePath(repoRoot, "../../etc/passwd")).rejects.toThrow(
      "Acceso denegado: ruta fuera del repositorio objetivo.",
    );
  });

  it("bloquea archivos de credenciales", async () => {
    await fs.writeFile(path.join(repoRoot, ".env.local"), "KEY=abc", "utf8");
    await expect(validatePath(repoRoot, ".env.local")).rejects.toThrow(
      'Acceso denegado: el archivo ".env.local" puede contener credenciales.',
    );
  });
});
