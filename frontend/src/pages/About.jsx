export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b1e] via-[#0b1638] to-[#120c2e] px-6 py-24 text-slate-100">

      {/* PAGE TITLE */}
      <section className="max-w-6xl mx-auto text-center mb-24">
        <h1
          className="
            text-4xl md:text-5xl font-extrabold
            bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400
            bg-clip-text text-transparent
          "
        >
          About Campus Queue Management System
        </h1>
        <p className="mt-6 text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          A modern digital queue management solution designed to reduce waiting
          time, avoid congestion, and streamline campus services.
        </p>
      </section>

      {/* ROLE CARDS */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 mb-28">

        {/* STUDENT */}
        <div className="relative group rounded-3xl p-10 pt-24 bg-gradient-to-b from-white/5 via-white/3 to-transparent border border-white/10 backdrop-blur-xl shadow-xl shadow-blue-500/10 transition h-[440px] flex flex-col items-center text-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-500/10 via-transparent to-blue-500/10 opacity-100" />

          {/* LOGO */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              S
            </div>
          </div>

          {/* GAP ADDED HERE */}
          <h3 className="mt-6 text-xl font-semibold text-slate-100 mb-4">
            Student
          </h3>

          <p className="text-slate-300 mb-4">
            Students interact with the system to join departmental queues
            digitally instead of standing in physical lines.
          </p>
          <p className="text-sm text-slate-400">
            They monitor ticket numbers, view real-time progress, and arrive
            only when their turn approaches.
          </p>
        </div>

        {/* STAFF */}
        <div className="relative group rounded-3xl p-10 pt-24 bg-gradient-to-b from-white/5 via-white/3 to-transparent border border-white/10 backdrop-blur-xl shadow-xl shadow-emerald-500/10 transition h-[440px] flex flex-col items-center text-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-500/10 via-transparent to-emerald-500/10 opacity-100" />

          {/* LOGO */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              T
            </div>
          </div>

          {/* GAP ADDED HERE */}
          <h3 className="mt-6 text-xl font-semibold text-slate-100 mb-4">
            Staff
          </h3>

          <p className="text-slate-300 mb-4">
            Staff members manage queues in an organized and efficient manner.
          </p>
          <p className="text-sm text-slate-400">
            They control ticket flow, serve users one by one, and maintain
            smooth service operations.
          </p>
        </div>

        {/* ADMIN */}
        <div className="relative group rounded-3xl p-10 pt-24 bg-gradient-to-b from-white/5 via-white/3 to-transparent border border-white/10 backdrop-blur-xl shadow-xl shadow-violet-500/10 transition h-[440px] flex flex-col items-center text-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-violet-500/10 via-transparent to-violet-500/10 opacity-100" />

          {/* LOGO */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2">
            <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              A
            </div>
          </div>

          {/* GAP ADDED HERE */}
          <h3 className="mt-6 text-xl font-semibold text-slate-100 mb-4">
            Admin
          </h3>

          <p className="text-slate-300 mb-4">
            Administrators oversee the system across all departments and users.
          </p>
          <p className="text-sm text-slate-400">
            They configure departments, manage access, define limits, and ensure
            system-wide stability.
          </p>
        </div>

      </section>

      {/* ABOUT SYSTEM */}
      <section className="max-w-5xl mx-auto space-y-8 text-slate-300 leading-relaxed text-lg">
        <p>
          The Campus Queue Management System replaces traditional physical queues
          with a centralized digital platform.
        </p>
        <p>
          Clear role separation ensures smooth coordination between users.
        </p>
        <p>
          Real-time updates ensure transparency and trust.
        </p>
        <p>
          Digitization reduces congestion and improves efficiency campus-wide.
        </p>
      </section>
    </div>
  );
}
