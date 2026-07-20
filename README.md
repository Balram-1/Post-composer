# Post Composer

A minimal full-stack application to create and save social media posts.

## Tech Stack

*   **Frontend**: React, Vite
*   **Backend**: Node.js, Express.js
*   **Database & Auth**: Supabase (PostgreSQL)

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
*   A Supabase project (create one at supabase.com)

### Environment Variables

Before starting the application, you need to configure your environment variables for Supabase. An `example.env` file is provided in the `backend` directory.

1.  Navigate to the `backend` directory.
2.  Duplicate the `example.env` file and rename the copy to `.env`.
3.  Open the newly created `.env` file in your editor.

#### How to configure `.env`

Your `.env` file should look like this:

```env
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find these:**
1. Go to your Supabase project dashboard.
2. Click on **Settings** (gear icon) -> **API**.
3. Copy the **Project URL** and paste it as `SUPABASE_URL`.
4. Copy the **anon** `public` key and paste it as `SUPABASE_ANON_KEY`.

### Database Setup

To make the app work, you need to set up your Supabase database schema. Run the following SQL command in your Supabase SQL Editor to create the `posts` table and add the necessary columns:

```sql
-- Create the base table if it doesn't exist
CREATE TABLE IF NOT EXISTS posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  platform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure the new columns required by the UI features are added
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID;
```

> **Important**: If you see an error like `Could not find the 'media_url' column of 'posts'`, it means you need to run the `ALTER TABLE` command above in your Supabase SQL editor!

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
    npm run dev
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
| `POST` | `/api/posts` | Create a new post | `{ title, content, platform, status, media_url }` |
| `PUT`  | `/api/posts/:id` | Update a post | `{ title, content, platform, status, media_url }` |
| `DELETE` | `/api/posts/:id` | Delete a post | None |

## License

This project is open-source and available under the MIT License.
