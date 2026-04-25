import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env.local" });

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") {
    return true;
  }

  if (normalized === "false" || normalized === "0") {
    return false;
  }

  return value;
}, z.boolean());

const positiveInt = z.coerce.number().int().positive();

const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
  OPENROUTER_MODEL: z.string().default("openai/gpt-4o-mini"),
  OPENROUTER_BASE_URL: z.string().url().default("https://openrouter.ai/api/v1"),
  OPENROUTER_TEMPERATURE: z.coerce.number().min(0).max(2).default(0),
  OPENROUTER_HTTP_REFERER: z.string().url().optional(),
  OPENROUTER_APP_TITLE: z.string().min(1).optional(),
  AGENT_MAX_INPUT_LENGTH: positiveInt.default(2000),
  AGENT_MAX_OUTPUT_LENGTH: positiveInt.default(15000),
  AGENT_MAX_ITERATIONS: positiveInt.default(12),
  AGENT_VERBOSE: booleanFromEnv.default(false),
  AGENT_MAX_FILE_SIZE_BYTES: positiveInt.default(500_000),
  AGENT_MAX_FILES_PER_ANALYSIS: positiveInt.default(100),
  AGENT_MAX_DIRECTORY_DEPTH: positiveInt.default(5),
  AGENT_ENABLE_INPUT_FILTER: booleanFromEnv.default(true),
  AGENT_ENABLE_OUTPUT_FILTER: booleanFromEnv.default(true),
  AGENT_REPO_ROOT: z.string().default(process.cwd()),
});

export type AppEnv = z.infer<typeof envSchema>;

export function getEnv(): AppEnv {
  const parsed = envSchema.parse(process.env);
  return {
    ...parsed,
    AGENT_REPO_ROOT: path.resolve(parsed.AGENT_REPO_ROOT),
  };
}
