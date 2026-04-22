import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const currentTimeTool = tool(
  async () => {
    return new Date().toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  },
  {
    name: "current_time",
    description: "Devuelve la hora actual.",
    schema: z.object({})
  }
);
