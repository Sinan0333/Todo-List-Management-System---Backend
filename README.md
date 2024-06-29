# Todo List Management System

## Overview

This project is a Todo List Management System built using Node.js, Express.js, and MongoDB. It provides functionalities to manage todo items including adding, updating, deleting, filtering, uploading from CSV, and downloading to CSV.

---

## Setup

### Prerequisites

- Node.js installed on your local machine
- MongoDB connection URI (`MONGO_URL`) configured in `.env` file

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd todo-list-management-system-backend

2. **Install dependencies:**
   ```bash
   npm install

3. **Create a .env file in the root directory and add the following:**
   ```bash
   MONGO_URL
   PORT

4. **Start the server using:**
   ```bash
   npm start


The server will run on http://localhost:3000 by default.


## API Endpoints

GET /todos
Returns all todos.

GET /todo/:id
Returns a specific todo by ID.

POST /todo
Adds a new todo.

PUT /todo/:id
Updates an existing todo by ID.

DELETE /todo/:id
Deletes a todo by ID.

POST /todos/upload
Uploads todos from a CSV file.

GET /todos/download
Downloads todos as a CSV file.

GET /todos/filter?status=<status>
Filters todos by status (pending or completed).

Testing.
Run tests using:npm test

## Dependencies

Express.js: Web framework for Node.js.
MongoDB and Mongoose: Database and ODM for MongoDB.
Multer: Middleware for handling file uploads.
json2csv: Converts JSON data to CSV format.
dotenv: Loads environment variables from a .env file.
Jest: Testing framework.
