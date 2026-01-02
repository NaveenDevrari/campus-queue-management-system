import { useEffect, useRef, useState } from "react";
import {
  getDepartments,
  joinQueue,
  getMyActiveTicket,
  cancelQueue,
} from "../../services/student";
import { socket } from "../../services/socket";

export default function StudentDashboard() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [ticketInfo, setTicketInfo] = useState(null);
  const [message, setMessage] = useState("");
  const [nowServing, setNowServing] = useState("--");
  const [myDepartmentId, setMyDepartmentId] = useState(null);

  const [queueOpen, setQueueOpen] = useState(true);
  const [queueLimit, setQueueLimit] = useState(null);

  const joinedRoomRef = useRef(false);

  /* =========================
     SOCKET SETUP
  ========================= */
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onTicketCalled = (data) => {
      setNowServing(data.ticketNumber);
    };

    const onTicketCompleted = (data) => {
      if (ticketInfo && data.ticketNumber === ticketInfo.ticketNumber) {
        resetState("Your ticket has been completed. You may join again.");
      }
    };

    const onTicketCancelled = () =>
      resetState("You have left the queue.");

    const onQueueStatusChanged = (data) =>
      setQueueOpen(data.isOpen);

    const onQueueLimitUpdated = (data) =>
      setQueueLimit(data.maxTickets);

    socket.on("ticket_called", onTicketCalled);
    socket.on("ticket_completed", onTicketCompleted);
    socket.on("ticket_cancelled", onTicketCancelled);
    socket.on("queue_status_changed", onQueueStatusChanged);
    socket.on("queue_limit_updated", onQueueLimitUpdated);

    return () => {
      socket.off("ticket_called", onTicketCalled);
      socket.off("ticket_completed", onTicketCompleted);
      socket.off("ticket_cancelled", onTicketCancelled);
      socket.off("queue_status_changed", onQueueStatusChanged);
      socket.off("queue_limit_updated", onQueueLimitUpdated);
    };
  }, [ticketInfo]);

  /* =========================
     RESTORE ACTIVE TICKET
  ========================= */
  useEffect(() => {
    const restoreTicket = async () => {
      try {
        const ticket = await getMyActiveTicket();
        if (ticket) {
          setTicketInfo(ticket);
          setMyDepartmentId(ticket.departmentId);
          setSelectedDept(ticket.departmentId);
          joinRoomOnce(ticket.departmentId);
        }
      } catch {}
    };
    restoreTicket();
  }, []);

  /* =========================
     FETCH DEPARTMENTS
  ========================= */
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch {
      setMessage("Failed to load departments");
    }
  };

  const handleJoinQueue = async () => {
    try {
      const data = await joinQueue(selectedDept);
      setTicketInfo(data);
      setMyDepartmentId(selectedDept);
      setMessage(data.message);
      joinRoomOnce(selectedDept);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to join queue");
    }
  };

  const handleCancelQueue = async () => {
    try {
      const res = await cancelQueue(myDepartmentId);
      resetState(res.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to leave queue");
    }
  };

  const joinRoomOnce = (departmentId) => {
    if (!joinedRoomRef.current) {
      socket.emit("join_department", departmentId);
      joinedRoomRef.current = true;
    }
  };

  const resetState = (msg) => {
    setTicketInfo(null);
    setMyDepartmentId(null);
    setNowServing("--");
    setSelectedDept("");
    setMessage(msg);
    joinedRoomRef.current = false;
  };

  const isMyTurn =
    ticketInfo && ticketInfo.ticketNumber === nowServing;

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1330] via-[#0f1f4d] to-[#141b3a] px-6 pt-10 pb-20 text-slate-100">

      {/* HEADER */}
      <section className="max-w-6xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold
    bg-gradient-to-r
    from-violet-400 via-fuchsia-300 to-indigo-400
    bg-clip-text text-transparent">
          Student Dashboard
        </h1>
        <p className="text-slate-300 mt-3">
          Track your queue and move only when it’s your turn.
        </p>
      </section>

      {/* QUEUE STATUS */}
      {!queueOpen && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="px-6 py-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 font-medium">
            🚫 Queue is currently closed. Please wait.
          </div>
        </div>
      )}

      {queueLimit !== null && (
        <div className="max-w-6xl mx-auto mb-10">
          <div className="px-6 py-4 rounded-xl bg-blue-500/15 border border-blue-500/40 text-blue-300 font-medium">
            ℹ️ Queue limit: {queueLimit} students
          </div>
        </div>
      )}

      {/* NOW SERVING */}
      <section className="max-w-6xl mx-auto mb-20 text-center">
        <p className="uppercase tracking-widest text-sm text-slate-400 mb-3">
          Now Serving
        </p>

        <div className="text-[96px] font-extrabold text-blue-400 leading-none">
          {nowServing}
        </div>

        {isMyTurn && (
          <div className="mt-5 inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xl shadow-[0_0_30px_rgba(99,102,241,0.45)] animate-pulse">
            🔔 It’s your turn · Move to counter
          </div>
        )}
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">

        {/* JOIN QUEUE */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-100">
            Join a Department Queue
          </h3>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            disabled={!!ticketInfo || !queueOpen}
            className="w-full px-5 py-4 rounded-2xl bg-white/90 text-slate-900 border border-slate-300"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleJoinQueue}
            disabled={!selectedDept || !!ticketInfo || !queueOpen}
            className="mt-6 w-full py-4 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-slate-900 transition disabled:opacity-50"
          >
            {ticketInfo ? "Already in Queue" : "Join Queue"}
          </button>
        </div>

        {/* YOUR TICKET */}
        {ticketInfo && (
          <div className="relative bg-white/10 backdrop-blur rounded-3xl p-10 shadow-2xl border border-blue-500/40">
            <h3 className="text-lg font-semibold text-slate-100 mb-6">
              Your Ticket Details
            </h3>

            <div className="grid grid-cols-2 gap-6 text-slate-200">
              <div>
                <p className="text-xs text-slate-400">Ticket Number</p>
                <p className="text-2xl font-bold text-blue-400">
                  {ticketInfo.ticketNumber}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Position</p>
                <p className="text-2xl font-bold">
                  {ticketInfo.position}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Estimated Wait
                </p>
                <p className="text-2xl font-bold">
                  {ticketInfo.estimatedWaitTime}
                </p>
              </div>
            </div>

            <button
              onClick={handleCancelQueue}
              className="mt-10 px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
            >
              Leave Queue
            </button>
          </div>
        )}
      </section>

      {/* MESSAGE */}
      {message && (
        <div className="mt-12 flex justify-center">
          <div className="px-6 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-medium shadow-md">
            ✅ {message}
          </div>
        </div>
      )}
    </div>
  );
}
