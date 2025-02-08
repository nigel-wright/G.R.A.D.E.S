# SE3309_Assignment4_2024

This repository contains 2 folders to be used to manage your final project assignment.

The APP folder is where you should commit all the code for your web application.

The DUMP folder should contain the database .dump file required to re-create your database and ALL of it's data.



# Project Setup and Instructions

## 1. Setting Up Dependencies

### 1.1 React Frontend

1. Navigate to the `react-app` directory:
   ```bash
   cd react-app
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

### 1.2 Python Backend

1. Navigate to the `python-backend` directory:
   ```bash
   cd python-backend
   ```

2. Install the necessary Python packages:
   ```bash
   pip install -r requirements.txt
   ```

---
### 1.3 Environment Variables

- Create a `.env` file in the `python-backend` directory.
- Add the following configuration to the `.env` file:
  ```bash
  USER='root'
  HOST='localhost'
  PASSWORD='XXXXXXXX'
  DATABASE='3309Proj'
  ```

  Replace `'XXXXXXXX'` with your actual MySQL password. This file will be used to load environment variables for your database connection.

---


## 2. Running the Application

### 2.1 Running the Python Backend

1. Navigate to the `python-backend` folder:
   ```bash
   cd python-backend
   ```

2. Start the Flask application:
   ```bash
   python app.py
   ```

   This will start the backend server on `http://localhost:5000`.

### 2.2 Running the React Frontend

1. Navigate to the `react-app` directory:
   ```bash
   cd react-app
   ```

2. Start the React development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`.

---

## 3. Backend and Frontend Integration

If you have questions regarding how the frontend communicates with the backend or how the backend queries the database, refer to the following:

- **Frontend Example**: The `Example` component demonstrates how to fetch data from the backend and display it in the frontend.
- **Backend Example**: The `example` route in `routes.py` shows how to handle incoming requests and query the database.

Both examples serve as a starting point for implementing the frontend-backend interaction.

---

## 4. Troubleshooting

- **CORS Issues**: If you encounter CORS issues when the frontend makes requests to the backend, ensure that `flask-cors` is properly configured in the backend.
- **Database Connection**: If there are issues with database connectivity, ensure that the database credentials in the `.env` file are correctly set up.

---

## 5. Additional Notes

- Ensure both the frontend and backend servers are running simultaneously for full functionality.
- After installing any new dependencies in the backend, update the `requirements.txt` file by running:
   ```bash
   pip freeze > requirements.txt







