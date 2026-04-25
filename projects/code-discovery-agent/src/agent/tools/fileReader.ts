import { tool } from "@langchain/core/tools";
import path from "node:path";
import { promises as fs } from "node:fs";
import { z } from "zod";
import { getEnv } from "../../config/env.js";
import { validatePath } from "../guardrails/validatePath.js";
import { GuardrailError } from "../guardrails/GuardrailError.js";

const inputSchema = z.object({
  filePath: z
    .string()
    .min(1)
    .describe("Ruta relativa del archivo a leer dentro del repo (ej: projects/image-link/backend/backend/main.py)."),
  functionName: z
    .string()
    .min(1)
    .optional()
    .describe(
      "Nombre de la funcion o metodo cuyo cuerpo quieres extraer. Si se omite, devuelve el archivo completo.",
    ),
});

/**
 * Attempts to extract the body of a named function from source text.
 * Works for TypeScript/JavaScript (function/arrow/method) and Python (def/async def).
 * Returns { lineStart, lineEnd, content } or null if not found.
 */
function extractFunctionBody(
  source: string,
  functionName: string,
  language: "ts" | "js" | "py" | "other",
): { lineStart: number; lineEnd: number; content: string } | null {
  const lines = source.split("\n");

  if (language === "py") {
    // Python: find `def functionName(` or `async def functionName(`
    const defPattern = new RegExp(`^(async\\s+)?def\\s+${escapeRegex(functionName)}\\s*\\(`);
    let startLine = -1;
    let baseIndent = -1;

    for (let i = 0; i < lines.length; i++) {
      if (defPattern.test(lines[i].trim()) && lines[i].search(/\S/) >= 0) {
        startLine = i;
        baseIndent = lines[i].search(/\S/);
        break;
      }
    }

    if (startLine === -1) return null;

    // Collect until we find a line at the same or lesser indentation (non-empty, non-comment)
    let endLine = startLine;
    for (let i = startLine + 1; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed === "" || trimmed.startsWith("#")) {
        endLine = i;
        continue;
      }
      const indent = lines[i].search(/\S/);
      if (indent <= baseIndent) {
        break;
      }
      endLine = i;
    }

    return {
      lineStart: startLine + 1,
      lineEnd: endLine + 1,
      content: lines.slice(startLine, endLine + 1).join("\n"),
    };
  }

  // TypeScript / JavaScript: brace counting
  // Matches: function name(, const name = (, const name=(, async function name(,
  //          name(  [method shorthand],  name = async (
  const tsPattern = new RegExp(
    `(?:export\\s+)?(?:async\\s+)?(?:function\\s+${escapeRegex(functionName)}\\b|(?:const|let|var)\\s+${escapeRegex(functionName)}\\s*=|${escapeRegex(functionName)}\\s*(?:=\\s*(?:async\\s+)?(?:\\(|function)|\\())`,
  );

  let startLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (tsPattern.test(lines[i])) {
      startLine = i;
      break;
    }
  }

  if (startLine === -1) return null;

  // Count braces from the start line until balanced
  let depth = 0;
  let foundOpen = false;
  let endLine = startLine;

  for (let i = startLine; i < lines.length; i++) {
    for (const char of lines[i]) {
      if (char === "{") {
        depth++;
        foundOpen = true;
      } else if (char === "}") {
        depth--;
      }
    }
    endLine = i;
    if (foundOpen && depth === 0) break;
  }

  // Arrow functions with expression body (no braces): grab to end of statement
  if (!foundOpen) {
    // Find the end of the arrow expression (next semicolon or newline after =>)
    for (let i = startLine; i < Math.min(startLine + 5, lines.length); i++) {
      endLine = i;
      if (lines[i].trim().endsWith(";") || lines[i].trim().endsWith(",")) break;
    }
  }

  return {
    lineStart: startLine + 1,
    lineEnd: endLine + 1,
    content: lines.slice(startLine, endLine + 1).join("\n"),
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function detectLanguage(filePath: string): "ts" | "js" | "py" | "other" {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".ts" || ext === ".tsx") return "ts";
  if (ext === ".js" || ext === ".jsx" || ext === ".mjs" || ext === ".cjs") return "js";
  if (ext === ".py") return "py";
  return "other";
}

export const fileReaderTool = tool(
  async ({ filePath, functionName }) => {
    try {
      const env = getEnv();
      const resolvedPath = await validatePath(env.AGENT_REPO_ROOT, filePath);

      const stat = await fs.stat(resolvedPath);
      if (stat.isDirectory()) {
        return JSON.stringify(
          { error: "La ruta es un directorio. Proporciona la ruta de un archivo concreto." },
          null,
          2,
        );
      }

      if (stat.size > env.AGENT_MAX_FILE_SIZE_BYTES) {
        return JSON.stringify(
          {
            error: `El archivo supera el limite de ${env.AGENT_MAX_FILE_SIZE_BYTES} bytes y no puede leerse completo.`,
            filePath,
            sizeBytes: stat.size,
          },
          null,
          2,
        );
      }

      const source = await fs.readFile(resolvedPath, "utf8");
      const language = detectLanguage(resolvedPath);
      const relativeFilePath = path.relative(env.AGENT_REPO_ROOT, resolvedPath);

      if (!functionName) {
        const lines = source.split("\n");
        return JSON.stringify(
          {
            filePath: relativeFilePath,
            language,
            totalLines: lines.length,
            content: source,
          },
          null,
          2,
        );
      }

      const extracted = extractFunctionBody(source, functionName, language);
      if (!extracted) {
        return JSON.stringify(
          {
            filePath: relativeFilePath,
            language,
            functionName,
            found: false,
            note: `No se encontro la funcion "${functionName}" en el archivo. Verifica el nombre exacto o usa code_analyzer para listar los simbolos del archivo.`,
          },
          null,
          2,
        );
      }

      return JSON.stringify(
        {
          filePath: relativeFilePath,
          language,
          functionName,
          found: true,
          lineStart: extracted.lineStart,
          lineEnd: extracted.lineEnd,
          functionBody: extracted.content,
        },
        null,
        2,
      );
    } catch (error) {
      if (error instanceof GuardrailError) {
        return `Error de seguridad [${error.code}]: ${error.message}`;
      }
      return `Error al leer el archivo: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "file_reader",
    description:
      "Lee el contenido completo de un archivo o extrae el cuerpo de una funcion especifica. Usa esta herramienta para entender que hace realmente el codigo antes de explicarlo. Es obligatorio usarla antes de hacer afirmaciones sobre la logica interna de una funcion.",
    schema: inputSchema,
  },
);
