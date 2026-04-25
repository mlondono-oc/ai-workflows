import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { codeAnalyzerTool } from "../src/agent/tools/codeAnalyzer.js";
import { diagramGeneratorTool } from "../src/agent/tools/diagramGenerator.js";
import { flowExplainerTool } from "../src/agent/tools/flowExplainer.js";
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
    const raw = await codeAnalyzerTool.invoke({ targetPath: "../" });
    expect(raw).toContain("Error de seguridad [PATH_TRAVERSAL]");
  });

  it("code_analyzer bloquea archivos de credenciales", async () => {
    await fs.writeFile(path.join(repoRoot, ".env.local"), "SECRET=123", "utf8");

    const raw = await codeAnalyzerTool.invoke({ targetPath: ".env.local" });
    expect(raw).toContain("Error de seguridad [PATH_BLOCKED]");
  });

  it("code_analyzer construye el contrato normalizado", async () => {
    const raw = await codeAnalyzerTool.invoke({ targetPath: "." });
    const analysis = JSON.parse(raw) as {
      stats: { totalFiles: number };
      documentation: Array<{ path: string; content: string; truncated: boolean }>;
      files: Array<{
        path: string;
        dependencies: Array<{ target: string }>;
        symbols: Array<{ name: string }>;
      }>;
    };

    expect(analysis.stats.totalFiles).toBe(2);
    expect(Array.isArray(analysis.documentation)).toBe(true);
    expect(analysis.files.some((file) => file.path === "a.ts")).toBe(true);
    expect(analysis.files.some((file) => file.path === "b.ts")).toBe(true);
    expect(analysis.files.find((file) => file.path === "a.ts")?.dependencies[0]?.target).toBe("b.ts");
    expect(analysis.files.find((file) => file.path === "a.ts")?.symbols.some((symbol) => symbol.name === "one")).toBe(
      true,
    );
  });

  it("diagram_generator crea nodos y flechas con el contrato", async () => {
    const diagramRaw = await diagramGeneratorTool.invoke({ targetPath: "." });
    const diagram = JSON.parse(diagramRaw) as {
      elements: Array<{ type: string }>;
      metadata: { totalFiles: number };
    };

    expect(diagram.elements.some((element) => element.type === "rectangle")).toBe(true);
    expect(diagram.elements.some((element) => element.type === "arrow")).toBe(true);
    expect(diagram.metadata.totalFiles).toBeGreaterThan(0);
  });

  it("flow_explainer describe el flujo desde analisis compartido", async () => {
    const flowRaw = await flowExplainerTool.invoke({ targetPath: ".", functionName: "one" });
    const flow = JSON.parse(flowRaw) as { found: boolean; functionBody: string | null; filePath: string };

    expect(flow.found).toBe(true);
    expect(flow.filePath).toBe("a.ts");
    expect(flow.functionBody).toBeDefined();
  });
});
