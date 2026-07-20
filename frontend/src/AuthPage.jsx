import { useState } from "react";
import { supabase } from "./supabaseClient";
import "./AuthPage.css";

function AuthPage({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        if (data.session) {
          onLogin(data.session);
        } else if (data.user) {
          // Fallback just in case email verification is still accidentally left on
          onLogin(null); // or handle it somehow, but we'll just alert to remind them
          alert("Please disable 'Confirm email' in your Supabase Dashboard (Auth -> Providers -> Email) to fully remove email verification.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin(data.session);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left panel - branding */}
        <div className="auth-branding">
          <img src="/logo_post.png" alt="Logo" className="auth-logo" />
          <h1>Post Composer</h1>
          <p>Create, save, and manage your social media posts in one place.</p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="feature-dot" style={{ background: "#E1306C" }}></span>
              Instagram
            </div>
            <div className="auth-feature">
              <span className="feature-dot" style={{ background: "#1DA1F2" }}></span>
              X (Twitter)
            </div>
            <div className="auth-feature">
              <span className="feature-dot" style={{ background: "#E60023" }}></span>
              Pinterest
            </div>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
            <p>
              {isSignUp
                ? "Sign up to start composing posts"
                : "Log in to your account"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            {isSignUp && (
              <div className="auth-input-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="auth-input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {isSignUp ? "Creating Account..." : "Logging In..."}
                </>
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <div className="auth-switch">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              className="auth-switch-btn"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
