import os 
import asyncio
import certifi
import sys
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
AVIATION_API_KEY = os.getenv("AVIATIONSTACK_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

client = MultiServerMCPClient(
    {
        "tavily": {
            "transport" : "streamable_http",
            "url" : f"https://mcp.tavily.com/mcp/?tavilyApiKey={TAVILY_API_KEY}"
        },

        "aviationstack": {
          "transport": "stdio",
          "command": "uvx",
          "args": [
            "aviationstack-mcp"
          ],
          "env": {
            "AVIATION_STACK_API_KEY": AVIATION_API_KEY
          }
        },

        "weather": {
    "transport": "stdio",
    "command": sys.executable,
    "args": [
        os.path.join(os.path.dirname(__file__), "custom_weather_mcp_server.py")
    ],
    "env": {
        "OPENWEATHER_API_KEY": OPENWEATHER_API_KEY or ""
    }
}
    }
)


# Tavily and Aviation Tools 

search_tool = None
aviation_tools ={}

async def initialize_mcp():

  global search_tool
  global aviation_tools

  if search_tool is not None and aviation_tools:
    return

  tools = await client.get_tools() 

  print("\nAvailable Tools:\n")

  for tool in tools:
    print(tool.name)


  search_tool = next(
    tool
    for tool in tools
    if tool.name == "tavily_search"
  )

  aviation_tools = {
    tool.name : tool
    for tool in tools 
    if tool.name.startswith("aviationstack")
  }
 

 # this funciton can be used to call tavily_search tool with a query in backend.py
async def tavily_mcp_search(query: str) :
    await initialize_mcp()
    result = await search_tool.ainvoke(
        {
            'query':query
        }
    )
    return result

  
async def aviation_mcp_call(
  tool_name:str,
  tool_args : dict = None
):

  tools = await client.get_tools()

  tool = next(
      t for t in tools
      if t.name == tool_name
  ) 

  result = await tool.ainvoke(
    tool_args or {}
  )

  return result

# WEATHER TOOLS
