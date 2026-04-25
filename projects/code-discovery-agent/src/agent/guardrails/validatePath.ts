import path from "node:path";
import { promises as fs } from "node:fs";
import { GuardrailError } from "./GuardrailError.js";

const BLOCKED_FILENAMES = [".env", ".env.local", ".env.production", "secrets", "credentials"];

function isPathInsideRoot(repoRoot: string, candidate: string): boolean {
  if (candidate === repoRoot) {
    return true;
  }

  const withSeparator = repoRoot.endsWith(path.sep) ? repoRoot : `${repoRoot}${path.sep}`;
  return candidate.startsWith(withSeparator);
}

export async function validatePath(repoRoot: string, targetPath: string): Promise<string> {
  const normalizedRoot = path.resolve(repoRoot);
  const normalizedTarget = path.resolve(normalizedRoot, targetPath);

  if (!isPathInsideRoot(normalizedRoot, normalizedTarget)) {
    throw new GuardrailError("PATH_TRAVERSAL", "Acceso denegado: ruta fuera del repositorio objetivo.");
  }

  const basename = path.basename(normalizedTarget).toLowerCase();
  if (BLOCKED_FILENAMES.some((name) => basename === name || basename.startsWith(name))) {
    throw new GuardrailError("PATH_BLOCKED", `Acceso denegado: el archivo "${basename}" puede contener credenciales.`);
  }

  try {
    await fs.access(normalizedTarget);
  } catch {
    throw new GuardrailError("PATH_NOT_FOUND", "La ruta objetivo no existe o no es accesible.");
  }

  return normalizedTarget;
}
