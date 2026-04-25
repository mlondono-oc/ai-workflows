export interface DocumentationFile {
  path: string;
  content: string;
  truncated: boolean;
}

export interface NormalizedSymbol {
  name: string;
  kind: "function" | "class" | "interface" | "type" | "const" | "variable" | "unknown";
  exported: boolean;
  locationHint?: string;
}

export interface FileDependency {
  source: string;
  target: string;
  type: "import" | "dynamic-import" | "require" | "unknown";
}

export interface AnalyzedFile {
  path: string;
  language: string;
  symbols: NormalizedSymbol[];
  dependencies: FileDependency[];
}

export interface AnalysisMetadata {
  repoRoot: string;
  analyzedAt: string;
  targetPath: string;
  truncated: boolean;
}

export interface NormalizedAnalysis {
  metadata: AnalysisMetadata;
  documentation: DocumentationFile[];
  files: AnalyzedFile[];
  stats: {
    totalFiles: number;
    totalSymbols: number;
    totalDependencies: number;
  };
}
