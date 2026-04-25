import { tool } from "@langchain/core/tools";
import path from "node:path";
import { promises as fs } from "node:fs";
import { z } from "zod";
import { getEnv } from "../../config/env.js";
import { buildAnalysis } from "./shared/analysis.js";
import type { NormalizedAnalysis } from "../types/normalizedAnalysis.js";

const inputSchema = z.object({
  targetPath: z
    .string()
    .default(".")
    .describe("Ruta relativa del archivo o directorio a analizar dentro del repo."),
  functionName: z.string().min(1).optional().describe("Nombre de la funcion cuyo flujo quieres explicar."),
});

function isCallableSymbol(kind: string): boolean {
  return kind === "function" || kind === "const" || kind === "variable";
}

function findFunctionContext(analysis: NormalizedAnalysis, functionName: string) {
  for (const file of analysis.files) {
    for (const symbol of file.symbols) {
      if (isCallableSymbol(symbol.kind) && symbol.name === functionName) {
        return { file, symbol };
      }
    }
  }
  return null;
}

function collectExportedFunctions(analysis: NormalizedAnalysis): Array<{
  name: string;
  filePath: string;
  locationHint?: string;
}> {
  return analysis.files.flatMap((file) =>
    file.symbols
      .filter((symbol) => isCallableSymbol(symbol.kind) && symbol.exported)
      .map((symbol) => ({
        name: symbol.name,
        filePath: file.path,
        locationHint: symbol.locationHint,
      })),
  );
}

async function readFunctionBody(filePath: string, functionName: string): Promise<string | null> {
  try {
    const env = getEnv();
    const absPath = path.resolve(env.AGENT_REPO_ROOT, filePath);
    const source = await fs.readFile(absPath, "utf8");
    const lines = source.split("\n");

    // Find the declaration line
    const pattern = new RegExp(
      `(?:export\\s+)?(?:async\\s+)?(?:function\\s+${escapeRegex(functionName)}\\b|(?:const|let|var)\\s+${escapeRegex(functionName)}\\s*=|(?:async\\s+)?def\\s+${escapeRegex(functionName)}\\s*\\()`,
    );
    let startLine = -1;
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        startLine = i;
        break;
      }
    }
    if (startLine === -1) return null;

    // Brace-count extraction
    let depth = 0;
    let foundOpen = false;
    let endLine = startLine;
    for (let i = startLine; i < lines.length; i++) {
      for (const char of lines[i]) {
        if (char === "{") { depth++; foundOpen = true; }
        else if (char === "}") { depth--; }
      }
      endLine = i;
      if (foundOpen && depth === 0) break;
    }
    return lines.slice(startLine, endLine + 1).join("\n");
  } catch {
    return null;
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const flowExplainerTool = tool(
  async ({ targetPath, functionName }) => {
    const analysis = await buildAnalysis(targetPath);
    const exportedFunctions = collectExportedFunctions(analysis);

    if (!functionName) {
      return JSON.stringify(
        {
          functionName: null,
          found: false,
          note: "Proporciona functionName para explicar el flujo concreto. Usa availableFunctions para elegir.",
          availableFunctions: exportedFunctions,
        },
        null,
        2,
      );
    }

    const context = findFunctionContext(analysis, functionName);
    if (!context) {
      return JSON.stringify(
        {
          functionName,
          found: false,
          note: "La funcion no se encontro en el analisis. Puede estar definida como arrow function exportada — intenta con file_reader para buscarla manualmente.",
          availableFunctions: exportedFunctions,
        },
        null,
        2,
      );
    }

    const relatedFunctions = context.file.symbols
      .filter((symbol) => isCallableSymbol(symbol.kind) && symbol.name !== functionName)
      .map((symbol) => symbol.name)
      .slice(0, 5);

    const dependencyTargets = context.file.dependencies.map((dep) => dep.target).slice(0, 8);
    const functionBody = await readFunctionBody(context.file.path, functionName);

    return JSON.stringify(
      {
        functionName,
        found: true,
        filePath: context.file.path,
        locationHint: context.symbol.locationHint,
        exported: context.symbol.exported,
        symbolKind: context.symbol.kind,
        dependencies: dependencyTargets,
        collaboratorFunctions: relatedFunctions,
        functionBody: functionBody ?? "No se pudo extraer el cuerpo. Usa file_reader con este filePath y functionName para leerlo directamente.",
      },
      null,
      2,
    );
  },
  {
    name: "flow_explainer",
    description:
      "Explica el flujo de una funcion analizando una ruta segura y listando funciones exportadas cuando falte contexto.",
    schema: inputSchema,
  },
);
