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
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden text-slate-100">

      {/* BACKGROUND (MATCH HOME / ADMIN) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1330] via-[#0f1f4d] to-[#141b3a]" />

      {/* SOFT GLOWS */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-600/25 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-40 w-[400px] h-[400px] bg-indigo-600/25 rounded-full blur-3xl" />

      {/* CARD */}
      <div
        className="
          relative z-10
          w-full max-w-xl
          rounded-3xl
          bg-white/5 backdrop-blur-xl
          border border-white/10
          px-12 py-14
          shadow-[0_30px_90px_rgba(0,0,0,0.55)]
          transition-all duration-300
          hover:shadow-[0_45px_130px_rgba(0,0,0,0.75)]
          hover:scale-[1.01]
          animate-login-card
        "
      >
        {/* LOGO (SAME AS FOOTER / NAV) */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="
              w-14 h-14 rounded-xl
              bg-blue-600
              flex items-center justify-center
              text-white font-bold text-lg
              shadow-lg
              mb-4
            "
          >
            CQ
          </div>

          <h2 className="text-2xl font-bold text-blue-100 tracking-tight">
            Campus Queue
          </h2>
        </div>

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1
            className="
              text-3xl font-semibold
              bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400
              bg-clip-text text-transparent
              mb-2
            "
          >
            Welcome Back
          </h1>
          <p className="text-slate-400">
            Login to continue to Campus Queue
          </p>
        </div>

        {/* INPUTS */}
        <div className="space-y-6">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className="
              w-full px-5 py-4 rounded-xl
              bg-white/10 border border-white/10
              text-slate-100 placeholder-slate-400
              transition-all duration-300
              focus:outline-none
              focus:ring-2 focus:ring-violet-500/40
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
              bg-white/10 border border-white/10
              text-slate-100 placeholder-slate-400
              transition-all duration-300
              focus:outline-none
              focus:ring-2 focus:ring-violet-500/40
            "
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="
            w-full mt-10 py-4 rounded-xl
            text-white font-semibold text-lg
            bg-gradient-to-r from-blue-600 to-indigo-600
            shadow-lg
            transition-all duration-300
            hover:from-blue-700 hover:to-indigo-700
            hover:-translate-y-[1px]
            active:translate-y-0
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* FOOTER */}
        <p className="text-center text-slate-400 mt-8">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-violet-400 font-medium cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </p>
      </div>

      {/* ANIMATION */}
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
