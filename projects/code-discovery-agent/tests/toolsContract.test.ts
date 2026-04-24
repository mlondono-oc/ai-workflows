import { describe, expect, it } from "vitest";
import { codeAnalyzerTool } from "../src/agent/tools/codeAnalyzer.js";
import { diagramGeneratorTool } from "../src/agent/tools/diagramGenerator.js";
import { flowExplainerTool } from "../src/agent/tools/flowExplainer.js";
import type { NormalizedAnalysis } from "../src/agent/types/normalizedAnalysis.js";

function createEmptyAnalysis(): NormalizedAnalysis {
  return {
    metadata: {
      repoRoot: "/repo",
      analyzedAt: new Date().toISOString(),
      targetPath: ".",
      truncated: false,
    },
    files: [],
    stats: {
      totalFiles: 0,
      totalSymbols: 0,
      totalDependencies: 0,
    },
  };
}

describe("tools contract stubs", () => {
  it("code_analyzer devuelve un NormalizedAnalysis valido", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    const response = await codeAnalyzerTool.invoke({ targetPath: "src" });
    const parsed = JSON.parse(response) as NormalizedAnalysis;

    expect(parsed.metadata.targetPath).toBe("src");
    expect(parsed.stats.totalFiles).toBeGreaterThan(0);
    expect(Array.isArray(parsed.files)).toBe(true);
  });

  it("diagram_generator devuelve JSON compatible con Excalidraw", async () => {
    const response = await diagramGeneratorTool.invoke({ analysis: createEmptyAnalysis() });
    const parsed = JSON.parse(response) as { type: string; elements: unknown[] };

    expect(parsed.type).toBe("excalidraw");
    expect(Array.isArray(parsed.elements)).toBe(true);
    expect(parsed.elements.length).toBeGreaterThan(0);
  });

  it("flow_explainer maneja funcion faltante sin romper", async () => {
    const response = await flowExplainerTool.invoke({
      analysis: createEmptyAnalysis(),
      functionName: "procesarPago",
    });
    const parsed = JSON.parse(response) as { found: boolean; steps: unknown[] };

    expect(parsed.found).toBe(false);
    expect(parsed.steps).toEqual([]);
  });
});
