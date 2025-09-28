import psycopg2
from psycopg2 import Error
import pandas as pd
import os
import dotenv
import sys
dotenv.load_dotenv()
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db import connection_scope

def get_senators(conn):
    try:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS Senators(
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                state VARCHAR(2),
                party VARCHAR(20),
                gender VARCHAR(1),
                url VARCHAR(255),
                address VARCHAR(255),
                phone VARCHAR(15),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(name, state)  -- Prevent duplicate senators
            )
        """)

        # Read CSV file with error handling
        try:
            df = pd.read_csv("../legislator_data/legislators-current.csv")
            print(f"Successfully loaded CSV with {len(df)} records")
        except FileNotFoundError:
            print("Error: CSV file not found. Please check the file path.")
            exit(1)
        except Exception as e:
            print(f"Error reading CSV file: {e}")
            exit(1)

        # Filter and clean data
        df = df[["full_name", "state", "party", "gender", "url", "address", "phone", "type"]]
        senate_df = df[df["type"] == "sen"].copy()
        
        # Clean data - replace NaN values
        senate_df = senate_df.fillna({
            "full_name": "Unknown",
            "state": "Unknown",
            "party": "Unknown",
            "gender": "U",
            "url": "",
            "address": "",
            "phone": ""
        })
        
        print(f"Found {len(senate_df)} senators in the data")

        # Loop through the dataframe and insert the data into the database
        inserted_count = 0
        for index, row in senate_df.iterrows():
            try:
                record = (
                    row["full_name"], 
                    row["state"], 
                    row["party"], 
                    row["gender"], 
                    row["url"], 
                    row["address"], 
                    row["phone"]
                )
                
                # Use ON CONFLICT to handle duplicates
                insert_query = """
                    INSERT INTO Senators (name, state, party, gender, url, address, phone) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (name, state) DO NOTHING
                """
                cur.execute(insert_query, record)
                inserted_count += 1
                
            except Exception as e:
                print(f"Error inserting record for {row['full_name']}: {e}")
                continue
        conn.commit()
        print(f"{inserted_count} new senator records inserted successfully.")

        # Verify the data
        cur.execute("SELECT COUNT(*) FROM Senators")
        total_count = cur.fetchone()[0]
        print(f"Total senators in database: {total_count}")
    except Exception as e:
        print(f"Error while connecting to PostgreSQL for inserting senators: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'cur' in locals():
            cur.close()

def get_representatives(conn):
    try:
        cur = conn.cursor()
        # Create table for representatives if doesn't exist
        cur.execute("""
            CREATE TABLE IF NOT EXISTS Representatives(
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                state VARCHAR(2),
                district INT,
                party VARCHAR(20),
                gender VARCHAR(1),
                url VARCHAR(255),
                address VARCHAR(255),
                phone VARCHAR(15),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(name, state, district)  -- Prevent duplicate representatives
            )
        """)
        try:
            df = pd.read_csv("legislator_data/legislators-current.csv")
            print(f"Successfully loaded CSV with {len(df)} records")
            df = df[df["type"] == "rep"].copy()
            df = df.fillna({
                "full_name": "Unknown",
                "state": "Unknown",
                "party": "Unknown",
                "gender": "U",
            })
            print(f"Found {len(df)} representatives in the data")
            inserted_count = 0
            for index, row in df.iterrows():
                try:
                    record = (
                        row["full_name"],
                        row["state"],
                        row["district"],
                        row["party"],
                        row["gender"],
                        row["url"],
                        row["address"],
                        row["phone"]
                    )
                    insert_query = """
                        INSERT INTO Representatives (name, state, district, party, gender, url, address, phone)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (name, state, district) DO NOTHING
                    """
                    cur.execute(insert_query, record)
                    inserted_count += 1
                except Exception as e:
                    print(f"Error inserting record for {row['full_name']}: {e}")
                    continue
            conn.commit()
            print(f"{inserted_count} new representative records inserted successfully.")
            # Verify the data
        except FileNotFoundError:
            print("Error: CSV file not found. Please check the file path.")
            exit(1)
        except Exception as e:
            print(f"Error reading CSV file: {e}")
    except Exception as e:
        print(f"Error while connecting to PostgreSQL for inserting representatives: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'cur' in locals():
            cur.close()

def get_all_senators(conn):
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM Senators")
        result = cur.fetchall()
    except Exception as e:
        print(f"Error while connecting to PostgreSQL for getting all senators: {e}")
    finally:
        cur.close()
        return result

def get_all_representatives(conn):
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM Representatives")
        result = cur.fetchall()
    except Exception as e:
        print(f"Error while connecting to PostgreSQL for getting all representatives: {e}")
    finally:
        cur.close()
        return result

def get_senator_state(conn, state):
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM Senators WHERE state = %s", (state,))
        result = cur.fetchall()
    except Exception as e:
        print(f"Error while connecting to PostgreSQL for getting senator state: {e}")
    finally:
        cur.close()
        return result

def get_representative_state(conn, state, district):
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM Representatives WHERE state = %s and district = %s", (state, district))
        result = cur.fetchall()
    except Exception as e:
        print(f"Error while connecting to PostgreSQL for getting representative state: {e}")
    finally:
        cur.close()
        return result

# def main():
#     with connection_scope() as conn:
#         try:
#             cur = conn.cursor()
#             leg_df = pd.read_csv("../legislator_data/HS119_members.csv")
#             senate_df = leg_df[leg_df["chamber"] == "Senate"].copy()
#             print(f"Processing {len(senate_df)} Senate records...")
            
#             # First, let's see what's in the Senators table
#             cur.execute("SELECT name, state FROM Senators LIMIT 5")
#             existing_senators = cur.fetchall()
#             print(f"Sample senators in database: {existing_senators}")
            
#             for index, row in senate_df.iterrows():
#                 names = row["bioname"].split(",")
#                 names[0] = names[0].title()
#                 print(f"Processing: {names[0]} from {row['state_abbrev']} with score {row['nominate_dim1']}")
                
#                 # Check if any senators match this name and state
#                 cur.execute("SELECT name, state FROM Senators WHERE name LIKE %s AND state = %s", (f"%{names[0]}%", row["state_abbrev"]))
#                 matches = cur.fetchall()
#                 print(f"Found {len(matches)} matches: {matches}")
                
#                 if matches:
#                     cur.execute("UPDATE Senators SET nominate_score = %s WHERE name LIKE %s AND state = %s", (row["nominate_dim1"], f"%{names[0]}%", row["state_abbrev"]))
#                     print(f"Updated {cur.rowcount} records")
#                 else:
#                     print(f"No matches found for {names[0]} in {row['state_abbrev']}")
#             conn.commit()
#             print("Nominate score added to Senators")
#         except Exception as e:
#             print(f"Error while connecting to PostgreSQL for adding nominate score: {e}")
#         finally:
#             cur.close()

# if __name__ == "__main__":
#     main()