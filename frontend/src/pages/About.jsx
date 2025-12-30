export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2f6] via-[#e6ecf5] to-[#dfe7f1] px-6 py-20">

      {/* PAGE TITLE */}
      <section className="max-w-6xl mx-auto text-center mb-20">
        <h1 className="text-4xl font-bold text-slate-900">
          About Campus Queue Management System
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
          A modern digital queue management solution designed to reduce waiting
          time, avoid congestion, and streamline campus services.
        </p>
      </section>

      {/* ROLE CARDS — TOP / BOTTOM / TOP */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-28">

        {/* STUDENT */}
        <div className="relative overflow-hidden bg-[#f4f8ff] rounded-[32px] p-10 border border-blue-400 shadow-lg flex flex-col items-center text-center">
          {/* gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-100/60 via-transparent to-transparent" />

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-8">
              S
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Student
            </h3>
            <p className="text-slate-700 mb-4">
              Students interact with the system to join departmental queues
              digitally instead of standing in physical lines.
            </p>
            <p className="text-sm text-slate-600">
              They can monitor their ticket number, view real-time queue progress,
              and arrive at the counter only when their turn approaches.
            </p>
          </div>
        </div>

        {/* STAFF — PUSHED DOWN */}
        <div className="relative overflow-hidden bg-[#f4f8ff] rounded-[32px] p-10 border border-blue-400 shadow-lg flex flex-col items-center text-center md:translate-y-16">
          {/* gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-100/60 via-transparent to-transparent" />

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-8">
              T
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Staff
            </h3>
            <p className="text-slate-700 mb-4">
              Staff members use the system to manage queues in an organized and
              efficient manner.
            </p>
            <p className="text-sm text-slate-600">
              They control ticket flow, serve students one by one, manage queue
              limits, and maintain smooth service operations.
            </p>
          </div>
        </div>

        {/* ADMIN */}
        <div className="relative overflow-hidden bg-[#f4f8ff] rounded-[32px] p-10 border border-blue-400 shadow-lg flex flex-col items-center text-center">
          {/* gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-100/60 via-transparent to-transparent" />

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-8">
              A
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Admin
            </h3>
            <p className="text-slate-700 mb-4">
              Administrators oversee the queue system across all departments and
              users.
            </p>
            <p className="text-sm text-slate-600">
              They configure departments, manage access control, define limits,
              and ensure the system runs smoothly at a campus-wide level.
            </p>
          </div>
        </div>

      </section>

      {/* ABOUT SYSTEM — TEXT ONLY */}
      <section className="max-w-5xl mx-auto space-y-8 text-slate-700 leading-relaxed">

        <p>
          The Campus Queue Management System replaces traditional physical queues
          with a centralized digital platform. Instead of waiting in crowded
          areas, users can track queue progress remotely and approach service
          counters only when necessary.
        </p>

        <p>
          The system is designed with clear role separation to ensure smooth
          coordination. Students focus on tracking their service requests, staff
          concentrate on efficient service delivery, and administrators maintain
          overall system stability and control.
        </p>

        <p>
          Real-time updates form the core of the platform. Any change in queue
          status—such as ticket calls, completions, or closures—is instantly
          reflected for all connected users, ensuring transparency and clarity.
        </p>

        <p>
          By digitizing queue management, the system improves operational
          efficiency, reduces unnecessary waiting, and creates a calmer and more
          organized campus environment for everyone involved.
        </p>

      </section>
    </div>
  );
}
