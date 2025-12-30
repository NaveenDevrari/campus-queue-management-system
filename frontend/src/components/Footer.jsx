import { Link } from "react-router-dom";
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
  return (
    <footer className="relative overflow-hidden">

      {/* Soft top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

      {/* Background */}
      <div className="bg-gradient-to-b from-[#eef2f6] via-[#e6ecf5] to-[#dfe7f1]">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">

          {/* Main grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-14">

            {/* BRAND */}
            <div>
              <div className="flex items-center gap-4 mb-5 group">
                <div
                  className="
                    w-12 h-12 rounded-xl bg-blue-600
                    flex items-center justify-center
                    text-white font-bold text-lg
                    shadow-lg
                    transition-all duration-300
                    group-hover:bg-blue-700
                    group-hover:shadow-blue-500/30
                  "
                >
                  CQ
                </div>

                <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                  Campus Queue
                </h3>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
                Campus Queue is a modern digital queue management system
                designed to eliminate physical waiting lines and bring
                transparency, efficiency, and speed to campus services.
              </p>

              <p className="text-slate-500 text-xs mt-4">
                Built for students, staff, and administrators.
              </p>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h4 className="text-slate-900 font-semibold mb-5">
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
                          text-slate-600
                          transition-all duration-300
                          hover:text-blue-600
                          hover:translate-x-1
                        "
                      >
                        <Icon
                          size={16}
                          className="text-slate-400 group-hover:text-blue-600 transition-colors"
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
              <h4 className="text-slate-900 font-semibold mb-5">
                Platform Highlights
              </h4>

              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <Layers size={16} className="text-blue-600 mt-0.5" />
                  MERN stack architecture
                </li>

                <li className="flex items-start gap-3">
                  <Zap size={16} className="text-blue-600 mt-0.5" />
                  Real-time queue updates with Socket.IO
                </li>

                <li className="flex items-start gap-3">
                  <ShieldCheck size={16} className="text-blue-600 mt-0.5" />
                  Role-based access for students, staff & admin
                </li>

                <li className="flex items-start gap-3">
                  <GraduationCap size={16} className="text-blue-600 mt-0.5" />
                  Designed specifically for academic institutions
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-6 border-t border-slate-300/70 text-center">
            <p className="text-xs text-slate-500 tracking-wide">
              © {new Date().getFullYear()} Campus Queue · All rights reserved
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
