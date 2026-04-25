import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { GuardrailError } from "../guardrails/GuardrailError.js";
import { buildAnalysis } from "./shared/analysis.js";

const inputSchema = z.object({
  targetPath: z
    .string()
    .default(".")
    .describe("Ruta relativa del archivo o directorio a analizar dentro del repo."),
});

export const codeAnalyzerTool = tool(
  async ({ targetPath }) => {
    try {
      const analysis = await buildAnalysis(targetPath);
      return JSON.stringify(analysis, null, 2);
    } catch (error) {
      if (error instanceof GuardrailError) {
        return `Error de seguridad [${error.code}]: ${error.message}`;
      }
      return `Error al analizar el codigo: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "code_analyzer",
    description:
      "Analiza un directorio del repositorio. Devuelve: lista de archivos con simbolos y dependencias, y el contenido completo de toda la documentacion encontrada (README, briefs, specs, .md, .txt). Usa este tool primero para orientarte sobre cualquier proyecto — la documentacion ya viene incluida en el output.",
    schema: inputSchema,
  },
);
