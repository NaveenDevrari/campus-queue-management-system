import { useState } from "react";
import { signupUser } from "../services/auth";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      await signupUser(form);
      alert("Signup successful");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden text-slate-100">

      {/* BACKGROUND (SAME AS LOGIN) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1330] via-[#0f1f4d] to-[#141b3a]" />

      {/* SOFT GLOWS */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-600/25 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-40 w-[400px] h-[400px] bg-indigo-600/25 rounded-full blur-3xl" />

      {/* CARD */}
      <div
        className="
          relative z-10
          w-full max-w-lg
          rounded-3xl
          bg-white/5 backdrop-blur-xl
          border border-white/10
          px-10 py-10
          shadow-[0_30px_90px_rgba(0,0,0,0.55)]
          transition-all duration-300
          hover:shadow-[0_45px_130px_rgba(0,0,0,0.75)]
          hover:scale-[1.01]
          animate-auth-card
        "
      >
        {/* LOGO (MATCH LOGIN & FOOTER) */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="
              w-12 h-12 rounded-xl
              bg-blue-600
              flex items-center justify-center
              text-white font-bold text-lg
              shadow-lg mb-3
            "
          >
            CQ
          </div>

          <h2 className="text-xl font-bold text-blue-100">
            Campus Queue
          </h2>
        </div>

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1
            className="
              text-2xl font-semibold
              bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400
              bg-clip-text text-transparent
            "
          >
            Create Account
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Sign up to start using Campus Queue
          </p>
        </div>

        {/* INPUTS */}
        <div className="space-y-4">
          <input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            className="
              w-full px-4 py-3.5 rounded-xl
              bg-white/10 border border-white/10
              text-slate-100 placeholder-slate-400
              transition-all duration-300
              focus:outline-none
              focus:ring-2 focus:ring-violet-500/40
            "
          />

          <input
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className="
              w-full px-4 py-3.5 rounded-xl
              bg-white/10 border border-white/10
              text-slate-100 placeholder-slate-400
              transition-all duration-300
              focus:outline-none
              focus:ring-2 focus:ring-violet-500/40
            "
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="
              w-full px-4 py-3.5 rounded-xl
              bg-white/10 border border-white/10
              text-slate-100 placeholder-slate-400
              transition-all duration-300
              focus:outline-none
              focus:ring-2 focus:ring-violet-500/40
            "
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="
              w-full px-4 py-3.5 rounded-xl
              bg-white/10 border border-white/10
              text-slate-100
              transition-all duration-300
              focus:outline-none
              focus:ring-2 focus:ring-violet-500/40
            "
          >
            <option value="" disabled className="text-slate-500">
              Select Role
            </option>
            <option value="student" className="text-slate-900">
              Student
            </option>
            <option value="staff" className="text-slate-900">
              Staff
            </option>
          </select>
        </div>

        {/* SIGNUP BUTTON */}
        <button
          onClick={handleSignup}
          disabled={loading || !form.role}
          className="
            w-full mt-8 py-3.5 rounded-xl
            text-white font-semibold
            bg-gradient-to-r from-blue-600 to-indigo-600
            shadow-lg
            transition-all duration-300
            hover:from-blue-700 hover:to-indigo-700
            hover:-translate-y-[1px]
            active:translate-y-0
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {loading ? "Creating account..." : "Signup"}
        </button>

        {/* FOOTER */}
        <p className="text-center text-slate-400 mt-6 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-violet-400 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>

      {/* ANIMATION */}
      <style>
        {`
          @keyframes authCard {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.97);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .animate-auth-card {
            animation: authCard 0.55s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
}
