import os
from contextlib import contextmanager
from typing import Generator

from dotenv import load_dotenv
import psycopg2
from psycopg2.pool import SimpleConnectionPool


load_dotenv()


DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "port": os.getenv("DB_PORT"),
}


_pool: SimpleConnectionPool | None = None


def _get_pool() -> SimpleConnectionPool:
    global _pool
    if _pool is None:
        _pool = SimpleConnectionPool(minconn=1, maxconn=10, **DB_CONFIG)
    return _pool


def get_connection():
    return _get_pool().getconn()


def release_connection(conn) -> None:
    if conn is not None:
        _get_pool().putconn(conn)


@contextmanager
def connection_scope():
    conn = get_connection()
    try:
        yield conn
    finally:
        release_connection(conn)


def db_dependency() -> Generator[psycopg2.extensions.connection, None, None]:
    conn = get_connection()
    try:
        yield conn
    finally:
        release_connection(conn)


