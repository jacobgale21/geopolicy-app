import requests
import json
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2 import Error
import matplotlib.pyplot as plt
import sys 

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db import connection_scope
load_dotenv()
def get_state_murder_counts(state, full_state, start_year, end_year):
    # Get number of murders in florida

    url = f"https://api.usa.gov/crime/fbi/cde/summarized/state/{state}/HOM?from=01-{start_year}&to=12-{end_year}&API_KEY={os.getenv('FBI_API_KEY')}"
    response = requests.get(url)
    data = response.json()
    temp = data['offenses']['actuals'][full_state]
    
    year_total = {year: 0 for year in range(start_year, end_year + 1)}
    for key, value in temp.items():
        year_total[int(key[3:])] += value
    return year_total

def insert_crime_data(conn, state, crime_counts, crime_type):
    try:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS CrimeData(
                id SERIAL PRIMARY KEY,
                state VARCHAR(20) NOT NULL,
                crime_type VARCHAR(20) NOT NULL,
                crime_counts INT NOT NULL,
                year INT NOT NULL,
                UNIQUE(state, year)  -- Prevent duplicate state and year
            )
        """)
        for key, value in crime_counts.items():
            
            cur.execute("""
                INSERT INTO CrimeData (state, crime_type, crime_counts, year)
                VALUES (%s, %s, %s, %s)
            """, (state, crime_type, value, key))
        conn.commit()
    except Error as error:
        print(error)


def get_crime_data(conn, state, crime_type):
    print(state, crime_type)
    cur = conn.cursor()
    cur.execute("SELECT * FROM CrimeData WHERE state = %s AND crime_type = %s ORDER BY year ASC", (state, crime_type))
    return cur.fetchall()


def main():

    try:
        states = {
            'AL': 'Alabama',
            'AK': 'Alaska',
            'AZ': 'Arizona',
            'AR': 'Arkansas',
            'CA': 'California',
            'CO': 'Colorado',
            'CT': 'Connecticut',
            'DE': 'Delaware',
            'FL': 'Florida',
            'GA': 'Georgia',
            'HI': 'Hawaii',
            'ID': 'Idaho',
            'IL': 'Illinois',
            'IN': 'Indiana',
            'IA': 'Iowa',
            'KS': 'Kansas',
            'KY': 'Kentucky',
            'LA': 'Louisiana',
            'ME': 'Maine',
            'MD': 'Maryland',
            'MA': 'Massachusetts',
            'MI': 'Michigan',
            'MN': 'Minnesota',
            'MS': 'Mississippi',
            'MO': 'Missouri',
            'MT': 'Montana',
            'NE': 'Nebraska',
            'NV': 'Nevada',
            'NH': 'New Hampshire',
            'NJ': 'New Jersey',
            'NM': 'New Mexico',
            'NY': 'New York',
            'NC': 'North Carolina',
            'ND': 'North Dakota',
            'OH': 'Ohio',
            'OK': 'Oklahoma',
            'OR': 'Oregon',
            'PA': 'Pennsylvania',
            'RI': 'Rhode Island',
            'SC': 'South Carolina',
            'SD': 'South Dakota',
            'TN': 'Tennessee',
            'TX': 'Texas',
            'UT': 'Utah',
            'VT': 'Vermont',
            'VA': 'Virginia',
            'WA': 'Washington',
            'WV': 'West Virginia',
            'WI': 'Wisconsin',
            'WY': 'Wyoming',
        }
        # with connection_scope() as conn:
            # for key, value in states.items():
            #     state = key
            #     full_state = value
            #     crime_type = 'Homicide'
            #     murder_counts = get_state_murder_counts(state, full_state, 2021, 2024)
            #     insert_crime_data(conn, full_state, murder_counts, crime_type)
            # cur = conn.cursor()
            # cur.execute('SELECT * FROM CrimeData')
            # print(cur.fetchall())
            # cur.close()
            
           
    except Error as error:
        print(error)

# if __name__ == "__main__":
    
#     main()
