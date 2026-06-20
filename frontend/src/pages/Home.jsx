import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Ticket, Tv2 } from 'lucide-react';

const panels = [
  {
    title: 'Online Token Booking',
    description: 'Book tokens online, receive email alerts, and track your turn in real time.',
    href: '/kiosk',
    icon: Ticket,
    accent: 'from-amber-400 to-orange-500',
    tag: 'Public',
  },
  {
    title: 'Live Queue Board',
    description: 'Waiting-area display showing active counters and queued tokens.',
    href: '/tv',
    icon: Tv2,
    accent: 'from-emerald-400 to-teal-500',
    tag: 'Display',
  },
  {
    title: 'Secure Staff Console',
    description: 'Admin analytics and agent controls for next-call, completion, and no-show handling.',
    href: '/login',
    icon: ShieldCheck,
    accent: 'from-sky-400 to-blue-600',
    tag: 'Staff',
  },
];

export default function Home() {
  return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_28%),linear-gradient(160deg,#0c0a09_0%,#111827_45%,#172554_100%)]">

        {/* Top nav bar */}
        <header className="border-b border-white/8 bg-black/20 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-amber-400 flex items-center justify-center">
                <Ticket className="h-3.5 w-3.5 text-stone-900" />
              </div>
              <span className="text-sm font-bold text-white tracking-wide">SmartQueue</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/tv" className="text-sm text-slate-400 hover:text-white transition px-3 py-1.5">
                Live Board
              </Link>
              <Link
                  to="/login"
                  className="text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition rounded-lg px-4 py-1.5"
              >
                Staff Login
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">

          {/* Hero */}
          <div className="grid gap-12 lg:grid-cols-[1.25fr,0.75fr] items-start mb-16">
            <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-xs font-semibold text-amber-200 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Smart Queue — Advanced Token & Queue Management
            </span>
              <h1 className="text-5xl font-black leading-[1.08] text-white md:text-6xl tracking-tight">
                Queue management<br />
                <span className="text-amber-300">built for scale.</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-300 max-w-lg">
                Live booking, branch routing, VIP priority, TV display, admin analytics, and email notifications — fully integrated end to end.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                    to="/kiosk"
                    className="inline-flex items-center rounded-xl bg-amber-400 hover:bg-amber-300 px-6 py-3.5 text-base font-bold text-stone-900 transition"
                >
                  Launch Kiosk <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                    to="/login"
                    className="inline-flex items-center rounded-xl border border-white/20 bg-white/8 hover:bg-white/12 px-6 py-3.5 text-base font-semibold text-white transition"
                >
                  Staff Login
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              <InfoCard title="Platform Capabilities" lines={['Token Booking System', 'Appointment Scheduling', 'Virtual Token Management', 'Token Generator Web App']} />
              <InfoCard title="Enterprise Features" lines={['Multi-branch setup', 'Auto admin initialization', 'Email-driven alerts', 'Live serving board']} />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-white/10" />
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Platform Modules</p>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Module cards */}
          <div className="grid gap-4 lg:grid-cols-3">
            {panels.map(({ title, description, href, icon: Icon, accent, tag }) => (
                <Link
                    key={title}
                    to={href}
                    className="group relative rounded-2xl border border-white/10 bg-slate-950/50 hover:bg-slate-950/70 p-6 transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-xl hover:shadow-black/30"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`inline-flex rounded-xl bg-gradient-to-br ${accent} p-3 text-stone-950 shadow-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 border border-white/10 rounded-full px-2.5 py-1">
                  {tag}
                </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                  <div className="mt-5 flex items-center text-sm font-semibold text-amber-300">
                    Open module <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </div>
                </Link>
            ))}
          </div>
        </div>
      </div>
  );
}

function InfoCard({ title, lines }) {
  return (
      <div className="rounded-xl border border-white/10 bg-black/25 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 mb-3">{title}</p>
        <div className="space-y-2">
          {lines.map((line) => (
              <div key={line} className="flex items-center gap-2.5">
                <div className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                <p className="text-sm font-medium text-slate-200">{line}</p>
              </div>
          ))}
        </div>
      </div>
  );
}