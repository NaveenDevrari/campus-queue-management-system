import { useEffect, useRef, useState } from "react";
import {
  getDepartments,
  joinQueue,
  getMyActiveTicket,
  cancelQueue,
  getCrowdStatus,
  getMyTicketHistory,
} from "../../services/student";
import { socket } from "../../services/socket";
import { subscribeToPush } from "../../services/push";
import FeedbackModal from "../../components/student/FeedbackModal";
import { submitFeedback } from "../../services/student";
import api from "../../services/api";


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

  // 🆕 HISTORY
  const [ticketHistory, setTicketHistory] = useState([]);

  // 🆕 FEEDBACK
  const [feedbackTicketId, setFeedbackTicketId] = useState(null);
  const [submittedFeedback, setSubmittedFeedback] = useState([]);

  // 🚨 EMERGENCY REQUEST (student side)
const [emergencyActive, setEmergencyActive] = useState(false);
const [emergencyRequested, setEmergencyRequested] = useState(false);

  
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
const [emergencyReason, setEmergencyReason] = useState("");
const [emergencyProof, setEmergencyProof] = useState(null);



  /* 🔔 FINAL SINGLE SOURCE OF TRUTH (UI ONLY) */
  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    return localStorage.getItem("alertsEnabled") === "true";
  });

  const joinedRoomRef = useRef(false);

  /* =========================
     SOCKET SETUP
  ========================= */
  useEffect(() => {
    if (!socket.connected) socket.connect();
      const onEmergencyStarted = (data) => {
    setEmergencyActive(true);
    setNowServing("EMERGENCY");
    setMessage(
      data?.note || "🚨 Emergency in progress. Please wait."
    );
  };

  const onEmergencyEnded = () => {
    setEmergencyActive(false);
    setEmergencyRequested(false);
    setNowServing("--");
    setMessage("Emergency resolved. Queue resumed.");
  };


    const onTicketCalled = (data) => {
      setNowServing(data.ticketNumber);

      if (
        alertsEnabled &&
        ticketInfo &&
        data.ticketNumber === ticketInfo.ticketNumber
      ) {
        if (navigator.vibrate) {
          navigator.vibrate([300, 150, 300, 150, 300]);
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

    const onEmergencyYourTurn = () => {
  setEmergencyActive(true);
  setNowServing("EMERGENCY");
  setMessage("🚨 It’s your turn. Please proceed immediately.");
};

  const onEmergencyServed = () => {
  setEmergencyActive(false);
  setEmergencyRequested(false);
  setNowServing("--");
  setMessage("✅ You have been served. Thank you.");

  // 🔁 allow re-joining room later
  joinedRoomRef.current = false;
};



    socket.on("ticket_called", onTicketCalled);
    socket.on("ticket_completed", onTicketCompleted);
    socket.on("ticket_cancelled", onTicketCancelled);
    socket.on("queue_status_changed", onQueueStatusChanged);
    socket.on("queue_limit_updated", onQueueLimitUpdated);
    socket.on("emergency_started", onEmergencyStarted);
    socket.on("emergency_ended", onEmergencyEnded);
    socket.on("emergency_your_turn", onEmergencyYourTurn);
socket.on("emergency_served", onEmergencyServed);



    return () => {
      socket.off("ticket_called", onTicketCalled);
      socket.off("ticket_completed", onTicketCompleted);
      socket.off("ticket_cancelled", onTicketCancelled);
      socket.off("queue_status_changed", onQueueStatusChanged);
      socket.off("queue_limit_updated", onQueueLimitUpdated);
      socket.off("emergency_started", onEmergencyStarted);
      socket.off("emergency_ended", onEmergencyEnded);
      socket.off("emergency_your_turn", onEmergencyYourTurn);
socket.off("emergency_served", onEmergencyServed);


    };
  }, [ticketInfo, alertsEnabled]);

  /* =========================
   CHECK ACTIVE EMERGENCY
========================= */
useEffect(() => {
  if (!joinDept) return; // ⛔ DO NOT CALL API WITHOUT DEPARTMENT

  const checkEmergency = async () => {
    try {
      const res = await api.get("/student/emergency-status", {
        params: { departmentId: joinDept },
      });

      if (res.data?.active) {
        setEmergencyActive(true);
        setNowServing("EMERGENCY");
        setMessage("🚨 Emergency in progress. Please wait.");
      }
    } catch (err) {
      console.error("Emergency status check failed", err);
    }
  };

  checkEmergency();
}, [joinDept]); // 👈 THIS IS THE KEY


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
   JOIN USER ROOM (🔥 REQUIRED)
========================= */
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.id || payload._id;

    if (userId) {
      socket.emit("join_user", userId);
      console.log("👤 Joined user room:", userId);
    }
  } catch (err) {
    console.error("Failed to join user room", err);
  }
}, []);

   

  /* =========================
   JOIN ROOM WHEN DEPARTMENT IS SELECTED
========================= */
useEffect(() => {
  if (joinDept) {
    joinRoomOnce(joinDept);
  }
}, [joinDept]);


  /* =========================
     MOBILE RESUME FIX
  ========================= */
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        if (!socket.connected) socket.connect();

        try {
          const ticket = await getMyActiveTicket();
          if (ticket) {
            setTicketInfo(ticket);
            setMyDepartmentId(ticket.departmentId);
            setJoinDept(ticket.departmentId);

            joinRoomOnce(ticket.departmentId);

          }
        } catch (err) {
          if (err.response?.status === 401) {
    console.warn("Auth expired — skipping resume sync");
    return;
  }
  console.error("Resume sync failed", err);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
     FETCH TICKET HISTORY
  ========================= */
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getMyTicketHistory();
        setTicketHistory(data);
      } catch (err) {
        console.error("History fetch failed", err);
      }
    };
    fetchHistory();
  }, []);

  /* =========================
     ACTIONS
  ========================= */
  const handleJoinQueue = async () => {
    try {
      const data = await joinQueue(joinDept);
      const activeTicket = await getMyActiveTicket();
      setTicketInfo(activeTicket);

      setMyDepartmentId(joinDept);
      setMessage(data.message);
      joinRoomOnce(joinDept);
    } catch {
      setMessage("Failed to join queue");
    }
  };

  const handleCancelQueue = async () => {
    try {
      const res = await cancelQueue(myDepartmentId);
      resetState(res.message);
    } catch {
      setMessage("Failed to leave queue");
    }
  };

  const handleRequestEmergency = async () => {
  try {
    await api.post("/student/emergency-request", {
      departmentId: joinDept,
    });

    setEmergencyRequested(true);
    setMessage("Emergency request sent. Waiting for staff approval.");
  } catch (err) {
    setMessage(
      err.response?.data?.message || "Failed to request emergency"
    );
  }
};

