import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Info,
  LogIn,
  UserPlus,
  Layers,
  Zap,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

export default function Footer() {
  const location = useLocation();

  /* =========================
     ❌ SHOW FOOTER ONLY ON HOME
  ========================= */
  if (location.pathname !== "/") {
    return null; // 🔥 Footer hidden everywhere except Home
  }

  return (
    <footer className="relative overflow-hidden">

      {/* TOP GLOW LINE */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      {/* SOFT BACKGROUND GLOWS */}
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-40 w-[420px] h-[420px] bg-violet-600/20 rounded-full blur-3xl" />

      {/* BACKGROUND */}
      <div className="relative bg-[var(--bg-primary)] border-t border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-10">

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-14">

            {/* BRAND */}
            <div>
              <div className="flex items-center gap-4 mb-5 group">
                <div
                  className="
                    w-12 h-12 rounded-xl
                    bg-gradient-to-br from-blue-500 to-indigo-600
                    flex items-center justify-center
                    text-white font-bold text-lg
                    shadow-xl shadow-blue-500/30
                    transition-all duration-300
                    group-hover:scale-105
                  "
                >
                  CQ
                </div>

                <h3 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
                  Campus Queue
                </h3>
              </div>

              <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-sm">
                Campus Queue is a modern digital queue management system
                designed to eliminate physical waiting lines and bring
                transparency, efficiency, and speed to campus services.
              </p>

              <p className="text-[var(--text-secondary)] text-xs mt-4">
                Built for students, staff, and administrators.
              </p>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h4 className="text-[var(--text-primary)] font-semibold mb-5">
                Quick Links
              </h4>

              <ul className="space-y-3 text-sm">
                {[
                  { name: "Home", path: "/", icon: Home },
                  { name: "About", path: "/about", icon: Info },
                  { name: "Login", path: "/login", icon: LogIn },
                  { name: "Signup", path: "/signup", icon: UserPlus },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        className="
                          group inline-flex items-center gap-2
                          text-[var(--text-secondary)]
                          transition-all duration-300
                          hover:text-blue-400
                          hover:translate-x-1
                        "
                      >
                        <Icon
                          size={16}
                        />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* PLATFORM HIGHLIGHTS */}
            <div>
              <h4 className="text-[var(--text-primary)] font-semibold mb-5">
                Platform Highlights
              </h4>

              <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-3">
                  <Layers size={16} className="text-blue-400 mt-0.5" />
                  MERN stack architecture
                </li>

                <li className="flex items-start gap-3">
                  <Zap size={16} className="text-emerald-400 mt-0.5" />
                  Real-time queue updates with Socket.IO
                </li>

                <li className="flex items-start gap-3">
                  <ShieldCheck size={16} className="text-violet-400 mt-0.5" />
                  Role-based access for students, staff & admin
                </li>

                <li className="flex items-start gap-3">
                  <GraduationCap size={16} className="text-indigo-400 mt-0.5" />
                  Designed specifically for academic institutions
                </li>
              </ul>
            </div>

          </div>

          {/* BOTTOM BAR */}
          <div className="mt-16 pt-6 border-t border-[var(--glass-border)] text-center">
            <p className="text-xs text-[var(--text-secondary)] tracking-wide">
              © {new Date().getFullYear()} Campus Queue · All rights reserved
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
