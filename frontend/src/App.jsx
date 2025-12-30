import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";

import StudentDashboard from "./pages/student/StudentDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

import GuestJoin from "./pages/guest/GuestJoin";
import GuestTicket from "./pages/guest/GuestTicket";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import FloatingBlueBall from "./components/FloatingBlueBall";

/* ==============================
   Layout Wrapper
================================ */
function Layout({ children }) {
  const location = useLocation();

  // Pages where Navbar & Footer should NOT appear
  const hideLayoutRoutes = [
    "/login",
    "/signup",
    "/guest/join",
    "/guest/ticket",
  ];

  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <div className="relative min-h-screen bg-[#eef2f6] overflow-hidden">

      {/* ===== GLOBAL FLOATING BACKGROUND (ALL PAGES) ===== */}
      <FloatingBlueBall size={140} color="bg-blue-400/50" speed={1} />
      <FloatingBlueBall size={100} color="bg-indigo-400/45" speed={0.8} />
      <FloatingBlueBall size={180} color="bg-blue-300/40" speed={0.6} />

      {/* ===== LAYOUT UI ===== */}
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* =======================
            Public Routes
        ======================== */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/guest/join" element={<GuestJoin />} />
        <Route path="/guest/ticket" element={<GuestTicket />} />

        {/* =======================
            Protected Routes
        ======================== */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}
