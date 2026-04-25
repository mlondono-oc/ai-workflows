import { GuardrailError } from "./GuardrailError.js";

const DEFAULT_SUSPICIOUS_PATTERNS = [
  /ignore\s+(previous|all)\s+instructions/i,
  /you\s+are\s+now/i,
  /system\s*:\s*/i,
  /\bact\s+as\b/i,
];

export interface ValidateInputOptions {
  maxInputLength: number;
  enableInputFilter: boolean;
  suspiciousPatterns?: RegExp[];
}

export function validateInput(input: string, options: ValidateInputOptions): string {
  const normalizedInput = input.trim();

  if (!normalizedInput) {
    throw new GuardrailError("INPUT_EMPTY", "La entrada no puede estar vacia.");
  }

  if (!options.enableInputFilter) {
    return normalizedInput;
  }

  if (normalizedInput.includes("\0")) {
    throw new GuardrailError("INPUT_INVALID_CHARS", "La entrada contiene caracteres no permitidos.");
  }

  if (normalizedInput.length > options.maxInputLength) {
    throw new GuardrailError(
      "INPUT_TOO_LONG",
      `La entrada excede el limite de ${options.maxInputLength} caracteres.`,
    );
  }

  const patterns = options.suspiciousPatterns ?? DEFAULT_SUSPICIOUS_PATTERNS;
  for (const pattern of patterns) {
    if (pattern.test(normalizedInput)) {
      throw new GuardrailError("INPUT_SUSPICIOUS", "La entrada contiene patrones no permitidos.");
    }
  }

  return normalizedInput;
}
