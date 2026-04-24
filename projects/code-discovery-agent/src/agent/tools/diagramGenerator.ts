import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getEnv } from "../../config/env.js";
import type { ExcalidrawDiagram, ExcalidrawElement } from "../types/diagram.js";
import type { NormalizedAnalysis } from "../types/normalizedAnalysis.js";

const inputSchema = z.object({
  analysis: z
    .custom<NormalizedAnalysis>()
    .describe("Salida normalizada de code_analyzer usada como fuente de verdad."),
});

function createRectangleElement(id: string, x: number, y: number): ExcalidrawElement {
  const now = Date.now();
  return {
    id,
    type: "rectangle",
    x,
    y,
    width: 280,
    height: 110,
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "#f8f9fa",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    seed: 1,
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    groupIds: [],
    roundness: null,
    boundElements: null,
    updated: now,
    link: null,
    locked: false,
  };
}

function createArrowElement(id: string, x: number, y: number, width: number): ExcalidrawElement {
  const now = Date.now();
  return {
    id,
    type: "arrow",
    x,
    y,
    width,
    height: 0,
    angle: 0,
    strokeColor: "#495057",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    seed: 1,
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    groupIds: [],
    roundness: null,
    boundElements: null,
    updated: now,
    link: null,
    locked: false,
  };
}

function buildDiagramFromAnalysis(analysis: NormalizedAnalysis): ExcalidrawDiagram {
  const env = getEnv();
  const maxNodes = Math.max(1, Math.min(analysis.files.length, env.AGENT_MAX_FILES_PER_ANALYSIS));
  const includedFiles = analysis.files.slice(0, maxNodes);
  const includedFilePaths = new Set(includedFiles.map((file) => file.path));
  const elements: ExcalidrawElement[] = [];

  const nodePosition = new Map<string, { x: number; y: number }>();
  includedFiles.forEach((file, index) => {
    const x = 120 + (index % 3) * 360;
    const y = 120 + Math.floor(index / 3) * 220;
    nodePosition.set(file.path, { x, y });
    elements.push(createRectangleElement(`file-${index}`, x, y));
  });

  let arrowIndex = 0;
  for (const file of includedFiles) {
    const sourcePos = nodePosition.get(file.path);
    if (!sourcePos) {
      continue;
    }

    for (const dependency of file.dependencies) {
      if (!includedFilePaths.has(dependency.target)) {
        continue;
      }
      const targetPos = nodePosition.get(dependency.target);
      if (!targetPos) {
        continue;
      }

      const width = targetPos.x - sourcePos.x;
      elements.push(createArrowElement(`dependency-${arrowIndex}`, sourcePos.x + 280, sourcePos.y + 55, width));
      arrowIndex += 1;
    }
  }

  if (elements.length === 0) {
    elements.push(createRectangleElement("module-root", 80, 120));
  }

  return {
    type: "excalidraw",
    version: 2,
    source: "code-discovery-agent",
    elements,
    appState: {
      viewBackgroundColor: "#ffffff",
      currentItemStrokeColor: "#1e1e1e",
      currentItemBackgroundColor: "#f8f9fa",
      currentItemFillStyle: "solid",
      currentItemStrokeWidth: 2,
      currentItemStrokeStyle: "solid",
      currentItemRoughness: 0,
      currentItemOpacity: 100,
      currentItemFontFamily: 1,
      currentItemFontSize: 20,
      currentItemTextAlign: "left",
      currentItemStrokeSharpness: "sharp",
      currentItemStartArrowhead: null,
      currentItemEndArrowhead: "arrow",
    },
    files: {},
  };
}

export const diagramGeneratorTool = tool(
  async ({ analysis }) => {
    const diagram = buildDiagramFromAnalysis(analysis);
    return JSON.stringify(
      {
        ...diagram,
        metadata: {
          totalFiles: analysis.stats.totalFiles,
          totalSymbols: analysis.stats.totalSymbols,
          totalDependencies: analysis.stats.totalDependencies,
          includedFiles: analysis.files.slice(0, diagram.elements.filter((e) => e.type === "rectangle").length).map((file) => file.path),
        },
      },
      null,
      2,
    );
  },
  {
    name: "diagram_generator",
    description:
      "Construye un diagrama JSON compatible con Excalidraw a partir del contrato NormalizedAnalysis.",
    schema: inputSchema,
  },
);
