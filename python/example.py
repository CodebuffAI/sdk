import asyncio
from codebuff_sdk import execute_codebuff

async def main():
    # Example instructions for codebuff
    instructions = """
    Please analyze this code and tell me:
    1. What programming language is it?
    2. What are the main functions?
    
    def hello():
        print("Hello World")
        return True
    """
    
    # Configure options - silent mode
    options = {
        "cwd": ".",  # Current working directory
        "timeout": 60,  # 60 second timeout to match SDK default
        "debug": False  # Disable debug mode
    }
    
    try:
        # Execute codebuff silently
        response = await execute_codebuff(instructions, options, "Please analyze this code")
        
        if response["success"]:
            print("\nCodebuff Response:")
            print(response["output"])
        else:
            print("\nError executing Codebuff:")
            print(f"Message: {response['error']['message']}")
            print(f"Code: {response['error']['code']}")
            if response["error"]["details"]:
                print("Details:", response["error"]["details"])
            if response["output"]:
                print("\nPartial output before error:")
                print(response["output"])
            
    except Exception as e:
        print(f"Error occurred: {str(e)}")

    exit(0)
    
if __name__ == "__main__":
    asyncio.run(main())
