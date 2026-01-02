import { useEffect, useState, useRef } from "react";
import {
  getStaffProfile,
  callNextTicket,
  completeTicket,
  toggleQueue,
  increaseQueueLimit,
  getQueueStats,
} from "../../services/staff";
import api from "../../services/api";
import { socket } from "../../services/socket";

export default function StaffDashboard() {
  const [staff, setStaff] = useState(null);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [increaseBy, setIncreaseBy] = useState("");

  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const [completing, setCompleting] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    served: 0,
    remaining: 0,
  });

  const joinedRef = useRef(false);
  const qrSectionRef = useRef(null);

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
      console.error(err);
    }
  };

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

  useEffect(() => {
    const handleScrollToQR = () => {
      qrSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    window.addEventListener("scrollToQR", handleScrollToQR);
    return () => window.removeEventListener("scrollToQR", handleScrollToQR);
  }, []);

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
      setIsQueueOpen(data.isOpen);
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

  const handleGenerateQR = async () => {
    try {
      setQrLoading(true);
      const res = await api.get("/staff/department/qr");
      setQrData(res.data);
      setMessage("");
    } catch {
      setMessage("Failed to generate QR");
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1330] via-[#0f1f4d] to-[#141b3a] px-6 pt-12 pb-24 text-slate-100">

      {/* HEADER */}
      <section className="max-w-6xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold
    bg-gradient-to-r
    from-violet-400 via-fuchsia-300 to-indigo-400
    bg-clip-text text-transparent">
          Staff Dashboard
        </h1>
        <p className="text-slate-300 mt-3">
          Managing queue for{" "}
          <span className="font-semibold text-slate-100">
            {staff?.department?.name || "your department"}
          </span>
        </p>
      </section>

      {/* NOW SERVING */}
      <section className="max-w-6xl mx-auto mb-20 text-center">
        <p className="uppercase tracking-widest text-sm text-slate-400 mb-4">
          Now Serving
        </p>

        <div className="text-[96px] font-extrabold text-violet-400 drop-shadow-lg">
          {currentTicket || "--"}
        </div>

        <div className="mt-10 flex justify-center gap-6 flex-wrap">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Served" value={stats.served} color="emerald" />
          <StatCard label="Remaining" value={stats.remaining} color="violet" />
        </div>

        <div className="mt-12 flex gap-5 justify-center flex-wrap">
          <button
            onClick={handleCallNext}
            disabled={stats.remaining === 0}
            className="px-12 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:opacity-90 disabled:opacity-40"
          >
            Call Next
          </button>

          <button
            onClick={handleCompleteTicket}
            disabled={!currentTicket || completing}
            className="px-12 py-4 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-40"
          >
            {completing ? "Completing…" : "Complete Ticket"}
          </button>
        </div>
      </section>

      {/* SETTINGS + QR */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">

        {/* QUEUE SETTINGS */}
        <div className="space-y-10">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Queue Status</p>
              <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
                ${isQueueOpen ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}
              `}>
                <span className={`w-2 h-2 rounded-full ${isQueueOpen ? "bg-emerald-400" : "bg-red-400"}`} />
                {isQueueOpen ? "Queue Open" : "Queue Closed"}
              </div>
            </div>

            <button
              onClick={handleToggleQueue}
              className={`px-6 py-3 rounded-xl text-white font-semibold
                ${isQueueOpen
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"}
              `}
            >
              {isQueueOpen ? "Close Queue" : "Open Queue"}
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl">
            <p className="text-sm font-medium text-slate-200 mb-4">
              Max Queue Limit
            </p>
            <div className="flex gap-4">
              <input
                type="number"
                value={increaseBy}
                onChange={(e) => setIncreaseBy(e.target.value)}
                className="flex-1 px-5 py-3 rounded-xl bg-black/30 border border-white/10 text-slate-100 placeholder-slate-400"
                placeholder="Enter limit"
              />
              <button
                onClick={handleIncreaseLimit}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* QR SECTION */}
        <div
          ref={qrSectionRef}
          className="rounded-3xl p-8 shadow-xl border border-white/10 bg-white/5 backdrop-blur-xl text-center"
        >
          <h3 className="text-lg font-semibold mb-6 text-slate-100">
            Guest Queue Access
          </h3>

          {!qrData ? (
            <button
              onClick={handleGenerateQR}
              disabled={qrLoading}
              className="px-10 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              {qrLoading ? "Generating…" : "Generate QR"}
            </button>
          ) : (
            <>
              <img src={qrData.qrCode} alt="QR" className="mx-auto w-56" />
              <p className="mt-4 text-xs break-all text-slate-400">
                {qrData.joinUrl}
              </p>
            </>
          )}
        </div>
      </section>

      {message && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500/20 text-emerald-200 px-6 py-3 rounded-xl border border-emerald-500/30 backdrop-blur">
          {message}
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
    slate: "text-slate-100",
    violet: "text-violet-400",
    emerald: "text-emerald-400",
  };

  return (
    <div className="px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow text-center min-w-[120px]">
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[color]}`}>{value}</p>
    </div>
  );
}
