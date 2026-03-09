import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="text-lg font-bold tracking-tight text-white">
          Audit<span className="text-indigo-400">IQ</span>
        </span>
        <Link
          href="/audit"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Start Audit →
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Free · No credit card · 2 minutes
        </div>

        {/* Headline */}
        <h1 className="max-w-3xl text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white">
          Is Your Business{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Leaving Money
          </span>{" "}
          on the Table?
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-xl text-lg sm:text-xl text-slate-400 leading-relaxed">
          Take a free 2-minute AI audit and discover where you&apos;re losing
          revenue, wasting time, and missing automation opportunities.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition-all hover:shadow-indigo-500/40 hover:scale-105 active:scale-100"
          >
            Start Your Free Audit
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <span className="text-sm text-slate-500">
            Join 500+ businesses already optimized
          </span>
        </div>

        {/* Social proof / stats */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl w-full">
          {[
            { value: "2 min", label: "Average audit time" },
            { value: "23%", label: "Avg. revenue recovery" },
            { value: "Free", label: "No strings attached" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-5"
            >
              <span className="text-3xl font-bold text-white">{stat.value}</span>
              <span className="text-sm text-slate-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-white/5 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: "💸",
              title: "Revenue Leaks",
              desc: "Spot untapped upsell, pricing gaps, and lost customer opportunities.",
            },
            {
              icon: "⏱️",
              title: "Time Drains",
              desc: "Identify repetitive tasks your team does manually that AI can handle.",
            },
            {
              icon: "⚡",
              title: "Automation Wins",
              desc: "Get a prioritized list of automations with the highest ROI for your business.",
            },
          ].map((f) => (
            <div key={f.title} className="flex flex-col gap-3">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} AuditIQ. All rights reserved.
      </footer>
    </main>
  );
}
