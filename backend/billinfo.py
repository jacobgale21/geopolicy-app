#%%
import requests
import dotenv
import json
import os
import pandas as pd
from geocodio import Geocodio

dotenv.load_dotenv()
#%%
print(os.getenv("BILLS_API_LINK")+os.getenv("CONGRESS_API_KEY"))
#%%
response = requests.get(os.getenv("CONGRESS_API_LINK")+os.getenv("CONGRESS_API_KEY"))
# %%


# Parse the response into a list
try:
    import json
    bills_data = response.json()
    
    # If it's a list of bills/items
    bills_list = bills_data['bills']
    
    print("\nFormatted as list:")
    for i, bill in enumerate(bills_list, 1):
        print(f"{i}. {bill}")
        
        
except json.JSONDecodeError:
    print("Response is not valid JSON")
# %%
actions_response = requests.get(os.getenv("ACTIONS_API_LINK")+os.getenv("CONGRESS_API_KEY"))
#%%
print(actions_response.json())
#%%
try:
    actions_data = actions_response.json()
    actions_list = actions_data['actions']
    print("\nFormatted as list:")
    for i, action in enumerate(actions_list, 1):
        print(f"{i}. {action}")
except json.JSONDecodeError:
    print("Response is not valid JSON")
# %%
geo_client = Geocodio(os.getenv("GEOCODIO_API_KEY"))
response = geo_client.geocode("667 Fraternity Dr, Gainesville, FL 32601", fields=["cd", "stateleg"])
#%%
print(response.results[0])
# %%
print(response.results[0].address_components.state)
# %%
print(response.results[0].fields.congressional_districts[0].district_number)
# %%
