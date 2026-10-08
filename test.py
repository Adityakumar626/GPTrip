from gptrip.tools.tavily_tool import tavily_search
from gptrip.tools.flight_tool import search_flights
from gptrip.backend import run_travel_agent

# res = tavily_search("best hotels in india")
# print(res)
# res2 = search_flights("flights from Delhi to Mumbai")
# print(res2)

res3 = run_travel_agent("I want to go to Bali from Dhaka for 5 days ")
print(res3)


