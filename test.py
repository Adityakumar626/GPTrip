from gptrip.tools.tavily_tool import tavily_search
from gptrip.tools.flight_tool import search_flights

# res = tavily_search("best hotels in india")
# print(res)
res2 = search_flights("flights from Delhi to Mumbai")
print(res2)
