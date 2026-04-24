import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { getEnv } from "../config/env.js";
import { createModel } from "./model.js";
import { agentPrompt } from "./prompt.js";
import { codeAnalyzerTool } from "./tools/codeAnalyzer.js";
import { diagramGeneratorTool } from "./tools/diagramGenerator.js";
import { flowExplainerTool } from "./tools/flowExplainer.js";

export const agentTools = [codeAnalyzerTool, diagramGeneratorTool, flowExplainerTool];

export interface BuildAgentExecutorOptions {
  verbose?: boolean;
  maxIterations?: number;
}

export async function buildAgentExecutor(options: BuildAgentExecutorOptions = {}): Promise<AgentExecutor> {
  const env = getEnv();
  const model = createModel();
  const agent = await createToolCallingAgent({
    llm: model,
    tools: agentTools,
    prompt: agentPrompt,
  });

  return new AgentExecutor({
    agent,
    tools: agentTools,
    maxIterations: options.maxIterations ?? env.AGENT_MAX_ITERATIONS,
    verbose: options.verbose ?? env.AGENT_VERBOSE,
    earlyStoppingMethod: "force",
  });
}
