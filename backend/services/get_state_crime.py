import requests
import json
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2 import Error
from db import connection_scope
import matplotlib.pyplot as plt

load_dotenv()
def get_state_murder_counts(state):
    # Get number of murders in florida

    url = f"https://api.usa.gov/crime/fbi/cde/shr/state/IL?type=counts&from=01-2024&to=08-2025&API_KEY={os.getenv('FBI_API_KEY')}"
    response = requests.get(url)
    data = response.json()
    return data['actuals'][state]

def insert_crime_data(conn, state, crime_counts, crime_type):
    try:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS CrimeData(
                id SERIAL PRIMARY KEY,
                state VARCHAR(20) NOT NULL,
                crime_type VARCHAR(20) NOT NULL,
                crime_counts INT NOT NULL,
                date DATE NOT NULL,
                UNIQUE(state, date)  -- Prevent duplicate state and date
            )
        """)
        for key, value in crime_counts.items():
            curr_date = key[3:] + '-' + key[:2] + '-' + '01'
            cur.execute("""
                INSERT INTO CrimeData (state, crime_type, crime_counts, date)
                VALUES (%s, %s, %s, %s)
            """, (state, crime_type, value, curr_date))
        conn.commit()
    except Error as error:
        print(error)


def get_crime_data(conn, state, crime_type):
    print(state, crime_type)
    cur = conn.cursor()
    cur.execute("SELECT TO_CHAR(date, 'MM-YYYY'), crime_counts FROM CrimeData WHERE state = %s AND crime_type = %s ORDER BY date ASC", (state, crime_type))
    return cur.fetchall()


def main():
    try:
        with connection_scope() as conn:
            state = 'Illinois'
            crime_type = 'Homicide'
            # murder_counts = get_state_murder_counts(state)
            # insert_crime_data(conn, state, murder_counts, crime_type)
            crime_data = get_crime_data(conn, state, crime_type)
            # crime_data is a list of tuples: [("MM-YYYY", count), ...]
            labels = [month_year for month_year, _ in crime_data]
            counts = [count for _, count in crime_data]

            plt.figure(figsize=(10, 4))
            plt.plot(labels, counts, marker='o')
            plt.xticks(rotation=45, ha='right')
            plt.xlabel('Month-Year')
            plt.ylabel('Homicides')
            plt.title(f'{crime_type} in {state}')
            plt.tight_layout()
            plt.show()
    except Error as error:
        print(error)

