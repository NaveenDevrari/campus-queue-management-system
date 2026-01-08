import { useEffect, useRef, useState } from "react";
import {
  getDepartments,
  joinQueue,
  getMyActiveTicket,
  cancelQueue,
  getCrowdStatus,
} from "../../services/student";
import { socket } from "../../services/socket";

export default function StudentDashboard() {
  const [departments, setDepartments] = useState([]);

  const [joinDept, setJoinDept] = useState("");
  const [statusDept, setStatusDept] = useState("");

  const [ticketInfo, setTicketInfo] = useState(null);
  const [message, setMessage] = useState("");
  const [nowServing, setNowServing] = useState("--");
  const [myDepartmentId, setMyDepartmentId] = useState(null);

  const [queueOpen, setQueueOpen] = useState(true);
  const [queueLimit, setQueueLimit] = useState(null);
  const [crowdStatus, setCrowdStatus] = useState(null);

  // 🔔 ONE FLAG FOR BOTH VIBRATION + NOTIFICATION
  const [alertsEnabled, setAlertsEnabled] = useState(
    localStorage.getItem("alertsEnabled") === "true"
  );

  const joinedRoomRef = useRef(false);

  /* =========================
     🔄 SYNC WITH BROWSER PERMISSION (FIX)
  ========================= */
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        localStorage.setItem("alertsEnabled", "true");
        setAlertsEnabled(true);
      }
    }
  }, []);


  /* =========================
     SOCKET SETUP
  ========================= */
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onTicketCalled = (data) => {
      setNowServing(data.ticketNumber);

      // 🎯 MY TURN
      if (
        alertsEnabled &&
        ticketInfo &&
        data.ticketNumber === ticketInfo.ticketNumber
      ) {
        // 📳 VIBRATION
        if (navigator.vibrate) {
          navigator.vibrate([300, 150, 300, 150, 300]);
        }

        // 🔔 PUSH NOTIFICATION
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification("🎟️ It's Your Turn!", {
              body: "Please proceed to the counter now.",
              icon: "/icon-192.png",
              vibrate: [300, 150, 300],
            });
          });
        }
      }
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
  }, [ticketInfo, alertsEnabled]);

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
          setJoinDept(ticket.departmentId);
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
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch {
        setMessage("Failed to load departments");
      }
    };
    fetchDepartments();
  }, []);

  /* =========================
     FETCH CROWD STATUS
  ========================= */
  useEffect(() => {
    const fetchCrowd = async () => {
      if (!statusDept) {
        setCrowdStatus(null);
        return;
      }
      try {
        const data = await getCrowdStatus(statusDept);
        setCrowdStatus(data);
      } catch {
        setCrowdStatus(null);
      }
    };
    fetchCrowd();
  }, [statusDept]);

  /* =========================
     ACTIONS
  ========================= */
  const handleJoinQueue = async () => {
    try {
      const data = await joinQueue(joinDept);
      setTicketInfo(data);
      setMyDepartmentId(joinDept);
      setMessage(data.message);
      joinRoomOnce(joinDept);
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
    setJoinDept("");
    setNowServing("--");
    setMessage(msg);
    joinedRoomRef.current = false;
  };

  /* =========================
     ENABLE ALERTS (USER CLICK)
  ========================= */
  const enableAlerts = async () => {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Please allow notifications to receive alerts");
      return;
    }

    if (navigator.vibrate) navigator.vibrate(150);

    localStorage.setItem("alertsEnabled", "true");
    setAlertsEnabled(true);
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1330] via-[#0f1f4d] to-[#141b3a] px-6 pt-10 pb-20 text-slate-100">

      {/* HEADER */}
      <section className="max-w-6xl mx-auto mb-14">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent">
          Student Dashboard
        </h1>
        <p className="text-slate-300 mt-3">
          Track your queue and get alerted when it’s your turn.
        </p>

        {!alertsEnabled && (
          <button
            onClick={enableAlerts}
            className="mt-6 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold"
          >
            🔔 Enable Turn Alerts
          </button>
        )}
      </section>

      {/* CHECK QUEUE STATUS */}
      <section className="max-w-6xl mx-auto mb-20">
        <h3 className="text-lg font-semibold mb-4">Check Queue Status</h3>

        <select
          value={statusDept}
          onChange={(e) => setStatusDept(e.target.value)}
          className="w-full max-w-md px-5 py-4 rounded-xl bg-white text-slate-900"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>

        {crowdStatus && (
          <div className="mt-6 p-6 rounded-2xl bg-white/10 backdrop-blur border">
            <p className="font-bold">{crowdStatus.crowdLevel}</p>
            <p className="text-slate-300">
              Estimated wait: <b>{crowdStatus.estimatedWaitTime} mins</b>
            </p>
          </div>
        )}
      </section>

      {/* NOW SERVING */}
      <section className="max-w-6xl mx-auto mb-20 text-center">
        <p className="uppercase tracking-widest text-sm text-slate-400 mb-3">
          Now Serving
        </p>
        <div className="text-[96px] font-extrabold text-blue-400">
          {nowServing}
        </div>
      </section>

      {/* JOIN QUEUE */}
      <section className="max-w-6xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">Join Queue</h3>

        <select
          value={joinDept}
          onChange={(e) => setJoinDept(e.target.value)}
          disabled={!!ticketInfo || !queueOpen}
          className="w-full max-w-md px-5 py-4 rounded-xl bg-white text-slate-900"
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
          disabled={!joinDept || !!ticketInfo || !queueOpen}
          className="mt-6 w-full max-w-md py-4 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-50"
        >
          {ticketInfo ? "Already in Queue" : "Join Queue"}
        </button>

        {ticketInfo && (
          <div className="mt-12 bg-white/10 rounded-3xl p-8 border">
            <h3 className="text-lg font-semibold mb-4">Your Ticket</h3>
            <p>Ticket Number: <b>{ticketInfo.ticketNumber}</b></p>
            <p>Position: <b>{ticketInfo.position}</b></p>

            <button
              onClick={handleCancelQueue}
              className="mt-6 px-6 py-3 rounded-xl bg-red-600"
            >
              Leave Queue
            </button>
          </div>
        )}
      </section>

      {message && (
        <div className="mt-12 flex justify-center">
          <div className="px-6 py-3 rounded-xl bg-emerald-500/15 border text-emerald-300">
            ✅ {message}
          </div>
        </div>
      )}
    </div>
  );
}
