import { runAgent } from "./agent/runAgent.js";

function readInputFromCli(argv: string[]): string {
  return argv.slice(2).join(" ").trim();
}

async function main(): Promise<void> {
  const input = readInputFromCli(process.argv);

  if (!input) {
    console.error("Uso: npm run dev -- \"tu consulta sobre el codigo\"");
    process.exit(1);
  }

  const output = await runAgent(input);
  console.log(output);
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error("Error inesperado ejecutando el agente.");
  }
  process.exit(1);
});
