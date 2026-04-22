import { describe, expect, it } from "vitest";
import { currentTimeTool } from "../src/agent/tools/currentTime.js";

describe("currentTimeTool", () => {
  it("devuelve hora en formato HH:MM:SS", async () => {
    const result = await currentTimeTool.invoke({});
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}/);
  });
});
