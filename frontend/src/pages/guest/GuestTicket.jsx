import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../../services/socket";

export default function GuestTicket() {
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [currentServing, setCurrentServing] = useState(null);
  const [message, setMessage] = useState("");

  /* ==========================
     SOCKET JOIN GUARD
  ========================== */
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
     RESTORE TICKET
  ========================== */
  useEffect(() => {
    const restoreTicket = async () => {
      const guestToken = localStorage.getItem("guestToken");

      if (!guestToken) {
        navigate("/guest/join");
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:5000/api/guest/restore",
          {
            headers: { "x-guest-token": guestToken },
          }
        );

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
     CANCEL TICKET
  ========================== */
  const handleCancel = async () => {
    const guestToken = localStorage.getItem("guestToken");
    if (!guestToken) return;

    try {
      await axios.post(
        "http://localhost:5000/api/guest/cancel",
        {},
        { headers: { "x-guest-token": guestToken } }
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

    const timer = setTimeout(() => {
      setMessage("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [message]);

  /* ==========================
     UI STATES
  ========================== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading your ticket…
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        No active ticket found.
      </div>
    );
  }

  /* ==========================
     UI
  ========================== */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2f6] via-[#e6ecf5] to-[#dfe7f1] px-4 py-10 flex justify-center">

      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">
            Your Queue Ticket
          </h1>
          <p className="text-slate-600 mt-2">
            Please wait until your number is called
          </p>
        </div>

        {/* NOW SERVING */}
        <div className="text-center mb-12">
          <p className="uppercase tracking-widest text-sm text-slate-500 mb-3">
            Now Serving
          </p>
          <div className="text-7xl font-extrabold text-blue-600 leading-none">
            {currentServing || "--"}
          </div>

          {isMyTurn && (
            <div
              className="
                mt-6 inline-flex items-center gap-3
                px-6 py-3 rounded-full
                bg-emerald-600 text-white
                font-semibold text-lg
                shadow-lg animate-pulse
              "
            >
              🔔 It’s your turn! Please proceed
            </div>
          )}
        </div>

        {/* TICKET CARD */}
        <div
          className="
            bg-white/90 rounded-3xl p-8
            shadow-xl border border-slate-300
          "
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-6 text-center">
            Ticket Details
          </h3>

          <div className="grid grid-cols-2 gap-6 text-slate-700">
            <div>
              <p className="text-xs text-slate-500">Ticket Number</p>
              <p className="text-2xl font-bold text-blue-600">
                {ticket.ticketNumber}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Department</p>
              <p className="font-semibold">
                {ticket.department}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Status</p>
              <p className="font-semibold capitalize">
                {ticket.status}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Position</p>
              <p className="font-semibold">
                {ticket.position}
              </p>
            </div>
          </div>

          {/* CANCEL */}
          <button
            onClick={handleCancel}
            disabled={isMyTurn}
            className="
              mt-10 w-full py-3 rounded-xl
              bg-red-500/80 text-white font-semibold
              hover:bg-red-600 transition
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Cancel Ticket
          </button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mt-6 text-center text-sm text-red-600">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
