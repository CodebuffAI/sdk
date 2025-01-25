"""
Harness using PTY to execute Codebuff commands
"""

import os
import select
import signal
from typing import Dict, Optional, TypedDict, Any
import asyncio
import ptyprocess
from pathlib import Path

class CodebuffError(TypedDict):
    message: str
    code: str
    details: Optional[Any]

class CodebuffResponse(TypedDict):
    success: bool
    output: str
    error: Optional[CodebuffError]

class CodebuffOptions(TypedDict, total=False):
    cwd: str
    debug: bool
    timeout: int

async def execute_codebuff(instructions: str, options: CodebuffOptions, prompt: Optional[str]) -> CodebuffResponse:
    """Execute a Codebuff command using PTY
    
    Args:
        instructions: Instructions to write to file
        options: Configuration options including working directory and debug flag
        prompt: Optional prompt to send to codebuff
        
    Returns:
        CodebuffResponse containing execution result and any errors
    """
    output = ""
    shell = "zsh"  # Assuming Unix-like system since PTY is required
    pty = None
    final_prompt = prompt
    if prompt is None:
        final_prompt = "Please solve the problem specified in instructions.md."

    debug = options.get("debug", False)
    timeout = options.get("timeout", 60)  # Default 60 second timeout to stay under 90s system timeout

    try:
        # Run with NO_COLOR=1 to disable terminal control sequences
        env = dict(os.environ)
        env['NO_COLOR'] = '1'
        
        # Write instructions to file
        instructions_path = os.path.join(options["cwd"], "instructions.md")
        with open(instructions_path, "w") as f:
            f.write(instructions)
            
        pty = ptyprocess.PtyProcess.spawn([shell], env=env, cwd=options["cwd"])
        last_read = asyncio.get_event_loop().time()
        start_time = last_read
        
        # Initialize prompt tracking variables outside the loop
        found_prompt = False
        start_index = 0
        
        if debug:
            print(f"starting codebuff", options["cwd"])
        pty.write(f'codebuff . "{final_prompt}"\n'.encode())

        while True:
            current_time = asyncio.get_event_loop().time()
            elapsed_time = current_time - start_time
            
            # Check timeout
            if elapsed_time > timeout:
                if debug:
                    print(f"Timeout after {timeout} seconds")
                # Force kill the process
                try:
                    os.kill(pty.pid, signal.SIGKILL)
                except:
                    pass
                return {
                    "success": False,
                    "output": output.strip(),
                    "error": {
                        "message": f"Timeout after {timeout} seconds",
                        "code": "TIMEOUT",
                        "details": None
                    }
                }

            # Check if process is still alive
            if not pty.isalive():
                break

            # Try to read from the process
            if not select.select([pty.fd], [], [], 1.0)[0]:
                await asyncio.sleep(0)
                continue

            try:
                data = pty.read()
            except ptyprocess.PtyProcessError as e:
                return {
                    "success": False,
                    "output": output,
                    "error": {
                        "message": str(e),
                        "code": "PTY_ERROR",
                        "details": e
                    }
                }

            if not data:
                continue

            decoded = data.decode()
            output += decoded
            if debug:
                print("Raw output:", repr(decoded))  # Print raw output to see control characters
                print(f"Total lines processed: {len(lines)}")
            last_read = current_time

            # Check for shell prompt after each read
            lines = [line for line in output.split('\n') if line.strip()]
            
            for i, line in enumerate(lines):
                # Remove ANSI escape sequences and control characters
                cleaned_line = ''.join([
                    c for c in line 
                    if ord(c) >= 32 and ord(c) < 127  # Only printable ASCII
                ]).strip()
                
                # Look for shell prompt at start or end of line
                if '>' in cleaned_line:
                    if not found_prompt:
                        # First prompt - mark this as our starting point
                        found_prompt = True
                        start_index = i + 1
                        if debug:
                            print(f"Found first prompt at line {i}: {cleaned_line}")
                    else:
                        # Second prompt - we've found our complete output
                        if debug:
                            print(f"Found second prompt at line {i}: {cleaned_line}")
                        # Return everything between the first and second prompts
                        # But exclude the lines containing the prompts themselves
                        output_lines = [
                            line for line in lines[start_index:i]
                            if not line.strip().endswith('Thinking...')
                        ]
                        if output_lines:
                            return {
                                "success": True,
                                "output": '\n'.join(output_lines).strip(),
                                "error": None
                            }

            await asyncio.sleep(0)
        else:
            return {
                "success": False,
                "output": "",
                "error": {
                    "message": "Process completed with no output",
                    "code": "NO_OUTPUT",
                    "details": None
                }
            }

    except Exception as e:
        if debug:
            print("Error executing codebuff:", e)
        return {
            "success": False,
            "output": output.strip(),
            "error": {
                "message": str(e),
                "code": "EXECUTION_ERROR",
                "details": e
            }
        }
    finally:
        if pty and pty.isalive():
            try:
                pty.terminate(force=True)
            except:
                try:
                    os.kill(pty.pid, signal.SIGKILL)
                except:
                    pass

def main():
    """Run a sample command using codebuff."""
    problem_statement = """
    Here's a complex task that
    spans multiple lines.
    I want you to work through it.
    """
    options = {
        "cwd": ".",
        "debug": True,  # Enable debug output for the example
        "timeout": 90   # 90 second timeout
    }
    response = asyncio.run(execute_codebuff(problem_statement, options, None))
    if response["success"]:
        print("Success!")
        print(response["output"])
    else:
        print("Error:", response["error"]["message"])
        print("Code:", response["error"]["code"])
        if response["error"]["details"]:
            print("Details:", response["error"]["details"])
        if response["output"]:
            print("\nPartial output:")
            print(response["output"])

if __name__ == "__main__":
    main()