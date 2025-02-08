import mysql.connector
from mysql.connector import Error

class DBConnection:
    def __init__(self, host, user, password, database):
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.connection = None

    def connect(self):
        """Establish and return a connection to the MySQL database."""
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database
            )
            if self.connection.is_connected():
                print(f"Connected to MySQL database: {self.database}")
        except Error as e:
            print(f"Error: {e}")
            self.connection = None

    def get_connection(self):
        """Return the active connection if available, else attempt to reconnect."""
        if self.connection is None or not self.connection.is_connected():
            self.connect()
        return self.connection

    def close_connection(self):
        """Close the database connection if it exists."""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("MySQL connection closed.")
