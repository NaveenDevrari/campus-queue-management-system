import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // ✅ USE CENTRALIZED API
import { socket } from "../../services/socket";

export default function GuestTicket() {
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [currentServing, setCurrentServing] = useState(null);
  const [message, setMessage] = useState("");

  const joinedRef = useRef(false);

  /* ==========================
     SOCKET CONNECT LOG
  ========================== */
  useEffect(() => {
    socket.on("connect", () => {
      console.log("🟢 Guest socket connected:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  /* ==========================
     RESTORE TICKET (UNCHANGED)
  ========================== */
  useEffect(() => {
    const restoreTicket = async () => {
      const guestToken = localStorage.getItem("guestToken");

      if (!guestToken) {
        navigate("/guest/join");
        return;
      }

      try {
        const res = await api.get("/guest/restore", {
          headers: { "x-guest-token": guestToken },
          withCredentials: true,
        });

        setTicket(res.data);
      } catch {
        localStorage.removeItem("guestToken");
        navigate("/guest/join");
      } finally {
        setLoading(false);
      }
    };

    restoreTicket();
  }, [navigate]);

  /* ==========================
     LIVE SOCKET UPDATES
  ========================== */
  useEffect(() => {
    if (!ticket?.departmentId) return;

    if (!joinedRef.current) {
      socket.emit("join_department", ticket.departmentId);
      joinedRef.current = true;
    }

    socket.on("ticket_called", (data) => {
      setCurrentServing(data.ticketNumber);
      if (data.ticketNumber === ticket.ticketNumber) {
        setIsMyTurn(true);
      }
    });

    socket.on("ticket_completed", () => {
      setCurrentServing(null);
      setIsMyTurn(false);
    });

    return () => {
      socket.off("ticket_called");
      socket.off("ticket_completed");
    };
  }, [ticket]);

  /* ==========================
     CANCEL TICKET (UNCHANGED)
  ========================== */
  const handleCancel = async () => {
    const guestToken = localStorage.getItem("guestToken");
    if (!guestToken) return;

    try {
      await api.post(
        "/guest/cancel",
        {},
        {
          headers: { "x-guest-token": guestToken },
          withCredentials: true,
        }
      );

      localStorage.removeItem("guestToken");
      socket.disconnect();
      navigate("/guest/join");
    } catch {
      setMessage("Failed to cancel ticket");
    }
  };

  /* ==========================
     AUTO-DISMISS MESSAGE
  ========================== */
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  /* ==========================
     ESTIMATED TIME (NEW)
  ========================== */
  const estimatedTime =
    ticket?.position && ticket.position > 0
      ? ticket.position * 5
      : null;

  /* ==========================
     UI STATES
  ========================== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300 bg-[#0b1220]">
        Loading your ticket…
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300 bg-[#0b1220]">
        No active ticket found.
      </div>
    );
  }

  /* ==========================
     UI
  ========================== */
  return (
    <div className="relative min-h-screen flex justify-center px-4 py-12 overflow-hidden text-slate-100">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1330] via-[#0f1f4d] to-[#141b3a]" />

      {/* GLOWS */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-600/25 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-40 w-[400px] h-[400px] bg-indigo-600/25 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-100">
            Your Queue Ticket
          </h1>
          <p className="text-slate-400 mt-2">
            Please wait until your number is called
          </p>
        </div>

        {/* NOW SERVING */}
        <div className="text-center mb-12">
          <p className="uppercase tracking-widest text-sm text-slate-400 mb-3">
            Now Serving
          </p>
          <div className="text-7xl font-extrabold text-blue-500 leading-none">
            {currentServing || "--"}
          </div>

          {isMyTurn && (
            <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold text-lg shadow-lg animate-pulse">
              🔔 It’s your turn! Please proceed
            </div>
          )}
        </div>

        {/* TICKET CARD */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
          <h3 className="text-lg font-semibold text-blue-100 mb-6 text-center">
            Ticket Details
          </h3>

          <div className="grid grid-cols-2 gap-6 text-slate-300">
            <div>
              <p className="text-xs text-slate-400">Ticket Number</p>
              <p className="text-2xl font-bold text-blue-500">
                {ticket.ticketNumber}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Department</p>
              <p className="font-semibold">{ticket.department}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Status</p>
              <p className="font-semibold capitalize">{ticket.status}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Position</p>
              <p className="font-semibold">{ticket.position}</p>
            </div>

            {/* ✅ ESTIMATED TIME */}
            <div className="col-span-2 text-center mt-2">
              <p className="text-xs text-slate-400">
                Estimated Waiting Time
              </p>
              <p className="text-lg font-semibold text-indigo-400">
                {estimatedTime ? `≈ ${estimatedTime} minutes` : "--"}
              </p>
            </div>
          </div>

          <button
            onClick={handleCancel}
            disabled={isMyTurn}
            className="mt-10 w-full py-3 rounded-xl bg-red-500/80 text-white font-semibold hover:bg-red-600 transition disabled:opacity-50"
          >
            Cancel Ticket
          </button>
        </div>

        {message && (
          <div className="mt-6 text-center text-sm text-red-400">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
