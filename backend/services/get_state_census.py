
import requests
import json
import os
import sys
from dotenv import load_dotenv
import psycopg2
from psycopg2 import Error
import matplotlib.pyplot as plt

# Add parent directory to path to import db module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db import connection_scope

load_dotenv()

def get_state_census_response(year: int):

    url = f"https://api.census.gov/data/{year}/acs/acs1/profile?get=NAME,DP03_0119PE,DP02_0067PE,DP03_0063E,DP03_0062E,DP03_0097PE,DP03_0098PE&for=state:*"
    
    response = requests.get(url)
    
    return response
    # cur = conn.cursor()
def organize_response_data(response):
    result = {} 
    idx = 0
    for item in response.json():
        if not idx == 0 and item[0] != 'Puerto Rico':
            result[item[0]] = item[1:]
        idx += 1
    print(result)
    return result

def insert_state_census_data(conn, data, year: int):
    try:
        
        cur = conn.cursor()
        # Create table if not exists
        cur.execute("""
            CREATE TABLE IF NOT EXISTS StateCensus(
                state VARCHAR(20) NOT NULL,
                year INT NOT NULL,
                poverty_rate FLOAT NOT NULL,
                educational FLOAT NOT NULL,
                income_mean FLOAT NOT NULL,
                income_median FLOAT NOT NULL,
                PRIMARY KEY (state, year)
            )
        """)
        #   Loop through state data and insert data into tables for each state
        for key, value in data.items():
            cur.execute("INSERT INTO StateCensus(state, poverty_rate, educational, income_mean, income_median, year) VALUES (%s, %s, %s, %s, %s, %s)", (key, value[0], value[1], value[2], value[3], year))
        conn.commit()
    except Error as error:
        print(error)
    finally:
        cur.close()

def get_state_census_data(conn, state):
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM StateCensus WHERE state = %s", (state,))
        result = cur.fetchall()
    except Error as error:
        print(error)
    finally:
        cur.close()
        return result
        

def main():
    try:
        with connection_scope() as conn:
            # response = get_state_census_response(2021)
            # organized_data = organize_response_data(response)
            # insert_state_census_data(conn, organized_data, 2021)
            result = get_state_census_data(conn, 'California')
            print(result)
    except Error as error:
        print(error)

if __name__ == "__main__":
    main()