const handleSubmitEmergencyForm = async () => {
  if (!emergencyReason || !emergencyProof) {
    setMessage("All emergency fields are required.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("departmentId", joinDept);
    formData.append("reason", emergencyReason);
    formData.append("proof", emergencyProof);

    await api.post("/student/emergency-request", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setEmergencyRequested(true);
    setShowEmergencyForm(false);
    setEmergencyReason("");
    setEmergencyProof(null);

    setMessage("Emergency request sent. Waiting for staff approval.");
  } catch (err) {
    setMessage(
      err.response?.data?.message || "Failed to request emergency"
    );
  }
};



  const handleSubmitFeedback = async (payload) => {
  try {
    await submitFeedback(payload);

    setFeedbackTicketId(null);
    setMessage("Thank you for your feedback.");

    // 🔥 IMPORTANT: refresh history so button disappears
    const updatedHistory = await getMyTicketHistory();
    setTicketHistory(updatedHistory);
  } catch (err) {
    alert(err.message);
  }
};


  const joinRoomOnce = (departmentId) => {
  if (!departmentId || joinedRoomRef.current) return;

  const id =
    typeof departmentId === "object"
      ? departmentId._id || departmentId.toString()
      : departmentId;

  socket.emit("join_department", id);
  joinedRoomRef.current = true;
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
     ENABLE ALERTS
  ========================= */
  const enableAlerts = async () => {
    try {
      const subscription = await subscribeToPush();
      const token = localStorage.getItem("token");

      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      });

      localStorage.setItem("alertsEnabled", "true");
      setAlertsEnabled(true);
      alert("Notifications enabled successfully");
    } catch (err) {
      alert(err.message || "Failed to enable notifications");
    }
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
          <div className="mt-6 p-6 rounded-2xl bg-white/10 border">
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

  <button
  onClick={() => setShowEmergencyForm(true)}

  disabled={!joinDept || emergencyRequested || emergencyActive}
  className="mt-4 w-full max-w-md py-4 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-50"
>
  🚨 Request Emergency
</button>



  <select
    value={joinDept}
    onChange={(e) => setJoinDept(e.target.value)}
    disabled={!!ticketInfo || !queueOpen || emergencyActive}

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
    disabled={!joinDept || !!ticketInfo || !queueOpen || emergencyActive}

    className="mt-6 w-full max-w-md py-4 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-50"
  >
    {ticketInfo ? "Already in Queue" : "Join Queue"}
  </button>

  {ticketInfo && (
    <div className="mt-10 bg-white/10 rounded-3xl p-8 border border-white/10 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Your Ticket</h3>

      <p className="mb-2">
        Ticket Number: <b>{ticketInfo.ticketNumber}</b>
      </p>

      <p className="mb-4">
        Position in Queue: <b>{ticketInfo.position}</b>
      </p>

      <button
        onClick={handleCancelQueue}
        className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold"
      >
        Leave Queue
      </button>
    </div>
  )}
</section>


      {/* =========================
          TICKET HISTORY + FEEDBACK
      ========================= */}
      <section className="max-w-6xl mx-auto mt-24">
  <h3 className="text-xl font-semibold mb-6">
    Your Ticket History
  </h3>

  {ticketHistory.length === 0 ? (
    <p className="text-slate-400">🕘 No past tickets found.</p>
  ) : (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-left">
        <thead className="bg-white/5">
          <tr className="text-slate-300">
            <th className="px-6 py-4">Ticket</th>
            <th>Department</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Served</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {ticketHistory.map((t, i) => {

            console.log("Ticket row object:", t);
            const isExpired =
              t.servedAt &&
              Date.now() - new Date(t.servedAt).getTime() >
                24 * 60 * 60 * 1000;

            return (
              <tr
                key={i}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="px-6 py-4 font-semibold">
                  {t.ticketNumber}
                </td>

                <td>{t.department}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      t.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>

                <td>{new Date(t.joinedAt).toLocaleString()}</td>

                <td>
                  {t.servedAt
                    ? new Date(t.servedAt).toLocaleString()
                    : "--"}
                </td>

                <td>
                  {t.status !== "completed" ? (
                    "--"
                  ) : isExpired ? (
                    <span className="text-slate-400 text-sm">
                      Feedback time ended
                    </span>
                  ) : (
                  <button
  onClick={() => {
    console.log("Give Feedback clicked:", t._id);
    setFeedbackTicketId(t._id);
  }}
  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition"
>
  Give Feedback
</button>



                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</section>

{feedbackTicketId && (
  <FeedbackModal
    ticketId={feedbackTicketId}
    onClose={() => setFeedbackTicketId(null)}
    onSubmit={handleSubmitFeedback}
  />
)}

{/* 🔴 EMERGENCY REQUEST FORM 🔴 */}
{showEmergencyForm && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-white text-slate-900 rounded-2xl p-6 w-full max-w-md">
      <h3 className="text-xl font-bold mb-4">🚨 Emergency Request</h3>

      <label className="block mb-2 font-semibold">Reason *</label>
      <textarea
        value={emergencyReason}
        onChange={(e) => setEmergencyReason(e.target.value)}
        className="w-full mb-4 p-3 rounded-lg border"
        placeholder="Explain your emergency..."
      />

      <label className="block mb-2 font-semibold">Upload Proof *</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setEmergencyProof(e.target.files[0])}
        className="mb-6"
      />

      <div className="flex gap-4">
        <button
          onClick={() => setShowEmergencyForm(false)}
          className="flex-1 py-3 rounded-xl bg-gray-300 font-semibold"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmitEmergencyForm}
          className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold"
        >
          Send Request
        </button>
      </div>
    </div>
  </div>
)}

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
