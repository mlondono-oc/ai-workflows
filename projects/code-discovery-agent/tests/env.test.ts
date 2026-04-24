import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const ENV_KEYS = [
  "OPENROUTER_API_KEY",
  "OPENROUTER_MODEL",
  "OPENROUTER_BASE_URL",
  "OPENROUTER_TEMPERATURE",
  "OPENROUTER_HTTP_REFERER",
  "OPENROUTER_APP_TITLE",
  "AGENT_MAX_INPUT_LENGTH",
  "AGENT_MAX_OUTPUT_LENGTH",
  "AGENT_MAX_ITERATIONS",
  "AGENT_VERBOSE",
  "AGENT_MAX_FILE_SIZE_BYTES",
  "AGENT_MAX_FILES_PER_ANALYSIS",
  "AGENT_MAX_DIRECTORY_DEPTH",
  "AGENT_ENABLE_INPUT_FILTER",
  "AGENT_ENABLE_OUTPUT_FILTER",
  "AGENT_REPO_ROOT",
] as const;

function resetEnv(): void {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
}

describe("getEnv", () => {
  afterEach(() => {
    resetEnv();
  });

  it("falla cuando falta OPENROUTER_API_KEY", async () => {
    const { getEnv } = await import("../src/config/env.js");
    expect(() => getEnv()).toThrowError(/OPENROUTER_API_KEY/);
  });

  it("aplica defaults de guardrails del MVP", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    const { getEnv } = await import("../src/config/env.js");
    const env = getEnv();

    expect(env.OPENROUTER_MODEL).toBe("openai/gpt-4o-mini");
    expect(env.AGENT_MAX_INPUT_LENGTH).toBe(2000);
    expect(env.AGENT_MAX_ITERATIONS).toBe(5);
    expect(env.AGENT_VERBOSE).toBe(false);
    expect(env.AGENT_ENABLE_INPUT_FILTER).toBe(true);
  });

  it("normaliza booleans y resuelve AGENT_REPO_ROOT", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.AGENT_VERBOSE = "1";
    process.env.AGENT_ENABLE_OUTPUT_FILTER = "0";
    process.env.AGENT_REPO_ROOT = "./src";
    const { getEnv } = await import("../src/config/env.js");
    const env = getEnv();

    expect(env.AGENT_VERBOSE).toBe(true);
    expect(env.AGENT_ENABLE_OUTPUT_FILTER).toBe(false);
    expect(env.AGENT_REPO_ROOT).toBe(path.resolve("./src"));
  });
});
