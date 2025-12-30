import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { logoutUser } from "../services/auth";
import {
  Home,
  Info,
  GraduationCap,
  Users,
  ShieldCheck,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

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

  const isActive = (path) =>
    location.pathname === path
      ? "text-slate-900 after:scale-x-100"
      : "text-slate-700 after:scale-x-0";

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "About", path: "/about", icon: Info },
    { name: "Student", path: "/student", icon: GraduationCap },
    { name: "Staff", path: "/staff", icon: Users },
    { name: "Admin", path: "/admin", icon: ShieldCheck },
  ];

  return (
    <nav className="sticky top-0 z-50">
      <div className="bg-gradient-to-b from-[#eef2f6] via-[#e6ecf5] to-[#dfe7f1]">
        <div className="max-w-7xl mx-auto px-4 py-4">

          {/* MAIN BAR */}
          <div className="bg-[#f7f9fc] rounded-2xl shadow-lg px-6 py-4 flex items-center justify-between">

            {/* LOGO */}
            <Link
              to="/"
              className="flex items-center gap-3 font-semibold text-slate-900"
            >
              <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-xl font-bold">
                CQ
              </div>
              <span className="hidden sm:block text-xl">Campus Queue</span>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex items-center gap-12">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group relative flex items-center gap-2 text-sm font-medium transition ${isActive(
                      item.path
                    )}`}
                  >
                    <Icon size={18} className="text-slate-500 group-hover:text-blue-600" />
                    {item.name}
                    <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition" />
                  </Link>
                );
              })}
            </div>

            {/* DESKTOP AUTH */}
            <div className="hidden lg:flex items-center gap-4">
              {!token ? (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-slate-900 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-slate-900 transition"
                  >
                    Signup
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-sm text-slate-600">
                    Role: <b className="capitalize">{role}</b>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-blue-700 text-white hover:bg-slate-900 transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-200 transition"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* MOBILE PANEL */}
          {open && (
            <div className="lg:hidden mt-4 bg-white rounded-2xl shadow-xl p-6 space-y-4 animate-in slide-in-from-top">

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-slate-800 font-medium"
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}

              <div className="pt-4 border-t space-y-3">
                {!token ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="block text-center py-2 rounded-xl bg-blue-600 text-white"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setOpen(false)}
                      className="block text-center py-2 rounded-xl bg-blue-500 text-white"
                    >
                      Signup
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 rounded-xl bg-blue-700 text-white"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
