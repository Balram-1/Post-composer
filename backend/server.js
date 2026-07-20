require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Auth middleware: extracts token and creates an authenticated Supabase client
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  // Create a Supabase client using the user's JWT token
  // This means RLS policies will apply based on the logged-in user
  req.supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  req.token = token;
  next();
}

// Apply auth middleware to all /api routes
app.use("/api", authMiddleware);

app.get("/api/posts", async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/posts", async (req, res) => {
  try {
    const { title, content, platform, status, media_url } = req.body;

    if (!title || !content || !platform) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Get the user's ID from the token
    const { data: { user }, error: userError } = await req.supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { data, error } = await req.supabase
      .from("posts")
      .insert([{ 
        title, 
        content, 
        platform, 
        user_id: user.id,
        status: status || 'draft',
        media_url: media_url || null
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await req.supabase
      .from("posts")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ message: "Post deleted" });
  } catch (error) {
    console.error("Error deleting post:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, platform, status, media_url } = req.body;

    if (!title || !content || !platform) {
      return res.status(400).json({ error: "Title, content, and platform are required" });
    }

    const { data, error } = await req.supabase
      .from("posts")
      .update({ title, content, platform, status: status || 'draft', media_url: media_url || null })
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error("Error updating post:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server is running at http://localhost:${PORT}`);
});
