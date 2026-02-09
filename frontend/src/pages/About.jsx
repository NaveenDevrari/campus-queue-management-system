import { motion } from "framer-motion";
import { Users, Clock, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen pt-24 px-6 pb-20">
      
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] mb-12 transition-colors">
           <ArrowLeft size={20} /> Back to Home
        </Link>

        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-[var(--text-primary)] mb-6 text-glow">
            About the <br /> <span className="text-[var(--accent-primary)]">System</span>
          </h1>
          <p className="text-xl text-(--text-secondary) leading-relaxed max-w-2xl">
            A modern digital queue management solution designed to reduce waiting time, avoid congestion, and streamline campus services through smart automation.
          </p>
        </motion.div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--glass-border)]"
           >
              <Users className="text-blue-500 mb-6" size={40} />
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Student Centric</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                 Students can join queues from anywhere on campus using their dashboard. They receive real-time updates and notifications when their turn is approaching, eliminating the need to stand in long physical lines.
              </p>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--glass-border)]"
           >
              <Clock className="text-emerald-500 mb-6" size={40} />
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Staff Efficiency</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                 Staff members have a dedicated dashboard to view the queue, call the next person, and mark tickets as completed or absent. This ensures a smooth flow and reduces administrative burden.
              </p>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.4 }}
              className="md:col-span-2 p-8 rounded-3xl bg-(--bg-secondary) border border-(--glass-border)"
           >
              <ShieldCheck className="text-violet-500 mb-6" size={40} />
              <h3 className="text-2xl font-bold text-(--text-primary) mb-4">Admin Control</h3>
              <p className="text-(--text-secondary) leading-relaxed">
                 Administrators have full oversight of the system. They can create and manage departments, monitor system health, and access analytics to improve campus services over time.
              </p>
           </motion.div>
        </div>

        {/* MISSION */}
        <div className="border-t border-(--glass-border) pt-16 text-center">
           <p className="text-(--text-secondary) italic text-lg">
             "Our mission is to respect your time and make campus life SIMPLER."
           </p>
        </div>

      </div>
    </div>
  );
}
