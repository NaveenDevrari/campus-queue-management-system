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
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#eef2f6] to-[#dbe3ee]" />

      {/* Spotlight */}
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
          w-full max-w-lg
          rounded-3xl
          bg-white/95 backdrop-blur-md
          px-10 py-10
          shadow-[0_22px_60px_rgba(0,0,0,0.12)]
          transition-all duration-300
          hover:shadow-[0_36px_95px_rgba(0,0,0,0.18)]
          hover:scale-[1.01]
          animate-auth-card
        "
      >
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="
              w-12 h-12 rounded-xl bg-blue-600
              flex items-center justify-center
              text-white font-bold text-lg
              shadow-md mb-3
              transition-all duration-300
              hover:bg-blue-700 hover:shadow-lg
            "
          >
            CQ
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Campus Queue
          </h2>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-700">
            Create Account
          </h1>
          <p className="text-slate-500 text-sm">
            Sign up to start using Campus Queue
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            className="
              w-full px-4 py-3.5 rounded-xl
              border border-slate-300 bg-white text-slate-800
              transition-all duration-300
              hover:shadow-md hover:border-slate-400
              focus:outline-none focus:border-blue-600
              focus:ring-1 focus:ring-blue-600/30
            "
          />

          <input
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className="
              w-full px-4 py-3.5 rounded-xl
              border border-slate-300 bg-white text-slate-800
              transition-all duration-300
              hover:shadow-md hover:border-slate-400
              focus:outline-none focus:border-blue-600
              focus:ring-1 focus:ring-blue-600/30
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
              border border-slate-300 bg-white text-slate-800
              transition-all duration-300
              hover:shadow-md hover:border-slate-400
              focus:outline-none focus:border-blue-600
              focus:ring-1 focus:ring-blue-600/30
            "
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="
              w-full px-4 py-3.5 rounded-xl
              border border-slate-300 bg-white text-slate-800
              transition-all duration-300
              hover:shadow-md hover:border-slate-400
              focus:outline-none focus:border-blue-600
              focus:ring-1 focus:ring-blue-600/30
            "
          >
            <option value="" disabled>
              Role
            </option>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          disabled={loading || !form.role}
          className="
            w-full mt-6 py-3.5 rounded-xl
            text-white font-semibold
            bg-blue-600
            transition-all duration-300
            shadow-lg
            hover:bg-slate-900 hover:shadow-xl
            hover:-translate-y-[1px]
            active:translate-y-0
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {loading ? "Creating account..." : "Signup"}
        </button>

        {/* Footer */}
        <p className="text-center text-slate-500 mt-5 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>

      {/* Animation */}
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
