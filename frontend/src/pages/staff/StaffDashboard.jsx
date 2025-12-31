import { useEffect, useState, useRef } from "react";
import {
  getStaffProfile,
  callNextTicket,
  completeTicket,
  toggleQueue,
  increaseQueueLimit,
  getQueueStats,
} from "../../services/staff";
import api from "../../services/api"; // ✅ USE CENTRALIZED API
import { socket } from "../../services/socket";

export default function StaffDashboard() {
  const [staff, setStaff] = useState(null);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [increaseBy, setIncreaseBy] = useState("");

  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const [completing, setCompleting] = useState(false);

  /* =========================
     QUEUE STATS
  ========================= */
  const [stats, setStats] = useState({
    total: 0,
    served: 0,
    remaining: 0,
  });

  /* =========================
     SOCKET JOIN GUARD
  ========================= */
  const joinedRef = useRef(false);

  /* =========================
     INIT
  ========================= */
  useEffect(() => {
    fetchStaff();
    fetchStats();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await getStaffProfile();
      setStaff(data);

      if (!joinedRef.current && data?.department?._id) {
        socket.emit("join_department", data.department._id);
        joinedRef.current = true;
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load staff");
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getQueueStats();
      setStats(data);
    } catch (err) {
      console.error("Stats error:", err.response?.data);
    }
  };

  /* =========================
     SOCKET EVENTS
  ========================= */
  useEffect(() => {
    const onTicketCalled = (data) => {
      setCurrentTicket(data.ticketNumber);
      fetchStats();
    };

    const onTicketCompleted = () => {
      setCurrentTicket(null);
      setCompleting(false);
      fetchStats();
    };

    socket.on("ticket_called", onTicketCalled);
    socket.on("ticket_completed", onTicketCompleted);

    return () => {
      socket.off("ticket_called", onTicketCalled);
      socket.off("ticket_completed", onTicketCompleted);
    };
  }, []);

  /* =========================
     ACTIONS
  ========================= */
  const handleCallNext = async () => {
    try {
      const data = await callNextTicket();
      setCurrentTicket(data.ticketNumber);
      setMessage(data.message);
      fetchStats();
    } catch (err) {
      setMessage(err.response?.data?.message || "No tickets in queue");
    }
  };

  const handleCompleteTicket = async () => {
    if (completing) return;

    try {
      setCompleting(true);
      const data = await completeTicket();
      setMessage(data.message);
      fetchStats();
    } catch (err) {
      setMessage(err.response?.data?.message || "No active ticket");
      setCompleting(false);
    }
  };

  const handleToggleQueue = async () => {
    try {
      const data = await toggleQueue();
      setMessage(data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to toggle queue");
    }
  };

  const handleIncreaseLimit = async () => {
    if (!increaseBy || Number(increaseBy) <= 0) return;

    try {
      const data = await increaseQueueLimit(Number(increaseBy));
      setMessage(`Queue limit updated to ${data.maxTickets}`);
      setIncreaseBy("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update limit");
    }
  };

  /* =========================
     FIXED QR GENERATION (NO LOCALHOST)
  ========================= */
  const handleGenerateQR = async () => {
    try {
      setQrLoading(true);

      const res = await api.get("/staff/department/qr");

      setQrData(res.data);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to generate QR");
    } finally {
      setQrLoading(false);
    }
  };

  /* =========================
     AUTO DISMISS MESSAGE
  ========================= */
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2f6] via-[#e6ecf5] to-[#dfe7f1] px-6 pt-10 pb-20">
      {/* HEADER */}
      <section className="max-w-6xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-slate-900">
          Staff Dashboard
        </h1>
        <p className="text-slate-600 mt-2">
          Managing queue for{" "}
          <span className="font-medium text-slate-800">
            {staff?.department?.name || "your department"}
          </span>
        </p>
      </section>

      {/* NOW SERVING */}
      <section className="max-w-6xl mx-auto mb-14 text-center">
        <p className="uppercase tracking-widest text-sm text-slate-500 mb-4">
          Now Serving
        </p>

        <div className="text-[96px] font-extrabold text-blue-600 leading-none">
          {currentTicket || "--"}
        </div>

        {!currentTicket && (
          <p className="mt-3 text-sm text-slate-500">
            No active ticket right now
          </p>
        )}

        {/* STATS */}
        <div className="mt-8 flex justify-center gap-6 flex-wrap">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Served" value={stats.served} color="emerald" />
          <StatCard label="Remaining" value={stats.remaining} color="blue" />
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleCallNext}
            disabled={stats.remaining === 0}
            className="px-12 py-4 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-slate-900 transition shadow-xl disabled:opacity-50"
          >
            Call Next
          </button>

          <button
            onClick={handleCompleteTicket}
            disabled={!currentTicket || completing}
            className="px-12 py-4 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow-xl disabled:opacity-50"
          >
            {completing ? "Completing…" : "Complete Ticket"}
          </button>
        </div>
      </section>

      {/* SETTINGS + QR */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* QUEUE SETTINGS */}
        <div className="space-y-10">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Queue Settings
            </h3>
            <p className="text-sm text-slate-500">
              Availability and capacity controls
            </p>
          </div>

          <div className="flex items-center justify-between bg-white/70 p-6 rounded-2xl shadow border">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Queue Status
              </p>
              <p className="text-xs text-slate-500">
                Allow or pause new entries
              </p>
            </div>
            <button
              onClick={handleToggleQueue}
              className="px-6 py-3 rounded-xl bg-red-500/80 text-white font-semibold hover:bg-red-600 transition"
            >
              Open / Close
            </button>
          </div>

          <div className="bg-white/70 p-6 rounded-2xl shadow border space-y-4">
            <p className="text-sm font-medium text-slate-800">
              Max Queue Limit
            </p>

            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Enter limit"
                value={increaseBy}
                onChange={(e) => setIncreaseBy(e.target.value)}
                className="flex-1 px-5 py-3 rounded-xl border border-slate-300 bg-white"
              />
              <button
                onClick={handleIncreaseLimit}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-slate-900 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* GUEST QR */}
        <div className="relative overflow-hidden rounded-3xl p-8 shadow-xl border border-blue-400 bg-gradient-to-b from-white/90 via-[#f5f8fc] to-[#eef2f8] text-center">
          <div className="relative space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Guest Queue Access
            </h3>

            {!qrData ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">
                  Generate a QR for visitors to join
                </p>
                <button
                  onClick={handleGenerateQR}
                  disabled={qrLoading}
                  className="px-10 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {qrLoading ? "Generating…" : "Generate QR"}
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-slate-300 bg-white p-4 mx-auto w-56">
                  <img src={qrData.qrCode} alt="Guest QR" />
                </div>

                <div className="px-4 py-3 rounded-xl bg-slate-100 border border-slate-300 text-sm break-all">
                  {qrData.joinUrl}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* MESSAGE TOAST */}
      {message && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
          <div className="px-6 py-3 rounded-xl bg-green-100 border border-green-400 text-green-800 shadow-lg">
            {message}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   STAT CARD
========================= */
function StatCard({ label, value, color = "slate" }) {
  const colorMap = {
    slate: "text-slate-900",
    blue: "text-blue-600",
    emerald: "text-emerald-600",
  };

  return (
    <div className="px-6 py-4 rounded-2xl bg-white shadow border text-center min-w-[120px]">
      <p className="text-xs text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-2xl font-bold ${colorMap[color]}`}>
        {value}
      </p>
    </div>
  );
}
