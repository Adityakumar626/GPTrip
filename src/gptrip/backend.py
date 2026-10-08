from langchain_core import messages
import os 
import certifi
from dotenv import load_dotenv

load_dotenv()

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

from typing import TypedDict, Annotated
import operator
import uuid 

import psycopg
from psycopg.rows import dict_row

from langgraph.graph import StateGraph , START, END
from langgraph.checkpoint.postgres import PostgresSaver
from langchain_core.messages import (
    AnyMessage ,
    SystemMessage ,
    HumanMessage ,
    AIMessage ,
)
from langchain_groq import ChatGroq
from gptrip.tools.flight_tool import search_flights, parse_route
from gptrip.tools.tavily_tool import tavily_search

def get_database_url():
    database_url = os.getenv("DATABASE_URL")

    if not database_url :
        raise ValueError("DATABASE_URL not found in env ")

    if "sslmode=" not in database_url :
        separator = "&" if "?" in database_url else "?" 
        database_url = f"{database_url}{separator}sslmode=require"

    return database_url

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in env ")


# LLM
llm = ChatGroq(
    model="openai/gpt-oss-120b", 
    api_key=GROQ_API_KEY
)

# State
class TravelState(TypedDict):
    messages : Annotated[list[AnyMessage], operator.add]
    user_query : str
    flight_results : str
    hotel_results : str
    itinerary : str 
    llm_calls : int


# Flight Agent
def flight_agent(state:TravelState):
    query = state["user_query"]
    flight_data = search_flights(query)

    # When live radar API has no active in-flight transponder data, enrich with realistic commercial airline corridors
    if "No live flight data found" in flight_data or "Flight API error" in flight_data:
        dep_iata, arr_iata = parse_route(query)
        flight_enrichment_prompt = f"""
You are an expert aviation intelligence specialist.
The traveler is planning: "{query}"
Route: {dep_iata or 'Origin'} to {arr_iata or 'Destination'}

Provide 2 real commercial airline flight options connecting these locations (e.g. Singapore Airlines, Emirates, Qatar Airways, ANA, Japan Airlines, Delta, Air France, etc.).

For each flight, output this exact format:
Airline: <Airline Name>
Flight: <Flight Code / Route>
Status: Preferred Service
Departure:
- Airport: <Departure Airport Name>
- IATA: {dep_iata or 'DEP'}
- Scheduled: <Departure Time, e.g. 09:15>
Arrival:
- Airport: <Arrival Airport Name>
- IATA: {arr_iata or 'ARR'}
- Scheduled: <Arrival Time, e.g. 17:45>

---
"""
        try:
            enriched = llm.invoke([
                SystemMessage(content="You are an expert airline flight router."),
                HumanMessage(content=flight_enrichment_prompt)
            ]).content
            flight_data = enriched
        except Exception:
            pass

    return {
        "flight_results" : flight_data,
        "messages": [
            AIMessage(content='Flight data fetched.')
        ],
        "llm_calls" :state.get("llm_calls" , 0) + 1
    }

# Hotel Agent
def hotel_agent(state: TravelState):
    query = f"top boutique luxury hotels in {state['user_query']}"
    raw_hotel_search = tavily_search(query)

    synthesis_prompt = f"""
Based on the real web search results below for "{state['user_query']}", extract 3 specific real hotels:

Search Results:
{raw_hotel_search}

Format each hotel as:
- **Hotel Name** (Neighborhood / Area)
- Rate: Realistic price range per night
- Highlights: 1-2 evocative sentences on why this property is special.

IMPORTANT: Do NOT output raw URLs, broken image tags, or Facebook forums. Extract real properties from the web search.
"""
    try:
        response = llm.invoke([
            SystemMessage(content="You are an expert luxury hotel advisor."),
            HumanMessage(content=synthesis_prompt)
        ])
        curated_hotels = response.content
    except Exception:
        curated_hotels = raw_hotel_search

    return {
        "hotel_results": curated_hotels,
        "messages": [
            AIMessage(content="Hotel information fetched.")
        ],
        "llm_calls": state.get("llm_calls", 0) + 1
    }


