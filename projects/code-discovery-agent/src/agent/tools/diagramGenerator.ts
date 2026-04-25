import { tool } from "@langchain/core/tools";
import path from "node:path";
import { promises as fs } from "node:fs";
import { z } from "zod";
import { getEnv } from "../../config/env.js";
import { buildAnalysis } from "./shared/analysis.js";
import type { ExcalidrawDiagram, ExcalidrawElement } from "../types/diagram.js";
import type { NormalizedAnalysis } from "../types/normalizedAnalysis.js";

const inputSchema = z.object({
  targetPath: z
    .string()
    .default(".")
    .describe("Ruta relativa del archivo o directorio a analizar dentro del repo."),
  mermaidContent: z
    .string()
    .min(1)
    .optional()
    .describe(
      "Contenido Mermaid (ej: un sequenceDiagram) generado por el LLM. Si se proporciona, se guarda como artefacto Markdown directamente sin analizar el codigo.",
    ),
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

function createTextElement(id: string, x: number, y: number, text: string): ExcalidrawElement {
  const now = Date.now();
  return {
    id,
    type: "text",
    x,
    y,
    width: 260,
    height: 40,
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
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
    text,
    fontSize: 15,
    fontFamily: 1,
    textAlign: "left",
    verticalAlign: "middle",
    baseline: 18,
    lineHeight: 1.2,
    containerId: null,
    originalText: text,
  };
}

function shortPathLabel(filePath: string): string {
  const parts = filePath.split("/");
  if (parts.length <= 3) {
    return filePath;
  }
  return `.../${parts.slice(-3).join("/")}`;
}

type NodeGroup = "Frontend" | "Backend" | "Data" | "Other";

interface ModuleNode {
  key: string;
  label: string;
  group: NodeGroup;
  fileCount: number;
  symbolCount: number;
  dependencyCount: number;
}

interface ModuleEdge {
  source: string;
  target: string;
  weight: number;
}

interface ArchitectureGraph {
  nodes: ModuleNode[];
  edges: ModuleEdge[];
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function inferModule(filePath: string): { key: string; label: string; group: NodeGroup } {
  const parts = filePath.split("/");

  const frontendIndex = parts.indexOf("frontend");
  if (frontendIndex >= 0) {
    const srcIndex = parts.indexOf("src", frontendIndex);
    const section = srcIndex >= 0 ? (parts[srcIndex + 1] ?? "app") : (parts[frontendIndex + 1] ?? "app");
    return {
      key: `frontend:${section}`,
      label: `Frontend / ${section}`,
      group: "Frontend",
    };
  }

  const backendIndex = parts.lastIndexOf("backend");
  if (backendIndex >= 0) {
    const section = parts[backendIndex + 1] ?? "app";
    return {
      key: `backend:${section}`,
      label: `Backend / ${section}`,
      group: "Backend",
    };
  }

  if (parts.includes("supabase") || parts.includes("migrations")) {
    return {
      key: "data:supabase",
      label: "Data / supabase",
      group: "Data",
    };
  }

  const fallback = shortPathLabel(filePath);
  return {
    key: `other:${filePath}`,
    label: `Other / ${fallback}`,
    group: "Other",
  };
}

function buildArchitectureGraph(analysis: NormalizedAnalysis): ArchitectureGraph {
  const moduleMap = new Map<string, ModuleNode>();
  const fileToModule = new Map<string, string>();

  for (const file of analysis.files) {
    const inferred = inferModule(file.path);
    fileToModule.set(file.path, inferred.key);

    const existing = moduleMap.get(inferred.key);
    if (existing) {
      existing.fileCount += 1;
      existing.symbolCount += file.symbols.length;
      existing.dependencyCount += file.dependencies.length;
    } else {
      moduleMap.set(inferred.key, {
        key: inferred.key,
        label: inferred.label,
        group: inferred.group,
        fileCount: 1,
        symbolCount: file.symbols.length,
        dependencyCount: file.dependencies.length,
      });
    }
  }

  const rankedNodes = [...moduleMap.values()]
    .sort(
      (a, b) =>
        b.fileCount + b.symbolCount + b.dependencyCount - (a.fileCount + a.symbolCount + a.dependencyCount),
    )
    .slice(0, 14);
  const includedNodeKeys = new Set(rankedNodes.map((node) => node.key));

  const edgeWeightMap = new Map<string, number>();
  for (const file of analysis.files) {
    const sourceModule = fileToModule.get(file.path);
    if (!sourceModule || !includedNodeKeys.has(sourceModule)) {
      continue;
    }

    for (const dependency of file.dependencies) {
      const targetModule = fileToModule.get(dependency.target);
      if (!targetModule || !includedNodeKeys.has(targetModule) || sourceModule === targetModule) {
        continue;
      }

      const key = `${sourceModule}->${targetModule}`;
      edgeWeightMap.set(key, (edgeWeightMap.get(key) ?? 0) + 1);
    }
  }

  const edges = [...edgeWeightMap.entries()]
    .map(([key, weight]) => {
      const [source, target] = key.split("->");
      return { source, target, weight };
    })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 24);

  return { nodes: rankedNodes, edges };
}

function buildSvgDiagram(graph: ArchitectureGraph): string {
  const width = 1500;
  const colX: Record<NodeGroup, number> = {
    Frontend: 80,
    Backend: 430,
    Data: 780,
    Other: 1130,
  };
  const counters: Record<NodeGroup, number> = {
    Frontend: 0,
    Backend: 0,
    Data: 0,
    Other: 0,
  };
  const rowHeight = 120;
  const nodeWidth = 300;
  const nodeHeight = 84;

  const nodePos = new Map<string, { x: number; y: number }>();
  for (const node of graph.nodes) {
    const x = colX[node.group];
    const y = 80 + counters[node.group] * rowHeight;
    counters[node.group] += 1;
    nodePos.set(node.key, { x, y });
  }

  const maxRows = Math.max(...Object.values(counters), 1);
  const height = 140 + maxRows * rowHeight;

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
  );
  parts.push("<defs><marker id=\"arrow\" markerWidth=\"10\" markerHeight=\"8\" refX=\"10\" refY=\"4\" orient=\"auto\"><path d=\"M0,0 L10,4 L0,8 Z\" fill=\"#4b5563\"/></marker></defs>");
  parts.push('<rect width="100%" height="100%" fill="#ffffff"/>');
  parts.push('<text x="60" y="36" font-size="22" font-family="Arial, sans-serif" fill="#111827">Architecture Diagram</text>');

  for (const edge of graph.edges) {
    const source = nodePos.get(edge.source);
    const target = nodePos.get(edge.target);
    if (!source || !target) {
      continue;
    }
    const x1 = source.x + nodeWidth;
    const y1 = source.y + nodeHeight / 2;
    const x2 = target.x;
    const y2 = target.y + nodeHeight / 2;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 - 6;

    parts.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arrow)"/>`,
    );
    parts.push(
      `<text x="${midX}" y="${midY}" text-anchor="middle" font-size="11" font-family="Arial, sans-serif" fill="#374151">${edge.weight}</text>`,
    );
  }

  for (const node of graph.nodes) {
    const pos = nodePos.get(node.key);
    if (!pos) {
      continue;
    }
    const fill =
      node.group === "Frontend"
        ? "#e0f2fe"
        : node.group === "Backend"
          ? "#dcfce7"
          : node.group === "Data"
            ? "#fef3c7"
            : "#f3f4f6";

    parts.push(
      `<rect x="${pos.x}" y="${pos.y}" width="${nodeWidth}" height="${nodeHeight}" rx="12" ry="12" fill="${fill}" stroke="#111827" stroke-width="1.4"/>`,
    );
    parts.push(
      `<text x="${pos.x + 14}" y="${pos.y + 30}" font-size="14" font-family="Arial, sans-serif" fill="#111827">${escapeXml(node.label)}</text>`,
    );
    parts.push(
      `<text x="${pos.x + 14}" y="${pos.y + 52}" font-size="12" font-family="Arial, sans-serif" fill="#374151">files: ${node.fileCount} | symbols: ${node.symbolCount}</text>`,
    );
  }

  parts.push("</svg>");
  return parts.join("\n");
}

