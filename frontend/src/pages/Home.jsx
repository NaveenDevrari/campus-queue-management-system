import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import FloatingBlueBall from "../components/FloatingBlueBall";

export default function Home() {
  const fullText = "Campus Queue Management System";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    if (index < fullText.length) {
      const t = setTimeout(() => {
        setDisplayText((p) => p + fullText[index]);
        setIndex(index + 1);
      }, 55);
      return () => clearTimeout(t);
    } else {
      setTimeout(() => setShowSubtitle(true), 300);
    }
  }, [index]);

  const roles = [
    {
      name: "Student",
      path: "/student",
      label: "S",
      desc:
        "Join department queues remotely and track your position in real time.",
      extra:
        "Avoid physical lines, get notified when it’s your turn, and save valuable time.",
      glow: "shadow-blue-500/30 ring-blue-500/30",
      badge: "bg-blue-600",
    },
    {
      name: "Staff",
      path: "/staff",
      label: "T",
      desc:
        "Manage student queues efficiently with live updates and controls.",
      extra:
        "Call the next student, open or close queues, and reduce congestion.",
      glow: "shadow-emerald-500/30 ring-emerald-500/30",
      badge: "bg-emerald-600",
    },
    {
      name: "Admin",
      path: "/admin",
      label: "A",
      desc:
        "Monitor and control the entire queue system across departments.",
      extra:
        "Configure departments, manage access, and oversee system performance.",
      glow: "shadow-violet-500/30 ring-violet-500/30",
      badge: "bg-violet-600",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-[#0a1330] text-slate-100">

      {/* FLOATING BACKGROUND */}
      <FloatingBlueBall size={140} color="bg-blue-500/20" speed={1} />
      <FloatingBlueBall size={100} color="bg-indigo-500/20" speed={0.8} />
      <FloatingBlueBall size={180} color="bg-violet-500/15" speed={0.6} />

      {/* HERO */}
      <section className="relative min-h-[70vh] px-6 pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1330] via-[#0f1f4d] to-[#141b3a]" />

        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-blue-700/25 rounded-full blur-3xl" />
        <div className="absolute top-32 -right-40 w-[420px] h-[420px] bg-violet-700/25 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-indigo-300">
            Hey, Welcome to
          </h2>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 min-h-[3.5rem]
            bg-gradient-to-r from-violet-500 via-fuchsia-400 to-indigo-400
            bg-clip-text text-transparent">
            {displayText}
          </h1>

          {showSubtitle && (
            <>
              <p className="text-lg text-slate-300 max-w-4xl mx-auto leading-relaxed">
                A modern digital queue system that removes physical waiting lines and
                simplifies how students, staff, and departments interact on campus.
              </p>
              <p className="mt-3 text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Join queues remotely, manage service flow efficiently, and deliver a
                faster, more transparent campus experience.
              </p>
            </>
          )}
        </div>
      </section>

      {/* ROLES */}
      <section className="px-6 pt-24 pb-0">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">
              Goodbye lines — hello efficiency
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Campus Queue adapts to different users while keeping the experience
              simple, fast, and reliable for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {roles.map((role, idx) => (
              <div
                key={role.name}
                className={`
                  group relative rounded-3xl p-10 pt-16
                  bg-gradient-to-b from-white/6 via-white/4 to-transparent
                  border border-white/15
                  backdrop-blur-xl
                  ring-1 ${role.glow}
                  shadow-xl ${role.glow}
                  transition-all duration-300
                  hover:animate-cardBlink
                  flex flex-col
                  ${idx === 1 ? "md:h-[450px]" : "h-[450px]"}
                `}
              >
                {/* PERMANENT SHIMMER */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/6 via-transparent to-white/6 opacity-100" />

                <div className="relative flex justify-center mb-6">
                  <div className={`w-16 h-16 rounded-2xl ${role.badge} flex items-center justify-center shadow-xl`}>
                    <span className="text-white text-3xl font-bold">
                      {role.label}
                    </span>
                  </div>
                </div>

                <div className="relative text-center">
                  <h3 className="text-xl font-semibold text-slate-100 mb-10">
                    {role.name}
                  </h3>
                  <p className="text-slate-300 text-sm mb-3">{role.desc}</p>
                  <p className="text-slate-400 text-xs">{role.extra}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOGIN */}
      <section className="pt-14 pb-12 text-center">
        <p className="text-slate-400">
          Already registered?{" "}
          <Link to="/login" className="text-violet-400 font-medium hover:underline">
            Login here
          </Link>
        </p>
      </section>

      {/* BLINK ANIMATION */}
      <style>
        {`
          @keyframes cardBlink {
            0% { box-shadow: 0 0 0 rgba(255,255,255,0); }
            50% { box-shadow: 0 0 25px rgba(255,255,255,0.25); }
            100% { box-shadow: 0 0 0 rgba(255,255,255,0); }
          }
          .hover\\:animate-cardBlink:hover {
            animation: cardBlink 0.6s ease-in-out;
          }
        `}
      </style>
    </div>
  );
}
