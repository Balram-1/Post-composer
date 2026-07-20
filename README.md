# Post Composer

A minimal full-stack application to create and save social media posts.

## Tech Stack

*   **Frontend**: React, Vite
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (via Mongoose)

## Project Structure

```text
Post Composer/
├── backend/            # Express API Server
│   ├── server.js       # Main server logic and routes
│   ├── package.json    # Backend dependencies
│   └── example.env     # Template for environment variables
├── frontend/           # React User Interface
│   ├── src/            # Frontend source code
│   ├── index.html      # HTML entry point
│   ├── vite.config.js  # Vite configuration
│   └── package.json    # Frontend dependencies
└── start-backend.bat   # Script to start the backend server
```

## Getting Started

### Prerequisites

*   Node.js (v14 or higher)
*   A MongoDB database (local or MongoDB Atlas)

### Environment Variables

Before starting the application, you need to configure your environment variables. An `example.env` file is provided in the `backend` directory.

1.  Navigate to the `backend` directory.
2.  Duplicate the `example.env` file and rename the copy to `.env`.
3.  Open the newly created `.env` file in your editor.

#### How to use MongoDB and configure `.env`

Your `.env` file should look like this:

```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
```

**If you are using MongoDB Atlas (Cloud):**
1. Log in to your MongoDB Atlas dashboard.
2. Go to your Cluster and click **Connect**.
3. Choose **Connect your application**.
4. Copy the connection string. It will look something like: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/post-composer?retryWrites=true&w=majority`
5. Replace `<username>` and `<password>` with your database user credentials.
6. Paste this complete string as the `MONGODB_URI` value in your `.env` file.

**If you are using Local MongoDB:**
1. Ensure your local MongoDB server is running.
2. Set the `MONGODB_URI` to your local connection string, for example: `mongodb://localhost:27017/post-composer`

### Installation

1.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    ```

2.  **Install frontend dependencies:**
    ```bash
    cd frontend
    npm install
    ```

### Running the Application

1.  **Start the backend server:**
    You can double-click the `start-backend.bat` file in the root directory, or run manually from the terminal:
    ```bash
    cd backend
    npm start
    ```
    The backend will run on `http://localhost:3001`.

2.  **Start the frontend development server:**
    Open a new terminal window:
    ```bash
    cd frontend
    npm run dev
    ```
    The frontend will run on `http://localhost:5173`. Open this URL in your browser.

## Screenshots

[Add screenshot of the main dashboard here]

[Add screenshot of the post creation flow here]

## API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET`  | `/api/posts` | Fetch all posts | None |
| `POST` | `/api/posts` | Create a new post | `{ title, content, platform }` |

## License

This project is open-source and available under the MIT License.
