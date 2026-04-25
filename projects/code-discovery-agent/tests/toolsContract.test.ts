import { describe, expect, it } from "vitest";
import { codeAnalyzerTool } from "../src/agent/tools/codeAnalyzer.js";
import { diagramGeneratorTool } from "../src/agent/tools/diagramGenerator.js";
import { flowExplainerTool } from "../src/agent/tools/flowExplainer.js";
import type { NormalizedAnalysis } from "../src/agent/types/normalizedAnalysis.js";

describe("tools contract stubs", () => {
  it("code_analyzer devuelve un NormalizedAnalysis valido", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.AGENT_REPO_ROOT = process.cwd();
    const response = await codeAnalyzerTool.invoke({ targetPath: "src" });
    const parsed = JSON.parse(response) as NormalizedAnalysis;

    expect(parsed.metadata.targetPath).toBe("src");
    expect(parsed.stats.totalFiles).toBeGreaterThan(0);
    expect(Array.isArray(parsed.files)).toBe(true);
    expect(Array.isArray(parsed.documentation)).toBe(true);
  });

  it("diagram_generator devuelve JSON compatible con Excalidraw", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.AGENT_REPO_ROOT = process.cwd();
    const response = await diagramGeneratorTool.invoke({ targetPath: "src" });
    const parsed = JSON.parse(response) as { type: string; elements: unknown[] };

    expect(parsed.type).toBe("excalidraw");
    expect(Array.isArray(parsed.elements)).toBe(true);
    expect(parsed.elements.length).toBeGreaterThan(0);
  });

  it("flow_explainer maneja funcion faltante sin romper", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.AGENT_REPO_ROOT = process.cwd();
    const response = await flowExplainerTool.invoke({
      targetPath: "src",
      functionName: "procesarPago",
    });
    const parsed = JSON.parse(response) as { found: boolean; availableFunctions: unknown[] };

    expect(parsed.found).toBe(false);
    expect(Array.isArray(parsed.availableFunctions)).toBe(true);
  });
});
