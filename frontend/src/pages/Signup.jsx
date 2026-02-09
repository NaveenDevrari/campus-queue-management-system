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
        {/* BACK BUTTON */}
        <button 
          onClick={() => navigate("/")} 
          className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-full transition-all border border-transparent hover:border-white/10 text-sm group"
          title="Back to Home"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back
        </button>

        {/* LOGO */}
        <div className="flex flex-col items-center mb-10 relative mt-4">
          <div
            className="
              w-14 h-14 rounded-2xl
              bg-gradient-to-br from-blue-500 to-indigo-600
              flex items-center justify-center
              text-white font-bold text-2xl
              shadow-lg shadow-blue-500/30 mb-4
            "
          >
            CQ
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            Campus Queue
          </h2>
        </div>

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-200 to-violet-200 mb-2">
            Create Account
          </h1>
          <p className="text-slate-400 text-sm">
            Join the campus network today
          </p>
        </div>

        {/* INPUTS */}
        <div className="space-y-5">
          <div className="group">
            <input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              className="
                w-full px-5 py-4 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder-slate-500
                focus:bg-white/10 focus:border-blue-500/50
                focus:ring-4 focus:ring-blue-500/10
                transition-all duration-300 outline-none
              "
            />
          </div>

          <div className="group">
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              className="
                w-full px-5 py-4 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder-slate-500
                focus:bg-white/10 focus:border-blue-500/50
                focus:ring-4 focus:ring-blue-500/10
                transition-all duration-300 outline-none
              "
            />
          </div>

          <div className="group">
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="
                w-full px-5 py-4 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder-slate-500
                focus:bg-white/10 focus:border-blue-500/50
                focus:ring-4 focus:ring-blue-500/10
                transition-all duration-300 outline-none
              "
            />
          </div>

          <div className="relative group">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="
                w-full px-5 py-4 rounded-xl
                bg-white/5 border border-white/10
                text-white
                focus:bg-white/10 focus:border-blue-500/50
                focus:ring-4 focus:ring-blue-500/10
                transition-all duration-300 outline-none
                appearance-none cursor-pointer
              "
            >
              <option value="" disabled>Select Role</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
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