function buildDiagramFromAnalysis(analysis: NormalizedAnalysis): ExcalidrawDiagram {
  const graph = buildArchitectureGraph(analysis);
  const elements: ExcalidrawElement[] = [];

  const colX: Record<NodeGroup, number> = { Frontend: 80, Backend: 430, Data: 780, Other: 1130 };
  const counters: Record<NodeGroup, number> = { Frontend: 0, Backend: 0, Data: 0, Other: 0 };
  const pos = new Map<string, { x: number; y: number }>();

  graph.nodes.forEach((node, index) => {
    const x = colX[node.group];
    const y = 80 + counters[node.group] * 120;
    counters[node.group] += 1;
    pos.set(node.key, { x, y });
    elements.push(createRectangleElement(`module-${index}`, x, y));
    elements.push(createTextElement(`module-label-${index}`, x + 10, y + 16, `${node.label} (${node.fileCount})`));
  });

  graph.edges.forEach((edge, index) => {
    const source = pos.get(edge.source);
    const target = pos.get(edge.target);
    if (!source || !target) {
      return;
    }
    const width = target.x - source.x;
    elements.push(createArrowElement(`edge-${index}`, source.x + 280, source.y + 44, width));
  });

  if (elements.length === 0) {
    elements.push(createRectangleElement("module-root", 80, 120));
  }

  const svg = buildSvgDiagram(graph);

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
    svg,
    moduleNodes: graph.nodes,
    moduleEdges: graph.edges,
  } as ExcalidrawDiagram;
}

