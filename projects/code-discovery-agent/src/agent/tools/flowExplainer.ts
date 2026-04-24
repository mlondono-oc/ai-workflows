import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { NormalizedAnalysis } from "../types/normalizedAnalysis.js";

const inputSchema = z.object({
  analysis: z
    .custom<NormalizedAnalysis>()
    .describe("Salida de code_analyzer usada para explicar el flujo."),
  functionName: z.string().min(1).describe("Nombre de la funcion cuyo flujo quieres explicar."),
});

function findFunctionContext(analysis: NormalizedAnalysis, functionName: string) {
  for (const file of analysis.files) {
    for (const symbol of file.symbols) {
      if (symbol.kind === "function" && symbol.name === functionName) {
        return { file, symbol };
      }
    }
  }
  return null;
}

export const flowExplainerTool = tool(
  async ({ analysis, functionName }) => {
    const context = findFunctionContext(analysis, functionName);
    if (!context) {
      return JSON.stringify(
        {
          functionName,
          found: false,
          steps: [],
          note: "La funcion no existe en el analisis normalizado.",
        },
        null,
        2,
      );
    }

    const relatedFunctions = context.file.symbols
      .filter((symbol) => symbol.kind === "function" && symbol.name !== functionName)
      .map((symbol) => symbol.name)
      .slice(0, 3);

    const dependencyTargets = context.file.dependencies.map((dep) => dep.target).slice(0, 5);
    const steps = [
      `La funcion se ubica en ${context.file.path}${context.symbol.locationHint ? ` (${context.symbol.locationHint})` : ""}.`,
      context.symbol.exported
        ? "Esta funcion esta exportada y puede ser usada desde otros modulos."
        : "Esta funcion no esta exportada, por lo que su uso principal es interno al archivo.",
      dependencyTargets.length > 0
        ? `Antes de ejecutar su logica principal depende de modulos como: ${dependencyTargets.join(", ")}.`
        : "No tiene dependencias declaradas en imports o require dentro del archivo.",
      relatedFunctions.length > 0
        ? `Comparte contexto con otras funciones del archivo: ${relatedFunctions.join(", ")}.`
        : "No se detectaron otras funciones cercanas en el mismo archivo para delegar logica.",
    ];

    return JSON.stringify(
      {
        functionName,
        found: true,
        filePath: context.file.path,
        locationHint: context.symbol.locationHint,
        exported: context.symbol.exported,
        dependencies: dependencyTargets,
        collaboratorFunctions: relatedFunctions,
        steps,
      },
      null,
      2,
    );
  },
  {
    name: "flow_explainer",
    description:
      "Explica el flujo de una funcion usando solo los simbolos y archivos de NormalizedAnalysis.",
    schema: inputSchema,
  },
);