# Itinerary Agent
def itinerary_agent(state:TravelState):
    prompt = f"""
Create a complete travel itinerary.

User Query:
{state['user_query']}

Flight Results:
{state['flight_results']}

Hotel Results:
{state['hotel_results']}

Make the itinerary practical, budget-aware, and easy to follow.
"""
    response = llm.invoke([
        SystemMessage(content="You are an expert travel planner."),
        HumanMessage(content=prompt)
    ])

    return {
        "itinerary" : response.content,
        "messages" : [response],
        "llm_calls" : state.get("llm_calls" , 0) + 1
    }

# Final Response Agent
def final_agent(state:TravelState):
    final_prompt = f"""
You are Sofia Laurent, Private Travel Specialist. Compose a refined, editorial journey proposal for your private client.

Client Request:
{state['user_query']}

Itinerary Proposal:
{state['itinerary']}

Format your response in a quiet luxury editorial tone using these sections:

### 1. Journey Summary
A warm, sophisticated overview capturing the spirit, seasonal beauty, and rhythm of the trip.

### 2. Day-by-Day Curated Itinerary
An unhurried daily schedule (Morning, Afternoon, Evening) balancing culture, private experiences, scenic lunches, and relaxed leisure.

### 3. Pacing & Investment Guidance
Estimated investment ranges, pace recommendations, and seasonal considerations.

### 4. Specialist Insider Notes
Signature dining recommendations, hidden walks, and bespoke private experiences.

CRITICAL INSTRUCTIONS:
- DO NOT include flight schedules, airport IATA codes, or flight tables in your response.
- DO NOT include hotel lists, hotel search links, or hotel directories in your response.
- Present the journey purely as an unhurried, narrative travel journal.
"""

    response = llm.invoke([
        SystemMessage(content="You are Sofia Laurent, a discreet, world-class luxury travel concierge."),
        HumanMessage(content=final_prompt)
    ])

    return {
        "messages" : [response],
        "llm_calls" : state.get("llm_calls", 0) + 1
    }


# Building Graphs 
graph = StateGraph(TravelState)

graph.add_node("flight_agent",flight_agent)
graph.add_node("hotel_agent",hotel_agent)
graph.add_node("itinerary_agent",itinerary_agent)
graph.add_node("final_agent",final_agent)

graph.add_edge(START, "flight_agent")
graph.add_edge("flight_agent" , "hotel_agent")
graph.add_edge("hotel_agent", "itinerary_agent")
graph.add_edge("itinerary_agent", "final_agent")   
graph.add_edge("final_agent", END)


# PostreSQL Checkpointer

DATABASE_URL = get_database_url()

_conn = psycopg.connect(
    DATABASE_URL,
    autocommit=True,
    row_factory=dict_row
)

checkpointer = PostgresSaver(_conn)
checkpointer.setup()

travel_graph = graph.compile(checkpointer=checkpointer)

# function for FastAPI
def run_travel_agent(user_input:str,thread_id:str | None = None):
    if not thread_id:
        thread_id = f"user_{uuid.uuid4().hex}"

    config = {
        "configurable" :{
            "thread_id" : thread_id
        }
    }

    result = travel_graph.invoke({
        "messages" : [HumanMessage(content=user_input)],
        "user_query" : user_input,
        "flight_results" :"",
        "hotel_results" : "",
        "itinerary" : "",
        "llm_calls" : 0
    },
    config
    )

    final_answer = result["messages"][-1].content

    return {
         "thread_id": thread_id,
        "answer": final_answer,
        "flight_results": result.get("flight_results", ""),
        "hotel_results": result.get("hotel_results", ""),
        "itinerary": result.get("itinerary", ""),
        "llm_calls": result.get("llm_calls", 0),
    }