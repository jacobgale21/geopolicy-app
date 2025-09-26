import requests
import json
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2 import Error
import matplotlib.pyplot as plt
import sys
import hashlib 

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db import connection_scope
load_dotenv()

def hash_user_id(user_id):
    """Hash user ID using SHA-256 for privacy"""
    return hashlib.sha256(user_id.encode()).hexdigest()

def save_user_interests(conn, user_id, interests):
    try:
        hashed_user_id = hash_user_id(user_id)
        cur = conn.cursor()
        cur.execute("CREATE TABLE IF NOT EXISTS user_interests (user_id VARCHAR(255) PRIMARY KEY, interests TEXT[])")
        # Use UPSERT to handle existing users
        cur.execute("INSERT INTO user_interests (user_id, interests) VALUES (%s, %s) ON CONFLICT (user_id) DO UPDATE SET interests = %s", 
                   (hashed_user_id, interests, interests))
        conn.commit()
    except Error as error:
        print("Error with inserting user interests", error)
    finally:
        cur.close()

def fetch_user_interests(conn, user_id):
    try:
        hashed_user_id = hash_user_id(user_id)
        cur = conn.cursor()
        cur.execute("SELECT interests FROM user_interests WHERE user_id = %s", (hashed_user_id,))
        result = cur.fetchone()
        return result[0] if result else None
    except Error as error:
        print("Error with getting user interests", error)
        return None
    finally:
        cur.close()

