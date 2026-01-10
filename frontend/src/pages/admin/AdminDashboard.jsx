import { useEffect, useState, useRef } from "react";
import {
  createDepartment,
  getDepartments,
  getStaffUsers,
  assignStaffToDepartment,
} from "../../services/admin";

export default function AdminDashboard() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);

  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  // 🆕 STUDENT FEEDBACK
  const [feedback, setFeedback] = useState([]);

  const departmentsOverviewRef = useRef(null);

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load feedback");
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
    if (!selectedStaff || !selectedDepartment) {
      return setMessage("Select both staff and department");
    }

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

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1330] via-[#0f1f4d] to-[#141b3a] px-6 pt-12 pb-24 text-slate-100">

      {/* HEADER */}
      <section className="max-w-6xl mx-auto mb-20">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-slate-300 mt-4">
          System-level configuration and control
        </p>
      </section>

      {/* CREATE + ASSIGN */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 mb-28">

        {/* CREATE DEPARTMENT */}
        <div>
          <h2 className="text-2xl font-semibold text-violet-300 mb-6">
            Create Department
          </h2>

          <div className="space-y-5">
            <input
              placeholder="Department name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/10"
            />

            <input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/10"
            />

            <button
              onClick={handleCreateDepartment}
              disabled={loading}
              className="px-6 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Department"}
            </button>
          </div>
        </div>

        {/* ASSIGN STAFF */}
        <div>
          <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
            <h3 className="text-lg font-semibold text-violet-300 mb-6">
              Assign Staff to Department
            </h3>

            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-5 py-4 mb-4 rounded-xl bg-white/10"
            >
              <option value="">Select Staff</option>
              {staff.map((s) => (
                <option key={s._id} value={s._id} className="text-black">
                  {s.fullName} ({s.email})
                </option>
              ))}
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-5 py-4 mb-6 rounded-xl bg-white/10"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id} className="text-black">
                  {d.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleAssignStaff}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-semibold disabled:opacity-50"
            >
              {loading ? "Assigning..." : "Assign Staff"}
            </button>
          </div>
        </div>
      </section>

      {/* DEPARTMENTS OVERVIEW */}
      <section
        ref={departmentsOverviewRef}
        className="max-w-6xl mx-auto mb-28"
      >
        <h2 className="text-2xl font-semibold text-violet-300 mb-8">
          Departments Overview
        </h2>

        <div className="flex justify-center mb-12">
          <input
            type="text"
            placeholder="Search department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-3 rounded-xl bg-white/10 border border-white/10"
          />
        </div>

        <div className="space-y-4">
          {filteredDepartments.map((dept) => {
            const currentStaff =
              dept.staff && dept.staff.length > 0
                ? dept.staff[dept.staff.length - 1]
                : null;

            return (
              <div
                key={dept._id}
                className="bg-white/5 rounded-2xl p-6 border border-white/10"
              >
                <h3 className="font-semibold">{dept.name}</h3>
                <p className="text-sm text-slate-400 mb-3">
                  {dept.description || "No description"}
                </p>

                <p className="text-xs text-slate-400 uppercase mb-1">
                  Current Staff
                </p>
                {currentStaff ? (
                  <p className="text-sm">
                    {currentStaff.fullName} ({currentStaff.email})
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">No staff assigned</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* STUDENT FEEDBACK */}
      <section className="max-w-6xl mx-auto mb-24">
        <h2 className="text-2xl font-semibold text-violet-300 mb-8">
          Student Feedback
        </h2>

        {feedback.length === 0 ? (
          <p className="text-slate-400">No feedback submitted yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr className="text-slate-300">
                  <th className="px-6 py-4">Ticket</th>
                  <th>Department</th>
                  <th>Options</th>
                  <th>Comment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((f) => (
                  <tr
                    key={f._id}
                    className="border-t border-white/10 hover:bg-white/5"
                  >
                    <td className="px-6 py-4 font-semibold">
                      {f.ticketNumber}
                    </td>
                    <td>{f.department}</td>
                    <td>
                      <ul className="list-disc pl-5 text-sm">
                        {f.options.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="text-sm text-slate-300">
                      {f.comment || "--"}
                    </td>
                    <td className="text-sm">
                      {new Date(f.submittedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {message && (
        <div className="mt-12 flex justify-center">
          <div className="px-6 py-3 rounded-xl bg-emerald-500/20 border text-emerald-200">
            {message}
          </div>
        </div>
      )}
    </div>
  );
}
