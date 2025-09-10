
import requests
import json
import os
import sys
from dotenv import load_dotenv
import psycopg2
from psycopg2 import Error
import matplotlib.pyplot as plt
import json
import pandas as pd
from datetime import datetime
# Add parent directory to path to import db module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db import connection_scope

load_dotenv()

def get_state_census_response(year: int):

    url = f"https://api.census.gov/data/{year}/acs/acs1/profile?get=NAME,DP03_0119PE,DP02_0067PE,DP03_0063E,DP03_0062E,DP03_0097PE,DP03_0098PE&for=state:*"
    
    response = requests.get(url)
    
    return response
    # cur = conn.cursor()
def get_us_census_response(year: int):
    url = f"https://api.census.gov/data/{year}/acs/acs1/profile?get=NAME,DP03_0119PE,DP02_0067PE,DP03_0063E,DP03_0062E,DP03_0097PE,DP03_0098PE&for=us:*"
    response = requests.get(url)
    return response

# Get consumer price index data
def get_CPI_response():
    # Set the headers and data for the API request
    headers = {'Content-type': 'application/json'}
    data = json.dumps({
    "seriesid": ['CUUR0000SA0'],
    "startyear": "2020",
    "endyear": "2024"
    })

    # Send the request to the BLS API
    json_data = requests.post('https://api.bls.gov/publicAPI/v2/timeseries/data/', data=data, headers=headers).json()
    data_list = []
    for series in json_data['Results']['series']:
        seriesId = series['seriesID']
        for item in series['data']:
            data_list.append({
                'Series ID': seriesId,
                'Year': int(item['year']),
                'Month': item['period'],
                'value': float(item['value'])
            })

    # Create the DataFrame
    df = pd.DataFrame(data_list)
    df['Date'] = df['Year'].astype(str) + df['Month']
    df.index = df['Date'].apply(lambda x: datetime.strptime(x, '%YM%m'))
    df.sort_index(inplace=True)
    df_cpi = df[(df['Series ID'] == 'CUUR0000SA0')]
    # Calculate both YoY and MoM inflation
    cpi_yoy = df_cpi['value'].pct_change(periods=12) * 100  # Year-over-year
    result = {}
    for year in range(2021, 2024):
        print(f"Average YoY Inflation for {year}: {cpi_yoy[str(year)].mean():.2f}%")
        result[year] = cpi_yoy[str(year)].mean()
    return result

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

def get_us_census_response(conn):
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM StateCensus WHERE state = 'United States'")
        result = cur.fetchall()
    except Error as error:
        print(error)
    finally:
        cur.close()
        return result

def write_us_census_json(rows, out_path: str = "us_census_data.json"):
    try:
        # Build a dictionary keyed by year (e.g., "2023")
        by_year = {}
        for row in rows:
            # Expected row order from SELECT *: [state, year, poverty_rate, educational, income_mean, income_median]
            year_key = str(int(row[1]))
            by_year[year_key] = {
                "poverty_rate": float(row[2]) if row[2] is not None else None,
                "educational": float(row[3]) if row[3] is not None else None,
                "income_mean": float(row[4]) if row[4] is not None else None,
                "income_median": float(row[5]) if row[5] is not None else None,
            }

        with open(out_path, "w") as json_file:
            json.dump(by_year, json_file, indent=4)
        print(f"US census JSON successfully written to {out_path}")
    except (IOError, ValueError, json.JSONDecodeError) as e:
        print(f"Error preparing/writing US census JSON: {e}")


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
        

# def main():
    # try:
    #     # with connection_scope() as conn:
    #         # response = get_us_census_response(conn)
    #         # write_us_census_json(response, "us_census_data.json")
    #         # response = get_state_census_response(2021)
    #         # organized_data = organize_response_data(response)
    #         # insert_state_census_data(conn, organized_data, 2021)
    #         # result = get_state_census_data(conn, 'California')
    #         # for year in range(2021, 2024):
    #         #     response = get_us_census_response(year)
    #         #     insert_us_census_data(conn, response, year)
    #         # get_CPI_response()
            
    # except Error as error:
    #     print(error)

