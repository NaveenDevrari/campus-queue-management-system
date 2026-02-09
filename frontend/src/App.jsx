import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";

import StudentDashboard from "./pages/student/StudentDashboard";
import ErrorBoundary from "./components/ErrorBoundary";
import StaffDashboard from "./pages/staff/StaffDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

import GuestJoin from "./pages/guest/GuestJoin";
import GuestTicket from "./pages/guest/GuestTicket";
import GuestEntry from "./pages/guest/GuestEntry";



import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import SmoothScroll from "./components/SmoothScroll";


/* ==============================
   Layout Wrapper
================================ */
function Layout({ children }) {
  const location = useLocation();

  /* =========================
     THEME (UNCHANGED)
  ========================= */
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  /* =========================
     ✅ HASH ROUTER SAFE CHECKS
  ========================= */
  /* =========================
     ✅ HASH ROUTER SAFE CHECKS
  ========================= */
  const hash = location.hash || "#/";

  const isGuestRoute =
    hash.startsWith("#/guest/join") ||
    hash.startsWith("#/guest/ticket");

  const isAuthRoute =
    hash.startsWith("#/login") ||
    hash.startsWith("#/signup");
    
  const isDashboardRoute = 
    hash.startsWith("#/student") || 
    hash.startsWith("#/staff") || 
    hash.startsWith("#/admin");

  const hideLayout = isGuestRoute || isAuthRoute || isDashboardRoute;

  // ✅ FIXED
  const showFooter = hash === "#/" || hash === "" || hash === "#";

  return (
    <div className="relative min-h-screen overflow-hidden transition-colors duration-300 text-[var(--text-primary)]">
      {/* ===== LAYOUT UI ===== */}
      <SmoothScroll />
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && showFooter && <Footer />}
    </div>
  );
}

/* ==============================
   App Routes
================================ */
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


        {/* =======================
            Guest Routes
        ======================== */}
        <Route path="/guest/join" element={<GuestJoin />} />
        <Route path="/guest/ticket" element={<GuestTicket />} />
        <Route path="/guest/entry/:qrId" element={<GuestEntry />} />
        <Route path="/guest/join/:sessionToken" element={<GuestJoin />} />



        {/* =======================
            Protected Routes
        ======================== */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ErrorBoundary>
                <StudentDashboard />
              </ErrorBoundary>
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
