from flask import Flask
from flask_cors import CORS  # Import CORS
from dotenv import load_dotenv
import os

# Import the routes from routes.py
from routes import routes

# Load environment variables from the .env file
load_dotenv()

app = Flask(__name__)

# Initialize CORS to allow requests from React app
CORS(app)  # This will allow all origins. You can restrict it to your frontend URL if needed, like CORS(app, origins="http://localhost:5173")

# Register the blueprint for routes
app.register_blueprint(routes)

if __name__ == '__main__':
    app.run(debug=True)
