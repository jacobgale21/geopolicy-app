import requests
import json
import os
import sys
from dotenv import load_dotenv
import psycopg2
from psycopg2 import Error
import json
import pandas as pd

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db import connection_scope


def get_federal_spending_agencies():
    url = "https://api.usaspending.gov/api/v2/references/toptier_agencies"
    
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises an exception for bad status codes
        
        if response.status_code == 200:
            result = response.json()
            result_df = pd.DataFrame(result["results"])
            result_df["percent_budget"] = result_df["outlay_amount"] / result_df["outlay_amount"].sum() * 100
            return result_df
        else:
            print(f"Error: HTTP {response.status_code}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON: {e}")
        return None

def get_federal_budget_functions():

    url = "https://api.usaspending.gov/api/v2/spending/"
    headers = {'Content-type': 'application/json'}
    data = json.dumps({
    "type": "budget_function",
    "filters": {
        "fy": 2025,
        "quarter": "3"
        }
    })
    try:
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()
        result = response.json()
        result_df = pd.DataFrame(result["results"])
        total_amount = result["total"]
        
        # Calculate percentage for each row
        result_df["percent_budget"] = result_df["amount"] / total_amount * 100
        return result_df
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None


def insert_federal_budget_functions(conn, budget_functions_df):
    try:
        cur = conn.cursor()
        cur.execute("CREATE TABLE IF NOT EXISTS federal_budget_functions(name VARCHAR(255) PRIMARY KEY, amount FLOAT, percent_budget FLOAT)")
        for idx, row in budget_functions_df.iterrows():
            cur.execute("INSERT INTO federal_budget_functions (name, amount, percent_budget) VALUES (%s, %s, %s)", (row["name"], row["amount"], row["percent_budget"]))
        conn.commit()
    except Error as error:
        print("Error with inserting federal budget functions", error)
    finally:
        cur.close()

def insert_agency_data(conn, agency_df):
    try:
        cur = conn.cursor()
        cur.execute("CREATE TABLE IF NOT EXISTS agency_data(name VARCHAR(255) PRIMARY KEY, amount FLOAT, percent_budget FLOAT)")
        for idx, row in agency_df.iterrows():
            cur.execute("INSERT INTO agency_data (name, amount, percent_budget) VALUES (%s, %s, %s)", (row["agency_name"], row["outlay_amount"], row["percent_budget"]))
        conn.commit()
    except Error as error:
        print("Error with inserting agency data", error)
    finally:
        cur.close()

def get_agency_data(conn):
    cur = conn.cursor()
    cur.execute("SELECT * FROM agency_data WHERE percent_budget > 0 ORDER BY percent_budget DESC")
    return cur.fetchall()

def get_budget_functions(conn):
    cur = conn.cursor()
    cur.execute("SELECT * FROM federal_budget_functions ORDER BY percent_budget DESC")
    return cur.fetchall()

# def main():
    # with connection_scope() as conn:
    #     # budget_functions_df = get_federal_budget_functions()
    #     # agency_df = get_federal_spending_agencies()
    #     # insert_federal_budget_functions(conn, budget_functions_df)
    #     # insert_agency_data(conn, agency_df)
    #     print(get_agency_data(conn))
    #     print(get_budget_functions(conn))

# if __name__ == "__main__":
#     main()