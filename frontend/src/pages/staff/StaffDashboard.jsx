import { useEffect, useState, useRef } from "react";
import {
  getStaffProfile,
  callNextTicket,
  completeTicket,
  toggleQueue,
  increaseQueueLimit,
  getQueueStats,
  getPendingEmergencies, // 👈 ADD THIS
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

  // 🚨 Emergency
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyNote, setEmergencyNote] = useState("");

  const [emergencies, setEmergencies] = useState([]);



  const [pendingEmergencies, setPendingEmergencies] = useState(0);


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

  const fetchEmergencyCount = async () => {
  try {
    const res = await api.get("/staff/emergency/count");
    setPendingEmergencies(res.data.count);
  } catch (err) {
    console.error("Failed to fetch emergency count", err);
  }
};

const fetchEmergencies = async () => {
  try {
    const data = await getPendingEmergencies();
    setEmergencies(data);
  } catch (err) {
    console.error("Failed to fetch emergencies", err);
  }
};


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

    const onEmergencyStarted = (data) => {
      setEmergencyActive(true);
      setEmergencyNote(data?.note || "Emergency in progress");
      setCurrentTicket("EMERGENCY");
    };

    const onEmergencyEnded = () => {
      setEmergencyActive(false);
      setEmergencyNote("");
      setCurrentTicket(null);
    };

    socket.on("ticket_called", onTicketCalled);
    socket.on("ticket_completed", onTicketCompleted);
    socket.on("emergency_started", onEmergencyStarted);
    socket.on("emergency_ended", onEmergencyEnded);

    return () => {
      socket.off("ticket_called", onTicketCalled);
      socket.off("ticket_completed", onTicketCompleted);
      socket.off("emergency_started", onEmergencyStarted);
      socket.off("emergency_ended", onEmergencyEnded);
    };
  }, []);

  
   useEffect(() => {
  // initial load
  fetchEmergencyCount();
  fetchEmergencies();

  const onEmergencyRequested = () => {
    fetchEmergencyCount();
    fetchEmergencies(); // 👈 THIS IS THE KEY LINE
  };

  socket.on("emergency_requested", onEmergencyRequested);

  return () => {
    socket.off("emergency_requested", onEmergencyRequested);
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

  


  // 🚨 Emergency handlers
  const handleStartEmergency = async () => {
  try {
    await api.post("/staff/emergency/start", {
      note: "Emergency in progress",
    });

    setPendingEmergencies(0);
    setEmergencies([]); // ✅ ADD THIS LINE
  } catch {
    setMessage("Failed to start emergency");
  }
};



  const handleEndEmergency = async () => {
    try {
      await api.post("/staff/emergency/end");
    } catch {
      setMessage("Failed to resolve emergency");
    }
  };

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleRejectEmergency = async (id) => {
  try {
    await api.post(`/staff/emergency/reject/${id}`);
    setMessage("Emergency rejected");
    fetchEmergencyCount();
    fetchEmergencies();
  } catch {
    setMessage("Failed to reject emergency");
  }
};

const handleApproveEmergency = async (id) => {
  try {
    await api.post(`/staff/emergency/approve/${id}`);
    setMessage("Emergency approved");

    fetchEmergencyCount();
    fetchEmergencies();
  } catch {
    setMessage("Failed to approve emergency");
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1330] via-[#0f1f4d] to-[#141b3a] px-6 pt-12 pb-24 text-slate-100">

      {/* HEADER */}
      <section className="max-w-6xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent">
          Staff Dashboard
        </h1>
        <p className="text-slate-300 mt-3">
          Managing queue for{" "}
          <span className="font-semibold text-slate-100">
            {staff?.department?.name || "your department"}
          </span>
        </p>
      </section>

      {/* 🚨 EMERGENCY REQUEST ALERT */}
{pendingEmergencies > 0 && !emergencyActive && (
  <section className="max-w-6xl mx-auto mb-12">
    <div className="rounded-2xl border border-red-500 bg-red-600/20 p-6 shadow-lg">
      <h3 className="text-lg font-bold text-red-400">
        🚨 Emergency Requests
      </h3>

      <p className="mt-2 text-4xl font-extrabold text-red-300">
        {pendingEmergencies}
      </p>

      <p className="text-sm text-red-200">
        Pending student emergency request
        {pendingEmergencies > 1 ? "s" : ""}
      </p>
    </div>
  </section>
)}

        {/* 🚨 EMERGENCY DETAILS PANEL */}

{emergencies.length > 0 && !emergencyActive && (
  <section className="max-w-6xl mx-auto mb-16">
    <h3 className="text-xl font-bold text-red-400 mb-6">
      🚨 Emergency Requests (Verification Required)
    </h3>

    <div className="grid gap-6">
      {emergencies.map((e) => (
        <div
          key={e._id}
          className="bg-red-600/10 border border-red-500/30 rounded-2xl p-6"
        >
          {/* STUDENT INFO */}
          <p className="font-semibold text-slate-100">
            Student: {e.student?.name} ({e.student?.email})
          </p>

          {/* REASON */}
          <p className="mt-3 text-red-200">
            <span className="font-semibold">Reason:</span> {e.reason}
          </p>

          {/* PROOF IMAGE */}
          {e.proof && (
            <a
              href={`http://localhost:5000${e.proof}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 text-blue-400 underline"
            >
              📎 View Proof Image
            </a>
          )}

          {/* ACTION BUTTONS */}
          <div className="mt-6 flex gap-4">
            {/* ✅ APPROVE */}
            <button
              onClick={() => handleApproveEmergency(e._id)}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              ✅ Approve
            </button>

            {/* ❌ REJECT */}
            <button
              onClick={() => handleRejectEmergency(e._id)}
              className="px-6 py-3 rounded-xl bg-gray-700 text-white font-semibold hover:bg-gray-800"
            >
              ❌ Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
)}






      {/* NOW SERVING */}
      <section className="max-w-6xl mx-auto mb-20 text-center">
        <p className="uppercase tracking-widest text-sm text-slate-400 mb-4">
          Now Serving
        </p>

        <div className="text-[96px] font-extrabold text-violet-400 drop-shadow-lg">
          {currentTicket || "--"}
        </div>

        {emergencyActive && (
          <p className="mt-4 text-red-400 font-semibold">
            🚨 Emergency Mode Active
          </p>
        )}

        <div className="mt-10 flex justify-center gap-6 flex-wrap">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Served" value={stats.served} color="emerald" />
          <StatCard label="Remaining" value={stats.remaining} color="violet" />
        </div>

        <div className="mt-12 flex gap-5 justify-center flex-wrap">
          <button
            onClick={handleCallNext}
            disabled={stats.remaining === 0 || emergencyActive}
            className="px-12 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:opacity-90 disabled:opacity-40"
          >
            Call Next
          </button>

          <button
            onClick={handleCompleteTicket}
            disabled={!currentTicket || completing || emergencyActive}
            className="px-12 py-4 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-40"
          >
            {completing ? "Completing…" : "Complete Ticket"}
          </button>
        </div>

        {/* 🚨 EMERGENCY CONTROLS */}
        <div className="mt-6 flex gap-4 justify-center flex-wrap">
          {!emergencyActive ? (
            <button
              onClick={handleStartEmergency}
              className="px-10 py-4 rounded-2xl bg-red-600 text-white font-semibold"
            >
              🚨 Call Emergency
            </button>
          ) : (
            <button
              onClick={handleEndEmergency}
              className="px-10 py-4 rounded-2xl bg-emerald-600 text-white font-semibold"
            >
              ✅ Resolve Emergency
            </button>
          )}
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
