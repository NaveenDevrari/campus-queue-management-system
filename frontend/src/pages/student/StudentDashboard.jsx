import { useEffect, useRef, useState } from "react";
import { Bell, Megaphone, Users, Clock, AlertTriangle, CheckCircle, Info, History, LayoutDashboard, PlusCircle } from "lucide-react";
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
import DashboardSidebar from "../../components/DashboardSidebar";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

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
  const [ticketHistory, setTicketHistory] = useState([]);

  const [feedbackTicketId, setFeedbackTicketId] = useState(null);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyRequested, setEmergencyRequested] = useState(false);
  
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState("");
  const [emergencyProof, setEmergencyProof] = useState(null);

  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    return localStorage.getItem("alertsEnabled") === "true";
  });

  const [isYourTurn, setIsYourTurn] = useState(false);

  const joinedRoomRef = useRef(false);

  /* SOCKET & DATA LOADING logic (Identical to original) */
  useEffect(() => {
    if (!socket.connected) socket.connect();
    const onEmergencyStarted = (data) => {
      setEmergencyActive(true);
      setNowServing("EMERGENCY");
      setMessage(data?.note || "🚨 Emergency in progress. Please wait.");
    };
    const onEmergencyEnded = () => {
      setEmergencyActive(false);
      setEmergencyRequested(false);
      setNowServing("--");
      setMessage("Emergency resolved. Queue resumed.");
    };
    const onTicketCalled = (data) => {
      setNowServing(data.ticketNumber);
      if (ticketInfo && data.ticketNumber === ticketInfo.ticketNumber) {
        setIsYourTurn(true);
        if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]);
        
        // Browser Notification
        if (Notification.permission === "granted") {
          new Notification("It's Your Turn!", {
            body: `Ticket ${data.ticketNumber} is being served now. Please proceed.`,
            icon: "/favicon.ico"
          });
        }
      }
    };
    const onTicketCompleted = (data) => {
      if (ticketInfo && data.ticketNumber === ticketInfo.ticketNumber) {
        resetState("Your ticket has been completed. You may join again.");
      }
    };
    const onTicketCancelled = () => resetState("You have left the queue.");
    const onQueueStatusChanged = (data) => setQueueOpen(data.isOpen);
    const onQueueLimitUpdated = (data) => setQueueLimit(data.maxTickets);
    const onEmergencyYourTurn = () => {
      setEmergencyActive(true);
      setNowServing("EMERGENCY");
      setMessage("🚨 It’s your turn. Please proceed immediately.");
      if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
    };
    const onEmergencyServed = () => {
      setEmergencyActive(false);
      setEmergencyRequested(false);
      setNowServing("--");
      setMessage("✅ You have been served. Thank you.");
      joinedRoomRef.current = false;
    };
    const onEmergencyApproved = () => {
      setMessage("✅ Your emergency request has been APPROVED. You will be called soon.");
    };
    const onEmergencyRejected = () => {
      setMessage("❌ Your emergency request was rejected. Please stay in the regular queue.");
      setEmergencyRequested(false);
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
    socket.on("emergency_approved", onEmergencyApproved);
    socket.on("emergency_rejected", onEmergencyRejected);

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
      socket.off("emergency_approved", onEmergencyApproved);
      socket.off("emergency_rejected", onEmergencyRejected);
    };
  }, [ticketInfo, alertsEnabled]);

  useEffect(() => {
    if (!joinDept) return;
    const checkEmergency = async () => {
      try {
        const res = await api.get("/student/emergency-status", { params: { departmentId: joinDept } });
        if (res.data?.active) {
          setEmergencyActive(true);
          setNowServing("EMERGENCY");
          setMessage("🚨 Emergency in progress. Please wait.");
        }
      } catch {}
    };
    checkEmergency();
  }, [joinDept]);

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload.id || payload._id) socket.emit("join_user", payload.id || payload._id);
        } catch {}
    }
    const fetchDeps = async () => {
       try { setDepartments(await getDepartments()); } catch {}
    };
    fetchDeps();
    
    const fetchHistory = async () => {
        try { setTicketHistory(await getMyTicketHistory()); } catch {}
    };
    fetchHistory();
  }, []);

  useEffect(() => {
      if (joinDept) joinRoomOnce(joinDept);
  }, [joinDept]);

  useEffect(() => {
    const fetchCrowd = async () => {
      if (!statusDept) { setCrowdStatus(null); return; }
      try { setCrowdStatus(await getCrowdStatus(statusDept)); } catch { setCrowdStatus(null); }
    };
    fetchCrowd();
  }, [statusDept]);

  const handleJoinQueue = async () => {
    try {
      const data = await joinQueue(joinDept);
      setTicketInfo(await getMyActiveTicket());
      setMyDepartmentId(joinDept);
      setMessage(data.message);
      joinRoomOnce(joinDept);
      setActiveTab("dashboard"); // Auto-switch to dashboard to see ticket
    } catch { setMessage("Failed to join queue"); }
  };

  const handleCancelQueue = async () => {
    try {
      const res = await cancelQueue(myDepartmentId);
      resetState(res.message);
    } catch { setMessage("Failed to leave queue"); }
  };

  const handleSubmitEmergencyForm = async () => {
    if (!emergencyReason || !emergencyProof) return setMessage("All fields required");
    try {
      const formData = new FormData();
      formData.append("departmentId", joinDept);
      formData.append("reason", emergencyReason);
      formData.append("proof", emergencyProof);
      await api.post("/student/emergency-request", formData);
      setEmergencyRequested(true);
      setShowEmergencyForm(false);
      setMessage("Request sent. Waiting for staff.");
    } catch (err) { setMessage("Failed to request emergency"); }
  };

  const handleSubmitFeedback = async (payload) => {
    try {
      await submitFeedback(payload);
      setFeedbackTicketId(null);
      setMessage("Thank you for your feedback.");
      setTicketHistory(await getMyTicketHistory());
    } catch (err) { alert(err.message); }
  };

  const joinRoomOnce = (departmentId) => {
    if (!departmentId || joinedRoomRef.current) return;
    const id = typeof departmentId === "object" ? departmentId._id || departmentId.toString() : departmentId;
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

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setAlertsEnabled(true);
        localStorage.setItem("alertsEnabled", "true");
      }
    } else {
      setAlertsEnabled(true);
      localStorage.setItem("alertsEnabled", "true");
    }
  };

  const enableAlerts = async () => {
    try {
       await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify(await subscribeToPush()),
       });
       localStorage.setItem("alertsEnabled", "true");
       setAlertsEnabled(true);
       alert("Notifications enabled");
    } catch { alert("Failed to enable notifications"); }
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "join", label: "Join Queue", icon: PlusCircle },
    { id: "history", label: "My History", icon: History },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
       <DashboardSidebar title="Student Panel" tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
       
       <main className="flex-1 md:ml-64 p-6 md:p-10 pt-20 md:pt-10 transition-all duration-300">
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
               <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                  {activeTab === "dashboard" && "My Dashboard"}
                  {activeTab === "join" && "Join a Queue"}
                  {activeTab === "history" && "Ticket History"}
               </h1>
            </div>
            {!alertsEnabled && (
                <button onClick={requestNotificationPermission} className="btn-secondary text-sm flex items-center gap-2">
                   <Bell size={16} /> Enable Notifications
                </button>
            )}
          </header>

          {activeTab === "dashboard" && (
             <div className="animate-fade-in space-y-10">
                {/* ACTIVE TICKET HERO */}
                {ticketInfo ? (
                   <div className="bg-[var(--accent-primary)] text-white p-8 md:p-12 rounded-3xl w-full shadow-2xl relative overflow-hidden text-center">
                      {isYourTurn && (
                         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-in fade-in zoom-in duration-300">
                            <div className="bg-white text-[var(--accent-primary)] p-10 rounded-[3rem] shadow-2xl flex flex-col items-center max-w-lg mx-4 text-center border-8 border-[var(--accent-primary)]/50">
                               <div className="mb-6 animate-bounce">
                                  <Megaphone size={64} />
                               </div>
                               <h4 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">It's Your Turn!</h4>
                               <p className="text-xl md:text-2xl font-bold mb-8 text-slate-600">Please proceed to the counter immediately.</p>
                               <div className="text-6xl font-black mb-8 bg-slate-100 px-8 py-4 rounded-2xl">{ticketInfo.ticketNumber}</div>
                               <button 
                                 onClick={() => setIsYourTurn(false)}
                                 className="btn-primary py-4 px-12 text-xl shadow-xl hover:scale-105 transition-transform"
                               >
                                 I'm On My Way
                               </button>
                            </div>
                         </div>
                      )}
                      <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-4">Current Active Ticket</p>
                      <h3 className="text-7xl md:text-9xl font-black mb-6 tracking-tighter">{ticketInfo.ticketNumber}</h3>
                      <div className="inline-block bg-white/20 backdrop-blur-md px-6 py-2 rounded-full mb-8">
                         <p className="font-bold text-lg">Position: {ticketInfo.position}</p>
                      </div>
                      <button onClick={handleCancelQueue} className="bg-white text-[var(--accent-primary)] px-8 py-3 rounded-xl font-bold hover:bg-white/90 shadow-lg">
                        Leave Queue
                      </button>
                   </div>
                ) : (
                   <div className="border border-dashed border-[var(--glass-border)] rounded-3xl p-12 w-full text-center">
                      <p className="text-[var(--text-secondary)] text-lg mb-4">You are not currently in any queue.</p>
                      <button onClick={() => setActiveTab("join")} className="btn-primary">
                         Join a Queue Now
                      </button>
                   </div>
                )}

                {/* STATUS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {/* NOW SERVING */}
                   <div className="card text-center py-8">
                       <p className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-2">Now Serving</p>
                       <h2 className="text-5xl font-black text-[var(--text-primary)]">{nowServing}</h2>
                   </div>

                   {/* CROWD CHECK */}
                   <div className="card">
                      <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-[var(--text-primary)]">Crowd Check</h3>
                         <Users size={16} className="text-[var(--text-secondary)]" />
                      </div>
                      <select className="input-field text-sm py-2 mb-4" value={statusDept} onChange={(e) => setStatusDept(e.target.value)}>
                         <option value="">Select Department...</option>
                         {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                      </select>
                      {crowdStatus && (
                         <div className="text-sm">
                            <div className="flex justify-between mb-1"><span className="text-[var(--text-secondary)]">Load:</span> <span className="font-bold">{crowdStatus.crowdLevel}</span></div>
                            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Est. Wait:</span> <span className="font-bold text-[var(--accent-primary)]">{crowdStatus.estimatedWaitTime} min</span></div>
                         </div>
                      )}
                   </div>

                   {/* EMERGENCY */}
                   <div className="card text-center py-8 flex flex-col justify-center items-center">
                       <AlertTriangle className="text-red-500 mb-2" size={24} />
                       <button 
                         onClick={() => {
                            if (!joinDept && !myDepartmentId) {
                               setMessage("Please select a department or join a queue first.");
                               setActiveTab("join");
                               return;
                            }
                            setShowEmergencyForm(true);
                         }}
                         disabled={emergencyRequested || emergencyActive}
                         className={`font-bold hover:underline transition-colors ${
                            !joinDept && !myDepartmentId ? "text-yellow-500" : "text-red-500"
                         }`}
                         title={!joinDept && !myDepartmentId ? "Select a department first" : "Request immediate assistance"}
                       >
                         Request Emergency Priority
                       </button>
                   </div>
                </div>
             </div>
          )}

          {activeTab === "join" && (
             <div className="animate-fade-in card">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Select Department</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {departments.map((dept) => (
                      <button
                        key={dept._id}
                        onClick={() => setJoinDept(dept._id)}
                        className={`p-6 rounded-2xl border text-left transition-all duration-300 ${
                           joinDept === dept._id 
                           ? "border-[var(--accent-primary)] bg-[rgba(var(--accent-primary),0.05)] shadow-lg" 
                           : "border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)]"
                        }`}
                      >
                         <h4 className="font-bold text-[var(--text-primary)] text-lg mb-2">{dept.name}</h4>
                         <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{dept.description || "No description"}</p>
                      </button>
                   ))}
                </div>

                <div className="mt-8 flex justify-end">
                   <button 
                     onClick={handleJoinQueue} 
                     disabled={!joinDept || !!ticketInfo || !queueOpen} 
                     className="btn-primary"
                   >
                     {ticketInfo ? "Already in Queue" : "Confirm & Join Queue"}
                   </button>
                </div>
             </div>
          )}

          {activeTab === "history" && (
             <div className="animate-fade-in card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-[var(--bg-secondary)] border-b border-[var(--glass-border)] text-[var(--text-secondary)]">
                         <tr>
                            <th className="px-6 py-4">Ticket</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--glass-border)]">
                         {ticketHistory.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-[var(--text-secondary)]">No history.</td></tr> : 
                           ticketHistory.map(t => (
                              <tr key={t._id}>
                                 <td className="px-6 py-4 font-bold text-[var(--text-primary)]">{t.ticketNumber}</td>
                                 <td className="px-6 py-4">{t.department}</td>
                                 <td className="px-6 py-4">
                                   <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${t.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                      {t.status}
                                   </span>
                                 </td>
                                 <td className="px-6 py-4">{new Date(t.joinedAt).toLocaleDateString()}</td>
                                 <td className="px-6 py-4">
                                    {t.status === "completed" && (
                                       <button onClick={() => setFeedbackTicketId(t._id)} className="text-[var(--accent-primary)] font-bold text-xs hover:underline">
                                          Review
                                       </button>
                                    )}
                                 </td>
                              </tr>
                           ))
                         }
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* MODALS */}
          {feedbackTicketId && <FeedbackModal ticketId={feedbackTicketId} onClose={() => setFeedbackTicketId(null)} onSubmit={handleSubmitFeedback} />}
          
          {showEmergencyForm && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                   <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Request Priority</h3>
                   <textarea 
                     className="input-field mb-4 bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-primary)]" 
                     placeholder="Reason for emergency..." 
                     value={emergencyReason} 
                     onChange={e => setEmergencyReason(e.target.value)} 
                   />
                   <div className="mb-6 relative">
                      <input 
                        type="file" 
                        onChange={e => setEmergencyProof(e.target.files[0])} 
                        className="block w-full text-sm text-[var(--text-secondary)]
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-[var(--accent-primary)] file:text-white
                          hover:file:bg-[var(--accent-primary)]/80" 
                      />
                   </div>
                   <div className="flex gap-4">
                      <button onClick={() => setShowEmergencyForm(false)} className="flex-1 py-3 text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)] transition-colors">Cancel</button>
                      <button onClick={handleSubmitEmergencyForm} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-600/20">Submit Request</button>
                   </div>
                </div>
             </div>
          )}

          {message && (
             <div className="fixed bottom-6 right-6 z-50 bg-slate-900 arrow-fade-in text-white px-6 py-3 rounded-xl shadow-lg">
                {message}
             </div>
          )}

       </main>
    </div>
  );
}
