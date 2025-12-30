import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function GuestJoin() {
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
    // Remove authenticated user context
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }, []);

  /* ==========================
     READ DEPARTMENT ID FROM URL
  ========================== */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const deptId = params.get("departmentId");

    if (!deptId) {
      setMessage("Invalid or expired QR code");
      return;
    }

    setDepartmentId(deptId);
  }, [location.search]);

  /* ==========================
     JOIN QUEUE
  ========================== */
  const handleJoin = async () => {
    if (!departmentId) return;

    try {
      setLoading(true);
      setMessage("");

      const guestToken = localStorage.getItem("guestToken");

      const res = await axios.post(
        "http://localhost:5000/api/guest/join",
        {
          departmentId,
          name,
          phone,
        },
        {
          headers: guestToken
            ? { "x-guest-token": guestToken }
            : {},
        }
      );

      // Save guest token
      localStorage.setItem("guestToken", res.data.guestToken);

      // Redirect to ticket page
      navigate("/guest/ticket");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to join queue"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     AUTO-DISMISS MESSAGE
  ========================== */
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [message]);

  /* ==========================
     UI
  ========================== */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2f6] via-[#e6ecf5] to-[#dfe7f1] px-4 py-12 flex justify-center items-center">

      <div className="w-full max-w-md bg-white/90 rounded-3xl p-8 shadow-xl border border-slate-300">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Join Queue
          </h1>
          <p className="text-slate-600 mt-2">
            Enter your details to get a ticket
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mb-6 text-center text-sm text-red-600">
            {message}
          </div>
        )}

        {/* NAME */}
        <input
          placeholder="Your Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
            w-full px-5 py-4 mb-4 rounded-xl
            border border-slate-300 bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-600/30
          "
        />

        {/* PHONE */}
        <input
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="
            w-full px-5 py-4 mb-6 rounded-xl
            border border-slate-300 bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-600/30
          "
        />

        {/* JOIN BUTTON */}
        <button
          onClick={handleJoin}
          disabled={loading || !departmentId}
          className="
            w-full py-4 rounded-2xl
            bg-blue-600 text-white font-semibold
            hover:bg-slate-900 transition
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? "Joining..." : "Join Queue"}
        </button>

        {/* FOOTER NOTE */}
        <p className="mt-6 text-center text-xs text-slate-500">
          You will receive a ticket number after joining
        </p>
      </div>
    </div>
  );
}
