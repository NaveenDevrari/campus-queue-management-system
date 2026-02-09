import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Rocket, ShieldCheck, QrCode } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  
  // Auth state check
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isLoggedIn = !!token;
  
  const isHomePage = location.pathname === "/";
  const isStaffPage = location.pathname.startsWith("/staff");
  const isAdminPage = location.pathname.startsWith("/admin");
  const isStaffRoute = role === "staff";

  // Helper handling
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleQRClick = () => {
    navigate("/staff/qr-scanner");
  };

  const handleDepartmentsOverviewClick = () => {
    navigate("/admin");
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: "Features", path: "/#features", icon: Rocket },
    { name: "About", path: "/about", icon: ShieldCheck },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-nav transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-3 font-bold text-[var(--text-primary)] transition-all hover:scale-105"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white flex items-center justify-center font-bold shadow-[0_0_15px_rgba(0,212,170,0.4)]">
              CQ
            </div>
            <span className="text-xl tracking-tight text-glow">Campus Queue</span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center gap-8">
            {isHomePage &&
              navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors hover:drop-shadow-[0_0_8px_rgba(0,212,170,0.5)]"
                  >
                    <Icon size={16} />
                    {item.name}
                  </Link>
                );
              })}

            {isLoggedIn && isStaffPage && isStaffRoute && (
              <button
                onClick={handleQRClick}
                className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
              >
                <QrCode size={18} />
                QR Code
              </button>
            )}


          </div>

          {/* RIGHT SIDE */}
          <div className="hidden lg:flex items-center gap-6">
            
            {/* Theme Toggle (Nebula Style) */}
            <button
              onClick={() => {
                const html = document.documentElement;
                if (html.classList.contains('dark')) {
                  html.classList.remove('dark');
                  localStorage.setItem('theme', 'light');
                } else {
                  html.classList.add('dark');
                  localStorage.setItem('theme', 'dark');
                }
              }}
              className="group p-2.5 rounded-full border border-[var(--glass-border)] bg-[rgba(255,255,255,0.05)] text-[var(--accent-primary)] hover:bg-[rgba(var(--accent-primary),0.1)] hover:border-[var(--accent-primary)] transition-all duration-300 active:scale-95"
              title="Toggle Theme"
            >
              <div className="relative w-5 h-5">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-5 h-5 absolute inset-0 transition-all duration-500 rotate-0 dark:rotate-180 scale-0 dark:scale-100 opacity-0 dark:opacity-100" // Sun (shows in dark)
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                </svg>
                
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-5 h-5 absolute inset-0 transition-transform duration-500 rotate-0 dark:-rotate-180 scale-100 dark:scale-0 opacity-100 dark:opacity-0" // Moon (shows in light)
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
            </button>

            <div className="h-8 w-px bg-[var(--glass-border)] mx-1"></div>

            {isLoggedIn ? (
              <>
                <span className="text-sm text-[var(--text-secondary)]">
                  Role: <b className="capitalize text-[var(--text-primary)]">{role}</b>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[rgba(255,100,100,0.1)] hover:border-red-500/50 hover:text-red-400 rounded-xl transition-all backdrop-blur-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  className="btn-nebula shadow-[0_0_20px_rgba(0,212,170,0.3)]"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-colors border border-transparent hover:border-[var(--glass-border)]"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {open && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-[var(--bg-primary)]/95 backdrop-blur-xl border-b border-[var(--glass-border)] p-6 flex flex-col gap-4 animate-fade-in shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
              >
                <div className="p-2 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                  <Icon size={20} />
                </div>
                <span className="font-medium text-lg">{item.name}</span>
              </Link>
            );
          })}

          <div className="h-px bg-[var(--glass-border)] my-2" />

          {isLoggedIn ? (
            <div className="flex flex-col gap-3">
               <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
                  <span className="text-[var(--text-secondary)]">Signed in as:</span>
                  <span className="font-bold text-[var(--text-primary)] capitalize">{role}</span>
               </div>
               
               {isStaffPage && isStaffRoute && (
                  <button onClick={() => { handleQRClick(); setOpen(false); }} className="btn-secondary w-full flex items-center justify-center gap-2">
                     <QrCode size={18} /> Show QR Code
                  </button>
               )}
               


               <button 
                 onClick={handleLogout}
                 className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold border border-red-500/20 hover:bg-red-500/20 transition-colors"
               >
                 Logout
               </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
               <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary text-center">
                  Log in
               </Link>
               <Link to="/signup" onClick={() => setOpen(false)} className="btn-nebula text-center">
                  Sign up
               </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
