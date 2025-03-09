import psycopg2
from dotenv import load_dotenv
import os,sys
load_dotenv()


def query_executor(query,query_type):
    connection = psycopg2.connect(password=os.getenv('PG_PASSWORD'),
                                  host=os.getenv('HOST'),
                                  port=os.getenv('PORT'),
                                  database=os.getenv('DATABASE'),
                                  options=os.getenv('OPTIONS'))
    with connection.cursor() as cursor:
        try:
            result = cursor.execute(query)
            if query_type == "SELECT":
                return cursor.fetchone()
        except psycopg2.Error as e:
            connection.rollback()
            raise e

        connection.commit()


