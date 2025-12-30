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
    },
    {
      name: "Staff",
      path: "/staff",
      label: "T",
      desc:
        "Manage student queues efficiently with live updates and controls.",
      extra:
        "Call the next student, open or close queues, and reduce congestion.",
    },
    {
      name: "Admin",
      path: "/admin",
      label: "A",
      desc:
        "Monitor and control the entire queue system across departments.",
      extra:
        "Configure departments, manage access, and oversee system performance.",
    },
  ];

  return (
    <div className="bg-[#eef2f6] relative overflow-hidden">

      {/* ===== FLOATING BLUE BALLS (BACKGROUND EFFECT) ===== */}
      <FloatingBlueBall size={140} color="bg-blue-400/50" speed={1} />
      <FloatingBlueBall size={100} color="bg-indigo-400/45" speed={0.8} />
      <FloatingBlueBall size={180} color="bg-blue-300/40" speed={0.6} />

      {/* ================= HERO ================= */}
      <section className="relative min-h-[70vh] px-6 pt-12 overflow-hidden bg-[#eef2f6]">

        {/* Light animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-indigo-100 animate-pulse" />

        {/* Soft background glows */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 -right-32 w-[400px] h-[400px] bg-indigo-200/40 rounded-full blur-3xl animate-pulse" />

        {/* Content */}
        <div className="relative max-w-6xl mx-auto text-center mt-6">

          {/* Welcome heading */}
          <h2
            className="
              text-2xl md:text-3xl font-extrabold mb-2
              bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700
              bg-clip-text text-transparent
            "
          >
            Hey, Welcome to
          </h2>

          {/* Main heading */}
          <h1
            className="
              text-4xl md:text-5xl font-extrabold mb-6
              bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700
              bg-clip-text text-transparent
              min-h-[3.5rem]
            "
          >
            {displayText}
          </h1>

          {showSubtitle && (
            <>
              <p className="text-lg text-slate-800 max-w-4xl mx-auto leading-relaxed">
                A modern digital queue system that removes physical waiting lines and
                simplifies how students, staff, and departments interact on campus.
              </p>

              <p className="mt-3 text-base text-slate-700 max-w-2xl mx-auto leading-relaxed">
                Join queues remotely, manage service flow efficiently, and deliver a
                faster, more transparent campus experience.
              </p>
            </>
          )}
        </div>
      </section>

      {/* ================= ROLES ================= */}
      <section className="px-6 pt-14 pb-0">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Goodbye lines — hello efficiency
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Campus Queue adapts to different users while keeping the experience
              simple, fast, and reliable for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {roles.map((role, idx) => (
              <Link
                key={role.name}
                to={role.path}
                className={`
                  group rounded-3xl p-10
                  bg-gradient-to-b from-blue-50 via-white to-blue-100
                  border border-blue-500/40
                  shadow-lg transition-all
                  hover:-translate-y-1 hover:shadow-2xl
                  flex flex-col justify-between
                  ${idx === 1 ? "md:mt-16 md:h-[470px]" : "h-[440px]"}
                `}
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {role.label}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {role.name}
                  </h3>
                  <p className="text-slate-700 text-sm mb-3">{role.desc}</p>
                  <p className="text-slate-500 text-xs">{role.extra}</p>
                </div>

                <p className="text-blue-700 font-medium text-sm text-center mt-6">
                  Click to access {role.name} dashboard →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LOGIN HINT ================= */}
      <section className="pt-10 pb-0 text-center">
        <p className="text-slate-600">
          Already registered?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Login here
          </Link>
        </p>
      </section>

    </div>
  );
}
