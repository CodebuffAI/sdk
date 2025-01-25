# Codebuff SDK

This repository contains SDK implementations for Codebuff in both TypeScript and Python. These SDKs provide a simple interface to execute Codebuff commands programmatically.

## Structure

```
├── typescript/   # TypeScript SDK implementation
├── python/       # Python SDK implementation
```

## TypeScript

### Installation

```bash
cd typescript
npm install
```

### Usage

```typescript
import { executeCodebuff, CodebuffOptions } from "./codebuff_sdk";

const instructions = `
Here's a complex task that
spans multiple lines.
I want you to work through it.
`;

const options = {
  cwd: "/path/to/working/directory",
  timeout: 30000, // optional timeout in milliseconds
  debug: false    // optional debug logging
};

// Optional prompt - if not provided, will use default prompt
const prompt = "Please solve the problem specified in instructions.md";

const output = await executeCodebuff(instructions, options, prompt);
console.log(output);
```

### Example Script

The TypeScript SDK includes an example script (`example.ts`) that demonstrates:
- Setting up options including debug mode and timeout
- Error handling and response processing
- Working with Codebuff output
- Proper cleanup and process management

Run the example:
```bash
cd typescript
npm run example
```

## Python SDK

### Installation

```bash
cd python
pip install -r requirements.txt
```

### Usage

```python
from codebuff_sdk import execute_codebuff

instructions = """
Here's a complex task that
spans multiple lines.
I want you to work through it.
"""

options = {
    "cwd": "/path/to/working/directory",
    "debug": False,     # optional debug logging
    "timeout": 60      # optional timeout in seconds
}

# Optional prompt - if not provided, will use default prompt
prompt = "Please solve the problem specified in instructions.md"

output = await execute_codebuff(instructions, options, prompt)
print(output)
```

### Example Script

The Python SDK includes an example script (`example.py`) that demonstrates:
- Async/await usage pattern
- Error handling and response processing
- Debug output configuration
- Timeout handling

Run the example:
```bash
cd python
python example.py
```

## Features

- Execute Codebuff commands programmatically
- Support for custom working directories
- Timeout configuration
- Debug logging options
- Configurable prompts
- Terminal output handling
- Error handling and logging
- Shell prompt detection and filtering

## Development

### TypeScript

- Run tests: `cd typescript && npm test`
- Build: `npm run build`
- Try example: `npm run example`
- Uses npm for package management

### Python

- Uses PTY for terminal interaction
- Handles terminal control sequences
- Async execution model
- Proper process cleanup

## Environment Variables

Both SDKs automatically configure the terminal environment:
- NO_COLOR: Disable color output
- NO_CLEAR_LINE: Prevent terminal clear
- FORCE_COLOR: Additional color control
- TERM: Force dumb terminal
- COLUMNS/LINES: Fixed terminal size

## Notes

- Both implementations handle writing instructions to file
- Terminal control sequences disabled by default
- Support custom working directories and prompts
- Proper process cleanup and timeout handling
- Shell prompt detection looks for '>' character
- Filters out progress indicator lines ending with 'Thinking...'

## License

MIT
