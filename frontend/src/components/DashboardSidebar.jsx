import { motion } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardSidebar({ title, tabs, activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <>
      {/* MOBILE TRIGGER */}
      <div className="md:hidden fixed top-0 left-0 w-full z-50 bg-[var(--bg-secondary)] border-b border-[var(--glass-border)] p-4 flex justify-between items-center">
        <h1 className="font-bold text-[var(--accent-primary)]">{title}</h1>
        <button onClick={() => setIsOpen(true)} className="p-2 text-[var(--text-primary)]">
          <Menu size={24} />
        </button>
      </div>

      {/* SIDEBAR */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-secondary)] border-r border-[var(--glass-border)] backdrop-blur-xl transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-10">
             <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{title}</h2>
             <button onClick={() => setIsOpen(false)} className="md:hidden text-[var(--text-secondary)]">
               <X size={24} />
             </button>
          </div>

          {/* NAV ITEMS */}
          <nav className="flex-1 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  activeTab === tab.id
                    ? "bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20"
                    : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors mt-auto font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* OVERLAY FOR MOBILE */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
