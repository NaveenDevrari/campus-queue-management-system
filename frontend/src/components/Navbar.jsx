import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { logoutUser } from "../services/auth";
import {
  Home,
  Info,
  GraduationCap,
  Users,
  ShieldCheck,
  Menu,
  X,
  QrCode,
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  /* =========================
     AUTH STATE (READ ONLY)
  ========================= */
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isLoggedIn = Boolean(token);

  /* =========================
     ❌ HIDE NAVBAR ROUTES
  ========================= */
  const shouldHideNavbar =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup") ||
    location.pathname.startsWith("/guest/join") ||
    location.pathname.startsWith("/guest/ticket");

  if (shouldHideNavbar) return null;

  /* =========================
     ROUTE HELPERS
  ========================= */
  const isHomePage = location.pathname === "/";
  const isStaffPage = role === "staff";
  const isAdminPage = role === "admin";
  const isStaffRoute = location.pathname === "/staff";

  const isActive = (path) =>
    location.pathname === path
      ? "text-fuchsia-300 after:scale-x-100"
      : "text-violet-300/70 after:scale-x-0";

  /* =========================
     ACTIONS
  ========================= */
  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQRClick = () => {
    window.dispatchEvent(new Event("scrollToQR"));
    setOpen(false);
  };

  const handleDepartmentsOverviewClick = () => {
    window.dispatchEvent(new Event("scrollToDepartmentsOverview"));
    setOpen(false);
  };

  /* =========================
     NAV ITEMS
  ========================= */
  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "About", path: "/about", icon: Info },
    { name: "Student", path: "/student", icon: GraduationCap },
    { name: "Staff", path: "/staff", icon: Users },
    { name: "Admin", path: "/admin", icon: ShieldCheck },
  ];

  return (
    <nav className="sticky top-0 z-50">
      <div className="bg-gradient-to-b from-[#050b1e] to-[#120c2e]">
        <div className="max-w-7xl mx-auto px-4 py-4">

          <div className="bg-[#120c2e] rounded-2xl shadow-xl shadow-black/50 border border-violet-900/40 px-6 py-4 flex items-center justify-between">

            {/* LOGO */}
            <Link
              to="/"
              className="flex items-center gap-3 font-semibold text-blue-100"
            >
              <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-xl font-bold shadow-lg">
                CQ
              </div>
              <span className="hidden sm:block text-xl">Campus Queue</span>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex items-center gap-10">
              {isHomePage &&
                navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`group relative flex items-center gap-2 text-sm font-medium transition ${isActive(
                        item.path
                      )}`}
                    >
                      <Icon
                        size={18}
                        className="text-violet-300/70 group-hover:text-fuchsia-300 transition"
                      />
                      {item.name}
                      <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-fuchsia-400 scale-x-0 group-hover:scale-x-100 transition" />
                    </Link>
                  );
                })}

              {isLoggedIn && isStaffPage && isStaffRoute && (
                <button
                  onClick={handleQRClick}
                  className="flex items-center gap-2 text-sm font-medium text-violet-300 hover:text-fuchsia-300 transition"
                >
                  <QrCode size={18} />
                  QR Code
                </button>
              )}

              {isLoggedIn && isAdminPage && !isHomePage && (
                <button
                  onClick={handleDepartmentsOverviewClick}
                  className="flex items-center gap-2 text-sm font-medium text-violet-300 hover:text-fuchsia-300 transition"
                >
                  <ShieldCheck size={18} />
                  Departments
                </button>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="hidden lg:flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <span className="text-sm text-violet-300/70">
                    Role:{" "}
                    <b className="capitalize text-violet-200">{role}</b>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl border border-violet-500/40
                               text-violet-200 hover:text-white
                               hover:bg-violet-900/40 transition"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>

            {/* MOBILE BUTTON */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-xl hover:bg-violet-900/40 transition"
            >
              {open ? (
                <X size={24} className="text-violet-200" />
              ) : (
                <Menu size={24} className="text-violet-200" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
