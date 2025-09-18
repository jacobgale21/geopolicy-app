import requests
import os
import dotenv
import sys 

dotenv.load_dotenv()
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db import connection_scope


def get_health_data(state):
    hello = "hello"
    url = "https://api.americashealthrankings.org/graphql"
    query = f"""
    query MeasuresSearch {{
        measures_A(
            where: {{ 
                name: {{ contains: "Diabetes" }}
                source: {{ name: {{ contains: "Behavioral Risk Factor Surveillance System" }} }}
            }}
        ) {{
            measureId
            name
            source {{ name }}
            data(where: {{ 
                state: {{ in: ["{state}"] }}
                dateLabel: {{ in: ["2020", "2021", "2022", "2023", "2024"] }}
            }}) {{
                dateLabel
                rank
                state
                value
            }}
        }}
    }}
    """
    headers = {
        "Content-Type": "application/json",
        "X-Api-Key": f"{os.getenv('HEALTH_DATA_API_KEY')}"
    }

    response = requests.post(url, json={"query": query}, headers=headers)
    return response.json()["data"]["measures_A"][1]

def get_health_data(state, name):
    url = "https://api.americashealthrankings.org/graphql"
    query = f"""
    query MeasuresSearch {{
        measures_A(
            where: {{ 
                name: {{ contains: "{name}" }}
            }}
        ) {{
            measureId
            name
            source {{ name }}
            data(where: {{ 
                state: {{ in: ["{state}"] }}
                dateLabel: {{ in: ["2020", "2021", "2022", "2023", "2024"] }}
            }}) {{
                dateLabel
                rank
                state
                value
            }}
        }}
    }}
    """
    headers = {
        "Content-Type": "application/json",
        "X-Api-Key": f"{os.getenv('HEALTH_DATA_API_KEY')}"
    }
    response = requests.post(url, json={"query": query}, headers=headers)
    return response.json()['data']['measures_A']

def find_health_data(data, name):
    for item in data:
        if item["name"] == name:
            return item
    return None

def find_measureid_data(data, measureid):
    for item in data:
        if item["measureId"] == measureid:
            return item
    return None

def insert_health_data(conn, data, name):
    cur = conn.cursor()
        # Create table if not exists
    cur.execute("""
        CREATE TABLE IF NOT EXISTS HealthData(
            state VARCHAR(20) NOT NULL,
            year INT NOT NULL,
            rank INT NOT NULL,
            name VARCHAR(20) NOT NULL,
            value FLOAT NOT NULL,
            PRIMARY KEY (state, year, name)
        )
    """)
    for item in data:
        if item["value"] is not None:
            cur.execute("""
                INSERT INTO HealthData (state, year, rank, name, value)
                VALUES (%s, %s, %s, %s, %s)
            """, (item["state"], int(item["dateLabel"]), item["rank"], name, item["value"]))
    conn.commit()
    cur.close()
        
def get_health_data_states(conn, state, name):
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM HealthData WHERE state = %s and name = %s", (state, name))
        result = cur.fetchall()
    except Error as error:
        print(error)
    finally:
        cur.close()
        return result

if __name__ == "__main__":
    states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]
           
    with connection_scope() as conn:
        # for state in states:
        #     data = find_health_data(get_health_data(state, "Cardiovascular Diseases"), "Cardiovascular Diseases")
        #     insert_health_data(conn, data["data"], "Heart Diseases")
        cur = conn.cursor()
        cur.execute("SELECT * FROM HealthData WHERE name = %s", ("Heart Diseases",))
        print(cur.fetchall())
        cur.close()
        conn.close()
    # print(find_health_data(get_health_data("FL", "Cardiovascular Diseases"), "Cardiovascular Diseases"))
    