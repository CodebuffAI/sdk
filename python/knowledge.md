# Codebuff SDK

Python SDK for executing Codebuff commands via PTY.

## Core Concepts

- Uses PTY to execute Codebuff commands
- Async execution model
- Timeout-aware execution
- Structured error handling

## Key Components

- `execute_codebuff()`: Main async function to run commands
- `CodebuffResponse`: Success/failure response type
- `CodebuffOptions`: Configuration options including timeout and debug settings

## Usage Guidelines

- Always handle both success and error cases
- Use async/await pattern
- Set appropriate timeouts (default 60s)
- Consider debug mode for troubleshooting
- Shell prompt detection looks for '>' character anywhere in cleaned line
- Return content between prompt lines, excluding the prompt lines themselves
- Filter out progress indicator lines ending with 'Thinking...'

## Dependencies

- asyncio
- ptyprocess

## Links

- [asyncio Documentation](https://docs.python.org/3/library/asyncio.html)
- [ptyprocess Documentation](https://ptyprocess.readthedocs.io/)
