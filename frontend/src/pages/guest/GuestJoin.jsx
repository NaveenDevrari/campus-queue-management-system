import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function GuestJoin() {
  /* ==========================
     DEBUG – CONFIRM FILE LOAD
  ========================== */
  console.log("🔥 GUEST JOIN FILE LOADED 🔥");

  /* ==========================
     REQUIRED HOOKS (MUST EXIST)
  ========================== */
  const location = useLocation();
  const navigate = useNavigate();

  const [departmentId, setDepartmentId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ==========================
     ENSURE GUEST IS ANONYMOUS
  ========================== */
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }, []);

  /* ==========================
     READ DEPARTMENT ID (HASH ROUTER ✅)
  ========================== */
  useEffect(() => {
    const search =
      location.search ||
      (location.hash.includes("?")
        ? location.hash.split("?")[1]
        : "");

    const params = new URLSearchParams(search);
    const deptId = params.get("departmentId");

    console.log("📌 Department ID:", deptId);

    if (!deptId) {
      setMessage("Invalid or expired QR code");
      return;
    }

    setDepartmentId(deptId);
  }, [location.search, location.hash]);

  /* ==========================
     JOIN QUEUE
  ========================== */
  const handleJoin = async () => {
    if (!departmentId) return;

    try {
      setLoading(true);
      setMessage("");

      const guestToken = localStorage.getItem("guestToken");

      const res = await api.post(
        "/guest/join",
        { departmentId, name, phone },
        {
          headers: guestToken ? { "x-guest-token": guestToken } : {},
          withCredentials: true,
        }
      );

      localStorage.setItem("guestToken", res.data.guestToken);
      navigate("/guest/ticket");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to join queue");
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     AUTO DISMISS MESSAGE
  ========================== */
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(t);
  }, [message]);

  /* ==========================
     UI
  ========================== */
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden text-slate-100">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1330] via-[#0f1f4d] to-[#141b3a]" />

      {/* GLOWS */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-600/25 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-40 w-[400px] h-[400px] bg-indigo-600/25 rounded-full blur-3xl" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-10 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg mb-3">
            CQ
          </div>
          <h2 className="text-xl font-bold text-blue-100">
            Campus Queue
          </h2>
        </div>

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            Join Queue
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Enter your details to get a ticket
          </p>
        </div>

        {message && (
          <div className="mb-6 text-center text-sm text-red-400">
            {message}
          </div>
        )}

        {/* INPUTS */}
        <input
          placeholder="Your Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-5 py-4 mb-4 rounded-xl bg-white/10 border border-white/10 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
        />

        <input
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-5 py-4 mb-6 rounded-xl bg-white/10 border border-white/10 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
        />

        {/* BUTTON */}
        <button
          onClick={handleJoin}
          disabled={loading || !departmentId}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
        >
          {loading ? "Joining..." : "Join Queue"}
        </button>

        <p className="mt-6 text-center text-xs text-slate-400">
          You will receive a ticket number after joining
        </p>
      </div>
    </div>
  );
}
