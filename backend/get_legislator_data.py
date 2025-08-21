import psycopg2
from psycopg2 import Error
import pandas as pd
import os
import dotenv

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
            df = pd.read_csv("legislator_data/legislators-current.csv")
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

def main():
    # Load environment variables
    dotenv.load_dotenv()

    # Database configuration from environment variables
    db_config = {
        "host":  "localhost",
        "database": os.getenv("DB_NAME"),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("DB_PASSWORD"),
        "port": os.getenv("DB_PORT")
    }

    try:
        conn = psycopg2.connect(**db_config)
    except Exception as e:
        print("Error connecting db", e)
    
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(**db_config)
        # get_senators(conn)
        get_representatives(conn)


    except (Exception, Error) as error:
        print(f"Error while connecting to PostgreSQL: {error}")
        if 'conn' in locals():
            conn.rollback()
        
    finally:
        # Close communication
        if 'conn' in locals():
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    main()