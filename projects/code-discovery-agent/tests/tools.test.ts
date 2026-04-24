import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { codeAnalyzerTool } from "../src/agent/tools/codeAnalyzer.js";
import { diagramGeneratorTool } from "../src/agent/tools/diagramGenerator.js";
import { flowExplainerTool } from "../src/agent/tools/flowExplainer.js";
import type { NormalizedAnalysis } from "../src/agent/types/normalizedAnalysis.js";

const ENV_KEYS = [
  "OPENROUTER_API_KEY",
  "AGENT_REPO_ROOT",
  "AGENT_MAX_FILE_SIZE_BYTES",
  "AGENT_MAX_FILES_PER_ANALYSIS",
  "AGENT_MAX_DIRECTORY_DEPTH",
] as const;

function resetEnv(): void {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
}

async function createTempRepo(): Promise<string> {
  const repoRoot = await fs.mkdtemp(path.join(os.tmpdir(), "code-discovery-agent-"));
  await fs.writeFile(
    path.join(repoRoot, "a.ts"),
    'import { two } from "./b";\nexport function one() {\n  return two();\n}\n',
    "utf8",
  );
  await fs.writeFile(path.join(repoRoot, "b.ts"), "export function two() {\n  return 2;\n}\n", "utf8");
  return repoRoot;
}

describe("tools", () => {
  let repoRoot = "";

  beforeEach(async () => {
    repoRoot = await createTempRepo();
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.AGENT_REPO_ROOT = repoRoot;
    process.env.AGENT_MAX_FILE_SIZE_BYTES = "100000";
    process.env.AGENT_MAX_FILES_PER_ANALYSIS = "20";
    process.env.AGENT_MAX_DIRECTORY_DEPTH = "4";
  });

  afterEach(async () => {
    if (repoRoot) {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
    resetEnv();
  });

  it("code_analyzer rechaza rutas fuera del repo", async () => {
    await expect(codeAnalyzerTool.invoke({ targetPath: "../" })).rejects.toThrow(
      "Acceso denegado: ruta fuera del repositorio objetivo.",
    );
  });

  it("code_analyzer bloquea archivos de credenciales", async () => {
    await fs.writeFile(path.join(repoRoot, ".env.local"), "SECRET=123", "utf8");

    await expect(codeAnalyzerTool.invoke({ targetPath: ".env.local" })).rejects.toThrow(
      'Acceso denegado: el archivo ".env.local" puede contener credenciales.',
    );
  });

  it("code_analyzer construye el contrato normalizado", async () => {
    const raw = await codeAnalyzerTool.invoke({ targetPath: "." });
    const analysis = JSON.parse(raw) as NormalizedAnalysis;

    expect(analysis.stats.totalFiles).toBe(2);
    expect(analysis.files.some((file) => file.path === "a.ts")).toBe(true);
    expect(analysis.files.some((file) => file.path === "b.ts")).toBe(true);
    expect(analysis.files.find((file) => file.path === "a.ts")?.dependencies[0]?.target).toBe("b.ts");
    expect(analysis.files.find((file) => file.path === "a.ts")?.symbols.some((symbol) => symbol.name === "one")).toBe(
      true,
    );
  });

  it("diagram_generator crea nodos y flechas con el contrato", async () => {
    const raw = await codeAnalyzerTool.invoke({ targetPath: "." });
    const analysis = JSON.parse(raw) as NormalizedAnalysis;
    const diagramRaw = await diagramGeneratorTool.invoke({ analysis });
    const diagram = JSON.parse(diagramRaw) as {
      elements: Array<{ type: string }>;
      metadata: { includedFiles: string[] };
    };

    expect(diagram.elements.some((element) => element.type === "rectangle")).toBe(true);
    expect(diagram.elements.some((element) => element.type === "arrow")).toBe(true);
    expect(diagram.metadata.includedFiles).toContain("a.ts");
  });

  it("flow_explainer describe el flujo desde analisis compartido", async () => {
    const raw = await codeAnalyzerTool.invoke({ targetPath: "." });
    const analysis = JSON.parse(raw) as NormalizedAnalysis;
    const flowRaw = await flowExplainerTool.invoke({ analysis, functionName: "one" });
    const flow = JSON.parse(flowRaw) as { found: boolean; steps: string[]; filePath: string };

    expect(flow.found).toBe(true);
    expect(flow.filePath).toBe("a.ts");
    expect(flow.steps.length).toBeGreaterThan(0);
  });
});
