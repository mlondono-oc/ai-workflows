import { tool } from "@langchain/core/tools";
import path from "node:path";
import { promises as fs } from "node:fs";
import { z } from "zod";
import { getEnv } from "../../config/env.js";
import { validatePath } from "../guardrails/validatePath.js";
import type { AnalyzedFile, FileDependency, NormalizedSymbol } from "../types/normalizedAnalysis.js";
import type { NormalizedAnalysis } from "../types/normalizedAnalysis.js";

const inputSchema = z.object({
  targetPath: z
    .string()
    .default(".")
    .describe("Ruta relativa del archivo o directorio a analizar dentro del repo."),
});

const SUPPORTED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".py",
  ".go",
  ".java",
  ".rb",
  ".php",
]);

const IGNORE_DIRECTORIES = new Set([".git", "node_modules", "dist", "build", ".next", ".cursor"]);

const symbolMatchers: Array<{
  kind: NormalizedSymbol["kind"];
  regex: RegExp;
}> = [
  { kind: "function", regex: /\b(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g },
  { kind: "class", regex: /\b(?:export\s+)?class\s+([A-Za-z_$][\w$]*)/g },
  { kind: "interface", regex: /\b(?:export\s+)?interface\s+([A-Za-z_$][\w$]*)/g },
  { kind: "type", regex: /\b(?:export\s+)?type\s+([A-Za-z_$][\w$]*)\s*=/g },
  { kind: "const", regex: /\b(?:export\s+)?const\s+([A-Za-z_$][\w$]*)/g },
  { kind: "variable", regex: /\b(?:export\s+)?(?:let|var)\s+([A-Za-z_$][\w$]*)/g },
];

function toRelativePath(repoRoot: string, absolutePath: string): string {
  return path.relative(repoRoot, absolutePath) || ".";
}

function resolveDependencyTarget(
  repoRoot: string,
  absoluteFilePath: string,
  dependencyTarget: string,
): string {
  if (!dependencyTarget.startsWith(".")) {
    return dependencyTarget;
  }

  const basePath = path.resolve(path.dirname(absoluteFilePath), dependencyTarget);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.jsx`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
    path.join(basePath, "index.js"),
    path.join(basePath, "index.jsx"),
  ];

  for (const candidate of candidates) {
    const ext = path.extname(candidate).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      continue;
    }
    return toRelativePath(repoRoot, candidate);
  }

  return dependencyTarget;
}

function extractDependencies(
  filePath: string,
  absoluteFilePath: string,
  repoRoot: string,
  content: string,
): FileDependency[] {
  const dependencies: FileDependency[] = [];
  const importRegex = /\bimport\s+[\s\S]*?\s+from\s+["']([^"']+)["']/g;
  const dynamicImportRegex = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
  const requireRegex = /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g;

  for (const match of content.matchAll(importRegex)) {
    dependencies.push({
      source: filePath,
      target: resolveDependencyTarget(repoRoot, absoluteFilePath, match[1]),
      type: "import",
    });
  }
  for (const match of content.matchAll(dynamicImportRegex)) {
    dependencies.push({
      source: filePath,
      target: resolveDependencyTarget(repoRoot, absoluteFilePath, match[1]),
      type: "dynamic-import",
    });
  }
  for (const match of content.matchAll(requireRegex)) {
    dependencies.push({
      source: filePath,
      target: resolveDependencyTarget(repoRoot, absoluteFilePath, match[1]),
      type: "require",
    });
  }

  return dependencies;
}

function extractSymbols(content: string, filePath: string): NormalizedSymbol[] {
  const symbols: NormalizedSymbol[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    for (const { kind, regex } of symbolMatchers) {
      regex.lastIndex = 0;
      for (const match of line.matchAll(regex)) {
        const name = match[1];
        if (!name) {
          continue;
        }
        symbols.push({
          name,
          kind,
          exported: /\bexport\b/.test(line),
          locationHint: `${filePath}:${index + 1}`,
        });
      }
    }
  });

  return symbols;
}

async function analyzeFile(absolutePath: string, repoRoot: string): Promise<AnalyzedFile | null> {
  const env = getEnv();
  const stat = await fs.stat(absolutePath);
  if (!stat.isFile() || stat.size > env.AGENT_MAX_FILE_SIZE_BYTES) {
    return null;
  }

  const ext = path.extname(absolutePath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    return null;
  }

  const content = await fs.readFile(absolutePath, "utf8");
  const relativePath = toRelativePath(repoRoot, absolutePath);

  return {
    path: relativePath,
    language: ext.slice(1),
    symbols: extractSymbols(content, relativePath),
    dependencies: extractDependencies(relativePath, absolutePath, repoRoot, content),
  };
}

async function collectFiles(targetAbsolutePath: string, repoRoot: string): Promise<{ files: AnalyzedFile[]; truncated: boolean }> {
  const env = getEnv();
  const files: AnalyzedFile[] = [];
  let truncated = false;

  async function visit(absolutePath: string, depth: number): Promise<void> {
    if (files.length >= env.AGENT_MAX_FILES_PER_ANALYSIS) {
      truncated = true;
      return;
    }

    const stat = await fs.stat(absolutePath);

    if (stat.isFile()) {
      const analyzedFile = await analyzeFile(absolutePath, repoRoot);
      if (analyzedFile) {
        files.push(analyzedFile);
      }
      return;
    }

    if (!stat.isDirectory()) {
      return;
    }

    if (depth > env.AGENT_MAX_DIRECTORY_DEPTH) {
      truncated = true;
      return;
    }

    const entries = await fs.readdir(absolutePath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && IGNORE_DIRECTORIES.has(entry.name)) {
        continue;
      }
      const childPath = path.join(absolutePath, entry.name);
      await visit(childPath, depth + 1);
      if (files.length >= env.AGENT_MAX_FILES_PER_ANALYSIS) {
        truncated = true;
        return;
      }
    }
  }

  await visit(targetAbsolutePath, 0);
  return { files, truncated };
}

async function buildAnalysis(targetPath: string): Promise<NormalizedAnalysis> {
  const env = getEnv();
  const safeTarget = await validatePath(env.AGENT_REPO_ROOT, targetPath);
  const { files, truncated } = await collectFiles(safeTarget, env.AGENT_REPO_ROOT);

  const totalSymbols = files.reduce((acc, file) => acc + file.symbols.length, 0);
  const totalDependencies = files.reduce((acc, file) => acc + file.dependencies.length, 0);

  return {
    metadata: {
      repoRoot: env.AGENT_REPO_ROOT,
      analyzedAt: new Date().toISOString(),
      targetPath: toRelativePath(env.AGENT_REPO_ROOT, safeTarget),
      truncated,
    },
    files,
    stats: {
      totalFiles: files.length,
      totalSymbols,
      totalDependencies,
    },
  };
}

export const codeAnalyzerTool = tool(
  async ({ targetPath }) => {
    const analysis = await buildAnalysis(targetPath);
    return JSON.stringify(analysis, null, 2);
  },
  {
    name: "code_analyzer",
    description:
      "Analiza codigo de forma segura y devuelve un contrato NormalizedAnalysis con archivos, simbolos y dependencias.",
    schema: inputSchema,
  },
);
