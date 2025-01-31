# Codebuff SDK

## Overview

TypeScript SDK for interacting with Codebuff CLI. Provides structured interface for executing and managing Codebuff commands.

## Key Features

- Child process management for Codebuff CLI
- Promise-based async execution
- Structured error handling
- Configurable timeouts
- Terminal output control

## Usage Guidelines

- Always handle both success and error cases
- Use timeout option for long-running operations
- Check response.success before accessing output
- Set debug: true in options or DEBUG=true env var to enable console logging
- Shell prompt detection looks for '>' character anywhere in cleaned line
- Return content between prompt lines, excluding the prompt lines themselves
- Filter out progress indicator lines ending with 'Thinking...'

## Development

- Run tests: `npm test`
- Build: `npm run build`
- Try example: `npm run example`

## Environment Variables

The SDK sets these automatically:

- NO_COLOR: Disable color output
- NO_CLEAR_LINE: Prevent terminal clear
- FORCE_COLOR: Additional color control
- TERM: Force dumb terminal
- COLUMNS/LINES: Fixed terminal size

## Links

- Node.js child_process docs: https://nodejs.org/api/child_process.html

## Common Issues

### ENOENT Error
If you get `Error: spawn codebuff ENOENT`, this means the codebuff CLI command cannot be found. To fix:
1. Ensure Codebuff CLI is installed
2. Verify the installation location is in your system PATH
3. Try running `which codebuff` to check if the command is accessible

## Testing

- Use \_testCommand option to mock codebuff CLI responses
- Example: `_testCommand: 'echo "mock response"'`

## Timeouts

- Always set a timeout when running executeCodebuff to prevent hanging
- Recommended timeout: 60000ms (60 seconds)
- Example: `options.timeout: 60000`
