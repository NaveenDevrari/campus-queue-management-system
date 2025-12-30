import { useEffect, useState } from "react";
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

  /* ===========================
     FETCH DATA
  ============================ */
  useEffect(() => {
    fetchDepartments();
    fetchStaff();
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

  /* ===========================
     CREATE DEPARTMENT
  ============================ */
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

  /* ===========================
     ASSIGN STAFF
  ============================ */
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

  /* ===========================
     UI
  ============================ */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2f6] via-[#e6ecf5] to-[#dfe7f1] px-6 pt-10 pb-20">

      {/* HEADER */}
      <section className="max-w-6xl mx-auto mb-16">
        <h1 className="text-4xl font-bold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-slate-600 mt-2">
          System-level configuration and control
        </p>
      </section>

      {/* MAIN ADMIN GRID */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">

        {/* LEFT — CREATE DEPARTMENT (NORMAL FORM) */}
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Create Department
          </h2>

          <div className="space-y-5">
            <input
              placeholder="Department name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="
                w-full px-5 py-4 rounded-xl
                border border-slate-300 bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-600/30
                transition
              "
            />

            <input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="
                w-full px-5 py-4 rounded-xl
                border border-slate-300 bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-600/30
                transition
              "
            />

            <button
              onClick={handleCreateDepartment}
              disabled={loading}
              className="
                px-6 py-4 rounded-xl
                bg-blue-700 text-white font-semibold
                hover:bg-slate-800 transition
                disabled:opacity-50
              "
            >
              {loading ? "Creating..." : "Create Department"}
            </button>
          </div>
        </div>

        {/* RIGHT — ASSIGN STAFF (FEATURE CARD) */}
        <div className="
          relative overflow-hidden bg-[#f4f8ff]
          rounded-3xl p-8 border border-blue-400
          shadow-lg transition-all duration-300
          hover:-translate-y-1 hover:shadow-2xl
        ">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-100/50 via-transparent to-transparent animate-cardFlow pointer-events-none" />

          <div className="relative">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">
              Assign Staff to Department
            </h3>

            <div className="mb-6 rounded-xl bg-amber-50 border border-amber-300 px-4 py-3 text-sm text-amber-800">
              <strong>Note:</strong> One staff member can belong to only one
              department. Reassigning replaces the previous assignment.
            </div>

            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-5 py-4 mb-4 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">Select Staff</option>
              {staff.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.fullName} ({s.email})
                  {s.department ? ` — ${s.department.name}` : ""}
                </option>
              ))}
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-5 py-4 mb-6 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleAssignStaff}
              disabled={loading}
              className="
                w-full py-4 rounded-2xl
                bg-emerald-600 text-white font-semibold
                hover:bg-emerald-700 transition
                disabled:opacity-50
              "
            >
              {loading ? "Assigning..." : "Assign Staff"}
            </button>
          </div>
        </div>
      </section>

      {/* DEPARTMENTS OVERVIEW */}
      <section className="max-w-6xl mx-auto mb-20">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">
          Departments Overview
        </h2>

        {/* CENTERED SEARCH */}
        <div className="flex justify-center mb-10">
          <div className="
            flex items-center gap-3
            px-4 py-2.5 w-full max-w-md
            rounded-xl bg-white/80
            border border-blue-300
            shadow-sm
            focus-within:ring-2 focus-within:ring-blue-500/30
            transition
          ">
            <span className="text-blue-500 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredDepartments.length === 0 ? (
            <p className="text-slate-600 text-center">
              No matching departments found.
            </p>
          ) : (
            filteredDepartments.map((dept) => (
              <div
                key={dept._id}
                className="bg-white/90 rounded-2xl p-6 border border-slate-300 shadow transition hover:shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {dept.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {dept.description || "No description"}
                    </p>
                  </div>
                  <span className="text-sm text-slate-500">
                    {dept.staff.length} Staff
                  </span>
                </div>

                <div className="mt-4 text-sm text-slate-700">
                  {dept.staff.length > 0
                    ? dept.staff.map((s) => s.fullName).join(", ")
                    : "No staff assigned"}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {message && (
        <div className="mt-12 flex justify-center">
          <div className="px-6 py-3 rounded-xl bg-green-100 border border-green-400 text-green-800 shadow">
            {message}
          </div>
        </div>
      )}

      {/* ANIMATIONS */}
      <style>
        {`
          @keyframes cardFlow {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          .animate-cardFlow {
            animation: cardFlow 8s linear infinite;
          }

          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(12px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.6s ease-out both;
          }
        `}
      </style>
    </div>
  );
}
