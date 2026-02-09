import { useEffect, useState, useRef } from "react";
import {
  getStaffProfile,
  callNextTicket,
  completeTicket,
  toggleQueue,
  increaseQueueLimit,
  getQueueStats,
  getPendingEmergencies,
} from "../../services/staff";
import api from "../../services/api";
import { socket } from "../../services/socket";
import DashboardSidebar from "../../components/DashboardSidebar";
import { Activity, Settings, QrCode } from "lucide-react";

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const [staff, setStaff] = useState(null);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [increaseBy, setIncreaseBy] = useState("");

  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const [completing, setCompleting] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyNote, setEmergencyNote] = useState("");
  const [emergencies, setEmergencies] = useState([]);
  const [pendingEmergencies, setPendingEmergencies] = useState(0);

  const [stats, setStats] = useState({ total: 0, served: 0, remaining: 0 });
  const joinedRef = useRef(false);

  useEffect(() => {
    fetchStaff();
    fetchStats();
    fetchEmergencyCount();
    fetchEmergencies();

    const onEmergencyRequested = (data) => {
      fetchEmergencyCount();
      fetchEmergencies();
      
      // Staff Notification
      if (Notification.permission === "granted") {
        new Notification("🚨 NEW EMERGENCY REQUEST", {
          body: `Reason: ${data?.reason || "No reason provided"}`,
        });
      }
    };

    socket.on("emergency_requested", onEmergencyRequested);
    return () => socket.off("emergency_requested", onEmergencyRequested);
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await getStaffProfile();
      setStaff(data);
      if (!joinedRef.current && data?.department?._id) {
        socket.emit("join_department", data.department._id);
        joinedRef.current = true;
      }
      
      // Request notifications for emergency alerts
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
    } catch (err) {
      setMessage("Failed to load staff");
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getQueueStats();
      setStats(data);
    } catch {}
  };

  const fetchEmergencyCount = async () => {
    try {
      const res = await api.get("/staff/emergency/count");
      setPendingEmergencies(res.data.count);
    } catch {}
  };

  const fetchEmergencies = async () => {
    try {
      const data = await getPendingEmergencies();
      setEmergencies(data);
    } catch {}
  };

  /* SOCKETS */
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

  /* ACTIONS */
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
      setMessage("Failed to toggle queue");
    }
  };

  const handleIncreaseLimit = async () => {
    if (!increaseBy || Number(increaseBy) <= 0) return;
    try {
      const data = await increaseQueueLimit(Number(increaseBy));
      setMessage(`Queue limit updated to ${data.maxTickets}`);
      setIncreaseBy("");
    } catch {
      setMessage("Failed to update limit");
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

  const handleStartEmergency = async (id = null) => {
    try {
      const payload = { note: "Emergency in progress" };
      if (id) payload.emergencyId = id; // Update backend to handle specific ID if desired, otherwise it still picks first approved
      await api.post("/staff/emergency/start", payload);
      fetchEmergencyCount();
      fetchEmergencies();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to start emergency");
    }
  };

  const handleEndEmergency = async () => {
    try {
      await api.post("/staff/emergency/end");
    } catch {
      setMessage("Failed to resolve emergency");
    }
  };

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

  const tabs = [
    { id: "overview", label: "Queue Visuals", icon: Activity },
    { id: "settings", label: "Queue Settings", icon: Settings },
    { id: "qr", label: "QR Generator", icon: QrCode },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <DashboardSidebar 
        title="Staff Panel" 
        tabs={tabs} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <main className="flex-1 md:ml-64 p-6 md:p-10 pt-20 md:pt-10 transition-all duration-300">
        
        {/* HEADER */}
        <header className="mb-10">
           <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              {activeTab === "overview" && "Live Operations"}
              {activeTab === "settings" && "Queue Control"}
              {activeTab === "qr" && "Access Code"}
           </h1>
           <p className="text-[var(--text-secondary)] mt-1">
              Department: <span className="font-semibold text-[var(--accent-primary)]">{staff?.department?.name || "Loading..."}</span>
           </p>
        </header>


        {/* TAB 1: OVERVIEW & OPERATIONS */}
        {activeTab === "overview" && (
           <div className="animate-fade-in space-y-12">
              
              {/* NOW SERVING CARD */}
              <div className="card text-center py-12 relative overflow-hidden">
                  <div className="relative z-10">
                     <p className="uppercase tracking-widest text-sm text-[var(--text-secondary)] mb-4">Now Serving</p>
                     <div className="text-[80px] md:text-[120px] font-black leading-none text-[var(--text-primary)] drop-shadow-2xl">
                        {currentTicket || <span className="text-slate-700 opacity-20">--</span>}
                     </div>
                     {emergencyActive && (
                        <p className="mt-4 text-red-500 font-bold animate-pulse">🚨 EMERGENCY MODE ACTIVE</p>
                     )}
                  </div>
                  {/* Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--accent-primary)] rounded-full blur-[100px] opacity-10" />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap justify-center gap-6">
                 <button
                    onClick={handleCallNext}
                    disabled={stats.remaining === 0 || emergencyActive}
                    className="btn-primary px-12 py-5 text-lg rounded-2xl w-full md:w-auto"
                 >
                    Call Next Ticket
                 </button>
                 <button
                    onClick={handleCompleteTicket}
                    disabled={!currentTicket || completing || emergencyActive}
                    className="btn-secondary px-12 py-5 text-lg rounded-2xl w-full md:w-auto"
                 >
                    {completing ? "Completing..." : "Complete Ticket"}
                 </button>
              </div>

               {/* STATS */}
               <div className="grid grid-cols-3 gap-4">
                  <div className="card text-center py-6">
                     <p className="text-xs uppercase text-[var(--text-secondary)]">Waiting</p>
                     <p className="text-3xl font-bold text-[var(--accent-primary)]">{stats.remaining}</p>
                  </div>
                  <div className="card text-center py-6">
                     <p className="text-xs uppercase text-[var(--text-secondary)]">Served</p>
                     <p className="text-3xl font-bold text-green-500">{stats.served}</p>
                  </div>
                  <div className="card text-center py-6">
                     <p className="text-xs uppercase text-[var(--text-secondary)]">Total</p>
                     <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.total}</p>
                  </div>
               </div>

                {/* EMERGENCY ALERT SECTION */}
                {pendingEmergencies > 0 && (
                   <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                      <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                        🚨 {pendingEmergencies} Emergency Request{pendingEmergencies > 1 ? "s" : ""}
                      </h3>
                      <div className="space-y-4">
                         {emergencies.map((e) => (
                           <div key={e._id} className="bg-white/5 p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4">
                              <div>
                                 <div className="flex items-center gap-2">
                                    <p className="font-bold text-red-200">{e.student?.name} ({e.student?.email})</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${e.status === 'approved' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}`}>
                                      {e.status}
                                    </span>
                                 </div>
                                 <p className="text-sm text-red-300 mt-1">Reason: {e.reason}</p>
                                 {e.proof && <a href={`${import.meta.env.VITE_API_URL.replace("/api", "")}${e.proof}`} target="_blank" className="text-xs underline text-red-400 mt-2 block">View Proof</a>}
                              </div>
                              <div className="flex gap-2 items-center">
                                {e.status === "pending" ? (
                                   <>
                                      <button onClick={() => handleApproveEmergency(e._id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">Approve</button>
                                      <button onClick={() => handleRejectEmergency(e._id)} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-bold hover:bg-slate-600 transition-colors">Reject</button>
                                   </>
                                ) : e.status === "approved" && !emergencyActive && (
                                   <button onClick={() => handleStartEmergency(e._id)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold animate-pulse shadow-lg shadow-red-600/20">
                                      Trigger Priority Service
                                    </button>
                                )}
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                )}
                
                {/* EMERGENCY CONTROLS */}
                <div className="flex justify-center pt-8 border-t border-[var(--glass-border)]">
                   {!emergencyActive ? (
                      <button onClick={handleStartEmergency} className="text-red-500 hover:bg-red-500/10 px-6 py-2 rounded-lg text-sm font-bold transition-colors">
                        ⚠ Trigger Emergency Mode
                      </button>
                   ) : (
                      <button onClick={handleEndEmergency} className="btn-secondary text-green-500 border-green-500/20 hover:bg-green-500/10">
                        Resolve Emergency
                      </button>
                   )}
                </div>

           </div>
        )}


        {/* TAB 2: SETTINGS */}
        {activeTab === "settings" && (
           <div className="animate-fade-in max-w-2xl mx-auto space-y-8">
              <div className="card p-8 flex items-center justify-between">
                 <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Queue Status</h3>
                    <p className={`text-sm mt-1 font-medium ${isQueueOpen ? "text-green-500" : "text-red-500"}`}>
                       {isQueueOpen ? "Open for students" : "Closed (Paused)"}
                    </p>
                 </div>
                 <button onClick={handleToggleQueue} className={`px-6 py-3 rounded-xl text-white font-bold transition-all ${isQueueOpen ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}>
                    {isQueueOpen ? "Stop Queue" : "Start Queue"}
                 </button>
              </div>

              <div className="card p-8">
                 <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Extend Queue Limit</h3>
                 <p className="text-sm text-[var(--text-secondary)] mb-6">Increase the maximum number of tickets allowed for today.</p>
                 <div className="flex gap-4">
                    <input 
                      type="number" 
                      placeholder="Amount to add" 
                      value={increaseBy} 
                      onChange={(e) => setIncreaseBy(e.target.value)}
                      className="input-field" 
                    />
                    <button onClick={handleIncreaseLimit} className="btn-primary">Add</button>
                 </div>
              </div>
           </div>
        )}


        {/* TAB 3: QR GENERATOR */}
        {activeTab === "qr" && (
           <div className="animate-fade-in max-w-md mx-auto text-center">
              <div className="card p-12">
                 <h3 className="text-xl font-bold text-[var(--text-primary)] mb-8">Department QR Code</h3>
                 
                 {qrData ? (
                   <div className="space-y-6">
                      <div className="bg-white p-4 rounded-2xl inline-block">
                         <img src={qrData.qrCode} alt="QR Code" className="w-64 h-64 object-contain" />
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] break-all font-mono bg-[var(--bg-secondary)] p-3 rounded-lg select-all">
                        {qrData.joinUrl}
                      </p>
                   </div>
                 ) : (
                    <div className="py-12">
                       <p className="text-[var(--text-secondary)] mb-6">Generate a QR code for students to join quickly.</p>
                       <button 
                         onClick={handleGenerateQR}
                         disabled={qrLoading} 
                         className="btn-primary w-full"
                        >
                         {qrLoading ? "Generating..." : "Generate QR Code"}
                       </button>
                    </div>
                 )}
              </div>
           </div>
        )}


        {/* TOAST MESSAGE */}
        {message && (
           <div className="fixed bottom-6 right-6 z-50 animate-fade-in bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl border border-white/10">
              {message}
           </div>
        )}

      </main>
    </div>
  );
}
