import asyncio
from mcp_client_test import tavily_mcp_search

if __name__ == "__main__":
    query = "what is president of india?"
    asyncio.run(tavily_mcp_search(query))