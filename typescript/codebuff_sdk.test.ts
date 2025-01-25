import { expect, test, describe, jest } from "@jest/globals";
import { executeCodebuff, CodebuffOptions } from "./codebuff_sdk";
import * as path from "path";
import { mkdir } from "fs";

describe("codebuff_sdk", () => {
  jest.setTimeout(2_147_483_647); // Set very long timeout
  const testDir = path.join(__dirname, "test_workspace");
  mkdir(testDir, { recursive: true }, () => {});

  const defaultOptions: CodebuffOptions = {
    cwd: testDir,
    // timeout: 25000, // Increase timeout to match Jest timeout
  };

  test("executes codebuff command with basic instructions", async () => {
    const instructions = "hi there :)";

    const output = await executeCodebuff(instructions, defaultOptions);
    console.log("output", output);
    expect(output.success).toBe(true);
    expect(typeof output.output).toBe("string");
  });
});
