import { useEffect, useState, useRef } from "react";
import {
  createDepartment,
  getDepartments,
  getStaffUsers,
  assignStaffToDepartment,
} from "../../services/admin";
import { LayoutDashboard, Users, MessageSquare, Settings, Plus, UserPlus } from "lucide-react";
import DashboardSidebar from "../../components/DashboardSidebar";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);

  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState([]);

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    fetchDepartments();
    fetchStaff();
    fetchFeedback();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch {
      setMessage("Failed to load departments");
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await getStaffUsers();
      setStaff(data);
    } catch {
      setMessage("Failed to load staff");
    }
  };

  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/feedback", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setFeedback(data);
    } catch (err) {
      console.error("Feedback fetch failed", err);
    }
  };

  /* =========================
     ACTIONS
  ========================= */
  const handleCreateDepartment = async () => {
    if (!name.trim()) return setMessage("Department name is required");
    try {
      setLoading(true);
      const data = await createDepartment({ name, description });
      setMessage(data.message);
      setName("");
      setDescription("");
      fetchDepartments();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error creating department");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedStaff || !selectedDepartment) return setMessage("Select both staff and department");
    try {
      setLoading(true);
      const data = await assignStaffToDepartment({
        staffId: selectedStaff,
        departmentId: selectedDepartment,
      });
      setMessage(data.message);
      setSelectedStaff("");
      setSelectedDepartment("");
      fetchDepartments();
      fetchStaff();
    } catch (err) {
      setMessage(err.response?.data?.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "staff", label: "Manage Staff", icon: Users },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
       <DashboardSidebar title="Admin Panel" tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
       
       <main className="flex-1 md:ml-64 p-6 md:p-10 pt-20 md:pt-10 transition-all duration-300">
         
         {/* MESSAGE TOAST */}
         {message && (
            <div className="fixed bottom-6 right-6 z-50 animate-fade-in bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3">
               <span className="text-green-400">✓</span>
               <p>{message}</p>
               <button onClick={() => setMessage("")} className="ml-2 text-xs opacity-50 hover:opacity-100">✕</button>
            </div>
         )}


         {/* =======================
             TAB: OVERVIEW (DEPARTMENTS)
         ======================== */}
         {activeTab === "overview" && (
           <div className="animate-fade-in">
              <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Departments</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Manage departmental queues and settings.</p>
                 </div>
                 <input
                    type="text"
                    placeholder="Search departments..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field max-w-xs"
                 />
              </header>

              {/* Create Dept Section */}
              <div className="mb-12 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl p-6 md:p-8">
                 <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                   <Plus size={20} className="text-[var(--accent-primary)]"/> Create New Department
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      placeholder="Department Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                    />
                    <input
                      placeholder="Description (Optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-field"
                    />
                    <button
                      onClick={handleCreateDepartment}
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? "Creating..." : "Create"}
                    </button>
                 </div>
              </div>

              {/* List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredDepartments.map((dept) => (
                    <div key={dept._id} className="card hover:border-[var(--accent-primary)] transition-colors">
                       <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-lg text-[var(--text-primary)]">{dept.name}</h3>
                          <span className="text-xs font-mono px-2 py-1 rounded bg-[rgba(var(--accent-primary),0.1)] text-[var(--accent-primary)]">
                             {dept.staff?.length || 0} Staff
                          </span>
                       </div>
                       <p className="text-sm text-[var(--text-secondary)] mb-4 min-h-[40px]">
                          {dept.description || "No description."}
                       </p>
                       <div className="text-xs text-[var(--text-secondary)] border-t border-[var(--glass-border)] pt-3">
                          ID: <span className="font-mono opacity-50">{dept._id}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
         )}


         {/* =======================
             TAB: STAFF MANAGEMENT
         ======================== */}
         {activeTab === "staff" && (
           <div className="animate-fade-in">
              <header className="mb-10">
                 <h1 className="text-3xl font-bold text-[var(--text-primary)]">Staff Assignment</h1>
                 <p className="text-[var(--text-secondary)] mt-1">Assign staff members to departments.</p>
              </header>

              <div className="max-w-2xl mx-auto card p-8 mb-10">
                 <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                   <UserPlus size={20} className="text-[var(--accent-secondary)]"/> Assign Staff
                 </h3>
                 <div className="space-y-6">
                    <div>
                       <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Select Staff</label>
                       <select
                          value={selectedStaff}
                          onChange={(e) => setSelectedStaff(e.target.value)}
                          className="input-field"
                       >
                          <option value="">Choose a user...</option>
                          {staff.map((s) => (
                             <option key={s._id} value={s._id}>{s.fullName} ({s.email})</option>
                          ))}
                       </select>
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Select Department</label>
                       <select
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                          className="input-field"
                       >
                          <option value="">Choose a department...</option>
                          {departments.map((d) => (
                             <option key={d._id} value={d._id}>{d.name}</option>
                          ))}
                       </select>
                    </div>

                    <button disabled={loading} onClick={handleAssignStaff} className="btn-primary w-full">
                       {loading ? "Assigning..." : "Assign to Department"}
                    </button>
                 </div>
              </div>
           </div>
         )}


         {/* =======================
             TAB: FEEDBACK
         ======================== */}
         {activeTab === "feedback" && (
            <div className="animate-fade-in">
               <header className="mb-10">
                  <h1 className="text-3xl font-bold text-[var(--text-primary)]">Student Feedback</h1>
                  <p className="text-[var(--text-secondary)] mt-1">Review ratings and comments from students.</p>
               </header>

               <div className="card overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-medium border-b border-[var(--glass-border)]">
                        <tr>
                          <th className="px-6 py-4">Ticket</th>
                          <th className="px-6 py-4">Department</th>
                          <th className="px-6 py-4">Rating Tags</th>
                          <th className="px-6 py-4">Comment</th>
                          <th className="px-6 py-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--glass-border)]">
                        {feedback.length === 0 ? (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-[var(--text-secondary)]">No feedback found.</td></tr>
                        ) : feedback.map((f) => (
                          <tr key={f._id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-bold text-[var(--text-primary)]">{f.ticketNumber}</td>
                            <td className="px-6 py-4">{f.department}</td>
                            <td className="px-6 py-4">
                               <div className="flex flex-wrap gap-1">
                                 {f.options?.map((o,i) => (
                                    <span key={i} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-500/10 text-blue-500">{o}</span>
                                 ))}
                               </div>
                            </td>
                            <td className="px-6 py-4 max-w-xs truncate" title={f.comment}>{f.comment || "--"}</td>
                            <td className="px-6 py-4 opacity-70">{new Date(f.submittedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
         )}

       </main>
    </div>
  );
}
