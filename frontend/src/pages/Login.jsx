import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import { socket } from "../services/socket";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      setLoading(true);

      const data = await loginUser(form);

      // ✅ AUTH LOGIC (UNCHANGED)
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      if (!socket.connected) socket.connect();

      if (data.user.role === "student") navigate("/student");
      if (data.user.role === "staff") navigate("/staff");
      if (data.user.role === "admin") navigate("/admin");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-md glass-card rounded-2xl shadow-xl p-8 border">
        
        {/* BACK BUTTON */}
        <button 
          onClick={() => navigate("/")} 
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full transition-all border border-transparent hover:border-[var(--glass-border)] text-sm group"
          title="Back to Home"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back
        </button>

        {/* HEADER */}
        <div className="text-center mb-8 mt-4">
          <div className="w-12 h-12 bg-[var(--accent-primary)] rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg shadow-[0_0_20px_rgba(0,212,170,0.3)]">
            CQ
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome Back</h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">Sign in to your account</p>
        </div>

        {/* INPUTS */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@campus.edu"
              value={form.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary w-full mt-8 py-3 text-lg shadow-lg shadow-blue-500/20"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* FOOTER */}
        <p className="text-center text-sm text-[var(--text-secondary)] mt-8">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
          >
            Create account
          </span>
        </p>

      </div>
    </div>
  );
}

