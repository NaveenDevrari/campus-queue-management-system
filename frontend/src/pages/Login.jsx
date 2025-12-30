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
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#eef2f6] to-[#dbe3ee]" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.10) 35%, rgba(0,0,0,0.03) 60%, rgba(0,0,0,0) 75%)",
        }}
      />

      {/* Card */}
      <div
        className="
          relative z-10
          w-full max-w-xl
          rounded-3xl
          bg-white/95 backdrop-blur-md
          px-12 py-14
          shadow-[0_25px_70px_rgba(0,0,0,0.12)]
          transition-all duration-300
          hover:shadow-[0_40px_110px_rgba(0,0,0,0.18)]
          hover:scale-[1.01]
          animate-login-card
        "
      >
        {/* LOGO */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="
              w-14 h-14 rounded-xl bg-blue-600
              flex items-center justify-center
              text-white font-bold text-lg
              shadow-md mb-4
              transition-all duration-300
              hover:bg-blue-700 hover:shadow-lg
            "
          >
            CQ
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Campus Queue
          </h2>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-slate-700 mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-500">
            Login to continue to Campus Queue
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className="
              w-full px-5 py-4 rounded-xl
              border border-slate-300
              bg-white text-slate-800
              transition-all duration-300
              hover:shadow-md hover:border-slate-400
              focus:outline-none
              focus:border-blue-600
              focus:ring-1 focus:ring-blue-600/30
            "
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="
              w-full px-5 py-4 rounded-xl
              border border-slate-300
              bg-white text-slate-800
              transition-all duration-300
              hover:shadow-md hover:border-slate-400
              focus:outline-none
              focus:border-blue-600
              focus:ring-1 focus:ring-blue-600/30
            "
          />
        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="
            w-full mt-10 py-4 rounded-xl
            text-white font-semibold text-lg
            bg-blue-600
            transition-all duration-300
            shadow-lg
            hover:bg-slate-900 hover:shadow-xl
            hover:-translate-y-[1px]
            active:translate-y-0
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Footer */}
        <p className="text-center text-slate-500 mt-8">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 font-medium cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </p>
      </div>

      {/* Animation */}
      <style>
        {`
          @keyframes loginCard {
            from {
              opacity: 0;
              transform: translateY(24px) scale(0.97);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .animate-login-card {
            animation: loginCard 0.6s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
}
