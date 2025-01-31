/**
 * Harness using child_process to execute Codebuff commands for SWE Bench.
 */

import { spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";

interface CodebuffOptions {
  cwd: string;
  timeout?: number;
  debug?: boolean;
  _testCommand?: string; // For testing only
}

interface CodebuffResponse {
  success: boolean;
  output: string;
  error?: {
    message: string;
    code?: number | string;
    details?: unknown;
  };
}

/**
 * Execute a Codebuff command using child_process
 * @param instructions Instructions to write to file
 * @param options Configuration options including working directory
 * @param prompt The prompt to send to codebuff
 * @returns A CodebuffResponse object containing the execution result
 */
async function executeCodebuff(
  instructions: string,
  options: CodebuffOptions,
  prompt?: string
): Promise<CodebuffResponse> {
  let output = "";

  try {
    // Write instructions to file
    const instructionsPath = path.join(options.cwd, "instructions.md");
    await fs.writeFile(instructionsPath, instructions);

    if (options.debug) {
      console.log(`starting codebuff ${options.cwd}`);
    }

    return new Promise((resolve, reject) => {
      const child = spawn(
        options._testCommand ? "sh" : "codebuff",
        options._testCommand
          ? ["-c", options._testCommand]
          : [
              options.cwd,
              prompt ??
                "please follow the instructions specified in instructions.md",
            ],
        {
          cwd: options.cwd,
          stdio: "pipe",
          env: {
            ...process.env,
            NO_COLOR: "1", // Disable color output
            NO_CLEAR_LINE: "1", // Signal to codebuff to not use clearLine
            FORCE_COLOR: "0", // Additional safeguard against terminal control sequences
            TERM: "dumb", // Force dumb terminal mode
            COLUMNS: "80", // Set fixed terminal width
            LINES: "24", // Set fixed terminal height
          },
        }
      );
      let foundPrompt = false;
      let startIndex = 0;
      let lines: string[] = [];

      const processOutput = (data: Buffer | string, isStderr = false) => {
        const decoded = data.toString();
        output += decoded;

        if (options.debug) {
          if (isStderr) {
            process.stderr.write(decoded);
          } else {
            process.stdout.write(decoded);
          }
        }

        // Process lines to find prompts and extract content
        lines = output.split("\n").filter((line) => line.trim());

        for (let i = 0; i < lines.length; i++) {
          const cleanedLine = lines[i]
            .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
            .trim();

          if (cleanedLine.includes(">")) {
            if (!foundPrompt) {
              foundPrompt = true;
              startIndex = i + 1;
            } else {
              // Return content between prompts, excluding prompt lines
              const outputLines = lines
                .slice(startIndex, i)
                .filter((line) => !line.trim().includes("Thinking..."));
              if (outputLines.length > 0) {
                const result = outputLines.join("\n").trim();
                child.kill();
                resolve({
                  success: true,
                  output: result,
                });
                return;
              }
            }
          }
        }
      };

      child.stdout.on("data", (data) => processOutput(data));
      child.stderr.on("data", (data) => processOutput(data, true));

      child.on("close", (code) => {
        // Only reach here if we didn't find two prompts
        resolve({
          success: false,
          output: "",
          error: {
            message:
              "Process completed without finding complete output between prompts",
            code: code ?? "NO_OUTPUT",
          },
        });
      });

      child.on("error", (err) => {
        const isCommandNotFound =
          (err as NodeJS.ErrnoException).code === "ENOENT";
        resolve({
          success: false,
          output: "",
          error: {
            message: isCommandNotFound
              ? "Could not find the 'codebuff' command. Please ensure Codebuff CLI is installed and in your system PATH."
              : err.message,
            code:
              typeof (err as NodeJS.ErrnoException).code === "string"
                ? (err as NodeJS.ErrnoException).code
                : "UNKNOWN_ERROR",
            details: err,
          },
        });
      });

      // Handle timeout
      if (options.timeout) {
        setTimeout(() => {
          child.kill();
          resolve({
            success: false,
            output: output.trim(),
            error: {
              message: `Timeout after ${options.timeout}ms`,
              code: "TIMEOUT",
            },
          });
        }, options.timeout);
      }
    });
  } catch (err) {
    if (options.debug) {
      console.error("Error executing codebuff:", err);
    }
    return {
      success: false,
      output: "",
      error: {
        message: err instanceof Error ? err.message : "Unknown error occurred",
        code: "EXECUTION_ERROR",
        details: err,
      },
    };
  }
}

export { executeCodebuff, CodebuffOptions, CodebuffResponse };