export const diagramGeneratorTool = tool(
  async ({ targetPath, mermaidContent }) => {
    const env = getEnv();
    const timestamp = Date.now();
    const artifactDir = path.join(env.AGENT_REPO_ROOT, ".artifacts", "diagrams");
    await fs.mkdir(artifactDir, { recursive: true });

    // If the LLM provides Mermaid content directly, persist it and return the path
    if (mermaidContent) {
      // Strip any existing ```mermaid ... ``` fences the LLM may have included
      const stripped = mermaidContent
        .replace(/^```mermaid\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();
      const markdownFile = `diagram-${timestamp}.md`;
      const htmlFile = `diagram-${timestamp}.html`;
      const markdownAbsPath = path.join(artifactDir, markdownFile);
      const htmlAbsPath = path.join(artifactDir, htmlFile);

      const markdown = ["# Diagrama de Secuencia", "", "```mermaid", stripped, "```"].join("\n");
      await fs.writeFile(markdownAbsPath, markdown, "utf8");

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diagrama</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body { font-family: sans-serif; padding: 2rem; background: #fff; }
    .mermaid { max-width: 100%; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="mermaid">
${stripped}
  </div>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'default' });</script>
</body>
</html>`;
      await fs.writeFile(htmlAbsPath, html, "utf8");

      return JSON.stringify(
        {
          type: "mermaid",
          artifacts: {
            markdown: path.relative(env.AGENT_REPO_ROOT, markdownAbsPath),
            html: path.relative(env.AGENT_REPO_ROOT, htmlAbsPath),
          },
        },
        null,
        2,
      );
    }

    const analysis = await buildAnalysis(targetPath);
    const enriched = buildDiagramFromAnalysis(analysis) as ExcalidrawDiagram & {
      svg: string;
      moduleNodes: Array<{ label: string }>;
      moduleEdges: Array<{ source: string; target: string; weight: number }>;
    };
    const { svg, moduleNodes, moduleEdges, ...diagram } = enriched;

    const excalidrawFile = `diagram-${timestamp}.excalidraw.json`;
    const svgFile = `diagram-${timestamp}.svg`;
    const markdownFile = `diagram-${timestamp}.md`;
    const excalidrawAbsPath = path.join(artifactDir, excalidrawFile);
    const svgAbsPath = path.join(artifactDir, svgFile);
    const markdownAbsPath = path.join(artifactDir, markdownFile);

    await fs.writeFile(excalidrawAbsPath, JSON.stringify(diagram, null, 2), "utf8");
    await fs.writeFile(svgAbsPath, svg, "utf8");

    const markdown = [
      "# Diagrama de Arquitectura",
      "",
      `![Diagrama SVG](./${svgFile})`,
      "",
      "## Resumen",
      `- Modulos: ${moduleNodes.length}`,
      `- Relaciones: ${moduleEdges.length}`,
      "",
      "## Modulos incluidos",
      ...moduleNodes.map((node) => `- ${node.label}`),
    ].join("\n");
    await fs.writeFile(markdownAbsPath, markdown, "utf8");

    return JSON.stringify(
      {
        ...diagram,
        metadata: {
          totalFiles: analysis.stats.totalFiles,
          totalSymbols: analysis.stats.totalSymbols,
          totalDependencies: analysis.stats.totalDependencies,
          moduleCount: moduleNodes.length,
          relationCount: moduleEdges.length,
        },
        artifacts: {
          excalidraw: path.relative(env.AGENT_REPO_ROOT, excalidrawAbsPath),
          svg: path.relative(env.AGENT_REPO_ROOT, svgAbsPath),
          markdown: path.relative(env.AGENT_REPO_ROOT, markdownAbsPath),
        },
      },
      null,
      2,
    );
  },
  {
    name: "diagram_generator",
    description:
      "Persiste diagramas como artefactos. Modo 1: proporciona mermaidContent (un sequenceDiagram u otro bloque Mermaid generado por ti) para guardarlo como .md. Modo 2: proporciona targetPath para generar un diagrama de arquitectura de modulos a partir del analisis del codigo.",
    schema: inputSchema,
  },
);
