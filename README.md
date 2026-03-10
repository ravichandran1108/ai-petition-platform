# Online Petition Platform

A simple web application that allows users to create and sign petitions.

## Project Structure

```
online-petition/
├── frontend/           # React frontend
│   ├── src/            # React source code
│   ├── public/         # Public assets
│   └── package.json    # Frontend dependencies
├── mock-server.js      # Node.js backend API server
└── package.json        # Backend dependencies
```

## How to Run the Project

### Step 1: Start the Backend Server

```bash
# From the root directory
npm start
```

This will start the mock server at http://localhost:8080/api

### Step 2: Start the Frontend Application

```bash
# Open a new terminal
cd frontend
npm start
```

This will start the React application at http://localhost:3000

## Features

- View all petitions
- Create a new petition
- Sign existing petitions
- View petition details including signature count and comments

## API Endpoints

- `GET /api/petitions`: Get all petitions
- `GET /api/petitions/{id}`: Get a petition by ID
- `POST /api/petitions`: Create a new petition
- `POST /api/petitions/{id}/sign`: Sign a petition
- `DELETE /api/petitions/{id}`: Delete a petition

## Technologies Used

- **Frontend**: React.js with Bootstrap for styling
- **Backend**: Node.js with Express
- **Data Storage**: In-memory (non-persistent)

## Notes

- This is a simple demonstration project
- Data is stored in memory and will be lost when the server restarts
- No authentication or user management is implemented 