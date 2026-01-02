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

  const departmentsOverviewRef = useRef(null);

  /* =========================
     FETCH DATA
  ========================= */
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

  /* =========================
     NAVBAR → SCROLL
  ========================= */
  useEffect(() => {
    const handleScrollToDepartments = () => {
      departmentsOverviewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    window.addEventListener(
      "scrollToDepartmentsOverview",
      handleScrollToDepartments
    );

    return () => {
      window.removeEventListener(
        "scrollToDepartmentsOverview",
        handleScrollToDepartments
      );
    };
  }, []);

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

      {/* MAIN GRID */}
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
              className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/10 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />

            <input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/10 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />

            <button
              onClick={handleCreateDepartment}
              disabled={loading}
              className="px-6 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-700 hover:to-fuchsia-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Department"}
            </button>
          </div>
        </div>

        {/* ASSIGN STAFF */}
        <div>
          {/* 🔥 EYE-CATCHING NOTE CARD */}
          <div className="mb-6 rounded-2xl border-l-4 border-amber-400
                          bg-gradient-to-r from-amber-500/20 to-orange-500/10
                          backdrop-blur px-5 py-4
                          shadow-lg shadow-amber-500/20">
            <p className="text-sm text-amber-200 leading-relaxed">
              ⚠️ <b>Important:</b> To change or update the staff assigned to a
              department, use this section. Assigning a new staff member will
              <b> replace the currently assigned one</b>.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-xl">
            <h3 className="text-lg font-semibold text-violet-300 mb-6">
              Assign Staff to Department
            </h3>

            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-5 py-4 mb-4 rounded-xl bg-white/10 border border-white/10 text-slate-100"
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
              className="w-full px-5 py-4 mb-6 rounded-xl bg-white/10 border border-white/10 text-slate-100"
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
              className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? "Assigning..." : "Assign Staff"}
            </button>
          </div>
        </div>
      </section>

      {/* DEPARTMENTS OVERVIEW */}
      <section ref={departmentsOverviewRef} className="max-w-6xl mx-auto mb-24">
        <h2 className="text-2xl font-semibold text-violet-300 mb-8">
          Departments Overview
        </h2>

        {/* SEARCH */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-3 px-4 py-3 w-full max-w-md rounded-xl bg-white/10 border border-white/10 backdrop-blur">
            <span className="text-slate-400 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>
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
                className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 shadow"
              >
                <h3 className="font-semibold text-slate-100">
                  {dept.name}
                </h3>

                <p className="text-sm text-slate-400 mb-3">
                  {dept.description || "No description"}
                </p>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                    Current Staff
                  </p>

                  {currentStaff ? (
                    <p className="text-sm text-slate-300">
                      {currentStaff.fullName} ({currentStaff.email})
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No staff assigned
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {message && (
        <div className="mt-12 flex justify-center">
          <div className="px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 shadow">
            {message}
          </div>
        </div>
      )}
    </div>
  );
}
