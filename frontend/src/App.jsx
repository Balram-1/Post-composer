import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import AuthPage from "./AuthPage";
import "./App.css";

const API_URL = "http://localhost:3001/api/posts";

const PLATFORMS = {
  Facebook: { color: "#1877F2", limit: 63206 },
  Instagram: { color: "#E1306C", limit: 2200 },
  LinkedIn: { color: "#0A66C2", limit: 3000 },
  X: { color: "#000000", limit: 280 },
  Snapchat: { color: "#FFFC00", limit: 250 },
  Reddit: { color: "#FF4500", limit: 40000 },
  Quora: { color: "#B92B27", limit: 50000 },
};

const STATUSES = ["Draft", "Schedule", "Published"];

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("X");
  const [status, setStatus] = useState("Draft");
  const [mediaUrl, setMediaUrl] = useState("");
  const [posts, setPosts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchPosts();
  }, [session]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };
  }

  async function fetchPosts() {
    try {
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    
    if (content.length > PLATFORMS[platform].limit) {
      setMessage({ type: "error", text: "Character limit exceeded for this platform!" });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const url = editId ? `${API_URL}/${editId}` : API_URL;
      const method = editId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({ title, content, platform, status: status.toLowerCase(), media_url: mediaUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      setMessage({ type: "success", text: editId ? "Post updated!" : `Post saved as ${status}!` });
      setTitle("");
      setContent("");
      setMediaUrl("");
      setEditId(null);
      fetchPosts();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("Failed to delete");
      setMessage({ type: "success", text: "Post deleted!" });
      fetchPosts();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(post) {
    setEditId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setPlatform(post.platform);
    setStatus(post.status.charAt(0).toUpperCase() + post.status.slice(1));
    setMediaUrl(post.media_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setPosts([]);
  }

  function timeAgo(dateString) {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const handleFileChange = (e) => {
    // For this mockup, we'll just store a dummy local URL to simulate an upload
    // In a real app, you'd upload the file to Supabase Storage and get a public URL
    const file = e.target.files[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setMediaUrl(fakeUrl);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <span className="spinner large-spinner"></span>
      </div>
    );
  }

  if (!session) {
    return <AuthPage onLogin={(s) => setSession(s)} />;
  }

  const currentPlatform = PLATFORMS[platform];
  const userEmail = session.user.email;
  const username = session.user.user_metadata?.username || userEmail.split("@")[0];
  const charLimitExceeded = content.length > currentPlatform.limit;

  const filteredPosts = posts.filter(post => {
    const matchPlatform = filterPlatform === "All" || post.platform === filterPlatform;
    const matchStatus = filterStatus === "All" || (post.status || 'published').toLowerCase() === filterStatus.toLowerCase();
    return matchPlatform && matchStatus;
  });

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo_post.png" alt="icon" className="brand-logo" />
          <span className="brand-name">Post Composer</span>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-link active">
            <span className="nav-icon">+</span> Compose
          </a>
          <a href="#" className="nav-link">
            <span className="nav-icon">#</span> Drafts
            <span className="nav-count">{posts.filter(p => p.status === 'draft').length}</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="platform-preview" style={{ background: currentPlatform.color }}>
            <span className="platform-dot"></span>
            <span>Posting to {platform}</span>
          </div>

          <div className="user-info">
            <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{username}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Toast Message */}
        {message && (
          <div className={`toast toast-${message.type}`}>
            <span>{message.type === "success" ? "✓" : "!"}</span>
            {message.text}
          </div>
        )}

        {/* Composer Section */}
        <section className="composer-section">
          <div className="section-header">
            <h1>Create Post</h1>
            <p>Draft your content, select status and choose a platform</p>
          </div>

          <form onSubmit={handleSubmit} className="composer-form">
            <div className="row-controls">
              <div className="input-group">
                <label>Status</label>
                <div className="status-selector">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`status-btn ${status === s ? "active" : ""}`}
                      onClick={() => setStatus(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>Select Platform</label>
              <div className="platform-selector">
                {Object.entries(PLATFORMS).map(([name, info]) => (
                  <button
                    key={name}
                    type="button"
                    className={`platform-btn ${platform === name ? "active" : ""}`}
                    onClick={() => setPlatform(name)}
                    style={platform === name ? { background: info.color } : {}}
                  >
                    <span className="platform-dot-btn" style={{ background: info.color }}></span>
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="title">Post Title</label>
              <input
                id="title"
                type="text"
                placeholder="Give your post a catchy title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div className="label-row">
                <label htmlFor="content">Post Content</label>
                <span className={`char-count ${charLimitExceeded ? "limit-exceeded" : ""}`}>
                  {content.length} / {currentPlatform.limit.toLocaleString()}
                </span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar ${content.length > currentPlatform.limit ? 'danger' : content.length > currentPlatform.limit * 0.8 ? 'warning' : 'safe'}`}
                  style={{ width: `${Math.min(100, (content.length / currentPlatform.limit) * 100)}%` }}
                ></div>
              </div>
              <textarea
                id="content"
                placeholder="What's on your mind? Write your post content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="input-group">
              <label>Media Upload (Optional)</label>
              <label className="file-upload-wrapper">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <span className="file-label-text">
                  {mediaUrl ? "Media attached (click to replace)" : "📎 Click to upload an image or video"}
                </span>
              </label>
              {mediaUrl && (
                <div style={{ marginTop: "10px", borderRadius: "8px", overflow: "hidden", maxWidth: "200px" }}>
                  <img src={mediaUrl} alt="Preview" style={{ width: "100%", height: "auto" }} />
                </div>
              )}
            </div>

            <div className="submit-actions">
              <button
                type="submit"
                className="submit-btn"
                disabled={isSaving || charLimitExceeded}
                style={{ background: currentPlatform.color }}
              >
                {isSaving ? (
                  <>
                    <span className="spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>{editId ? "Update Post" : `Save as ${status}`}</>
                )}
              </button>
              {editId && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditId(null);
                    setTitle("");
                    setContent("");
                    setMediaUrl("");
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Posts Feed */}
        <section className="feed-section">
          <div className="section-header feed-header">
            <div>
              <h2>Your Posts</h2>
              <span className="post-count-badge">{filteredPosts.length} saved</span>
            </div>
            
            <div className="feed-filters">
              <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="filter-select">
                <option value="All">All Platforms</option>
                {Object.keys(PLATFORMS).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
                <option value="All">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No posts found</h3>
              <p>No posts match your filters or you haven't created any yet.</p>
            </div>
          ) : (
            <div className="posts-grid">
              {filteredPosts.map((post) => {
                const p = PLATFORMS[post.platform] || PLATFORMS.X;
                return (
                  <article key={post.id} className="post-card">
                    <div className="card-accent" style={{ background: p.color }}></div>
                    <div className="card-body">
                      <div className="card-top">
                        <div className="card-badges">
                          <div className="card-platform" style={{ background: p.color }}>
                            {post.platform}
                          </div>
                          <div className="card-status">
                            {post.status || 'published'}
                          </div>
                        </div>
                        <span className="card-time">{timeAgo(post.created_at)}</span>
                      </div>
                      <h3 className="card-title">{post.title}</h3>
                      <p className="card-content">{post.content}</p>
                      
                      {post.media_url && (
                        <div className="card-media">
                          <img src={post.media_url} alt="Post media" />
                        </div>
                      )}

                      <div className="card-actions">
                        <button className="edit-btn" onClick={() => handleEdit(post)}>
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                        >
                          {deletingId === post.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
