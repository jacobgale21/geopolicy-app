import requests
import os
import dotenv
import sys 

dotenv.load_dotenv()
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db import connection_scope

def get_recent_legislation():
    try:
        url = f"{os.getenv('CONGRESS_API_URL')}{os.getenv('CONGRESS_API_KEY')}"
        parameters = {
            "limit": 10
        }
        response = requests.get(url, params=parameters).json()['bills']
        result = []
        for item in response:
            curr = {}
            curr['bill_id'] = item['number']
            curr['title'] = item['title']
            curr['date'] = item['latestAction']['actionDate']
            curr['action'] = item['latestAction']['text']
            curr['chamber'] = item['originChamber']
            result.append(curr)
        return result
    except Exception as e:
        raise Exception("Failed to fetch recent legislation: " + str(e))

# if __name__ == "__main__":
#     print(get_current_legislation())
