import { executeCodebuff } from "./codebuff_sdk";

async function main() {
  // Example instructions for codebuff
  const instructions = `
    Please analyze this code and tell me:
    1. What programming language is it?
    2. What are the main functions?
    
    def hello():
        print("Hello World")
        return True
    `;

  // Configure options
  const options = {
    cwd: ".", // Current working directory
    debug: process.env.DEBUG === "true", // Enable debug logging if DEBUG=true
    timeout: 60000, // Add 60 second timeout
  };

  try {
    // Execute codebuff with our instructions
    if (options.debug) {
      console.log("Executing Codebuff...");
    }
    const response = await executeCodebuff(
      instructions,
      options,
      "Please analyze this code"
    );

    if (response.success) {
      // Print the successful response from codebuff
      console.log("\nCodebuff Response:");
      console.log(response.output);
    } else {
      // Handle error case
      console.error("\nError executing Codebuff:");
      console.error(`Message: ${response.error?.message}`);
      console.error(`Code: ${response.error?.code}`);
      if (response.error?.details) {
        console.error("Details:", response.error.details);
      }
      if (response.output) {
        console.log("\nPartial output before error:");
        console.log(response.output);
      }
    }
  } catch (e) {
    console.error(
      "Unexpected error:",
      e instanceof Error ? e.message : String(e)
    );
  }

  // Ensure process exits
  process.exit(0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
