import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, Ticket, UserRound } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api';

export default function Kiosk() {
  const [branches, setBranches] = useState([]);
  const [selectedOrganizationName, setSelectedOrganizationName] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [queues, setQueues] = useState([]);
  const [selectedQueueId, setSelectedQueueId] = useState('');
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
    tokenType: 'WALK_IN',
  });
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/public/branches')
        .then((response) => {
          setBranches(response.data);
          if (response.data.length) setSelectedOrganizationName(response.data[0].organizationName);
        })
        .catch(() => setMessage({ type: 'error', text: 'Unable to load branches.' }));
  }, []);

  const organizations = useMemo(() => {
    const names = Array.from(new Set(branches.map((b) => b.organizationName).filter(Boolean)));
    return names.map((name) => ({ value: name, label: name }));
  }, [branches]);

  const organizationBranches = useMemo(
      () => branches.filter((b) => !selectedOrganizationName || b.organizationName === selectedOrganizationName),
      [branches, selectedOrganizationName],
  );

  useEffect(() => {
    if (!organizationBranches.length) { setSelectedBranchId(''); return; }
    if (!organizationBranches.some((b) => String(b.id) === selectedBranchId))
      setSelectedBranchId(String(organizationBranches[0].id));
  }, [organizationBranches, selectedBranchId]);

  useEffect(() => {
    if (!selectedBranchId) return;
    api.get(`/public/branches/${selectedBranchId}/queues`)
        .then((response) => {
          setQueues(response.data);
          setSelectedQueueId(response.data[0] ? String(response.data[0].id) : '');
        })
        .catch(() => setMessage({ type: 'error', text: 'Unable to load queues.' }));
  }, [selectedBranchId]);

  const selectedBranch = useMemo(
      () => branches.find((b) => String(b.id) === selectedBranchId),
      [branches, selectedBranchId],
  );

  const selectedQueue = useMemo(
      () => queues.find((q) => String(q.id) === selectedQueueId),
      [queues, selectedQueueId],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      const response = await api.post(`/public/queues/${selectedQueueId}/tokens`, form);
      setBooking(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Token booking failed.' });
    }
  };

  const reset = () => {
    setBooking(null);
    setMessage({ type: '', text: '' });
    setForm({ customerName: '', customerPhone: '', customerEmail: '', notes: '', tokenType: 'WALK_IN' });
  };

  return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#0f172a_0%,#111827_40%,#1c1917_100%)]">

        {/* Header */}
        <header className="border-b border-white/8 bg-black/25 backdrop-blur-sm px-6 py-4">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Public Kiosk</p>
              <h1 className="text-xl font-black text-white mt-0.5">Book a live token and receive email alerts</h1>
            </div>
            <Link
                to="/"
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition"
            >
              ← Back Home
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-6 lg:grid-cols-[0.92fr,1.08fr]">

            {/* Booking form */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 space-y-5">

              {/* Selectors */}
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block sm:col-span-3">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Organization</span>
                  <select
                      value={selectedOrganizationName}
                      onChange={(e) => setSelectedOrganizationName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400"
                  >
                    {organizations.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Branch</span>
                  <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400"
                  >
                    {organizationBranches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Service Queue</span>
                  <select
                      value={selectedQueueId}
                      onChange={(e) => setSelectedQueueId(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400"
                  >
                    {queues.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
                  </select>
                </label>
              </div>

              {/* Queue card */}
              {selectedQueue && (
                  <div className="rounded-xl border border-amber-400/20 bg-amber-400/8 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/70 mb-1">{selectedOrganizationName}</p>
                        <p className="text-xl font-bold text-white">{selectedQueue.name}</p>
                        <p className="mt-1.5 text-xs leading-6 text-amber-100/80">{selectedQueue.description}</p>
                      </div>
                      <div className="rounded-xl bg-black/25 px-4 py-3 text-center flex-shrink-0">
                        <p className="text-xs uppercase tracking-[0.2em] text-amber-300/60">Waiting</p>
                        <p className="text-3xl font-black text-white mt-0.5">{selectedQueue.waitingCount}</p>
                      </div>
                    </div>
                    <div className="mt-3.5 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-black/20 border border-white/10 px-3 py-1.5 text-amber-100/70">
                    Dept: {selectedQueue.departmentName}
                  </span>
                      <span className="rounded-full bg-black/20 border border-white/10 px-3 py-1.5 text-amber-100/70">
                    ~{selectedQueue.averageServiceTimeMinutes} min/customer
                  </span>
                      <span className="rounded-full bg-black/20 border border-white/10 px-3 py-1.5 text-amber-100/70">
                    Code: {selectedQueue.serviceCode}
                  </span>
                    </div>
                  </div>
              )}

              {/* Form fields */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <InputField icon={UserRound} placeholder="Customer name" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} />
                  <InputField icon={Phone} placeholder="Phone number" value={form.customerPhone} onChange={(v) => setForm({ ...form, customerPhone: v })} />
                </div>
                <InputField icon={Mail} placeholder="Email for notifications" value={form.customerEmail} onChange={(v) => setForm({ ...form, customerEmail: v })} />
                <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400 transition"
                    placeholder="Additional notes or appointment context"
                />

                {/* Token type */}
                <div className="grid gap-2 sm:grid-cols-3">
                  {['WALK_IN', 'ONLINE_APPOINTMENT', 'VIP'].map((type) => (
                      <button
                          key={type}
                          type="button"
                          onClick={() => setForm({ ...form, tokenType: type })}
                          className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                              form.tokenType === type
                                  ? 'border-amber-400 bg-amber-400 text-stone-900'
                                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                      >
                        {type.replace('_', ' ')}
                      </button>
                  ))}
                </div>

                <button
                    type="submit"
                    disabled={!selectedQueueId}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3.5 text-base font-black text-stone-900 transition hover:brightness-110 disabled:opacity-60"
                >
                  <Ticket className="h-5 w-5" /> Generate Token
                </button>

                {message.text && (
                    <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                        message.type === 'error'
                            ? 'border-red-300/20 bg-red-300/8 text-red-200'
                            : 'border-emerald-300/20 bg-emerald-300/8 text-emerald-200'
                    }`}>
                      {message.text}
                    </div>
                )}
              </form>
            </div>

            {/* Right panel */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
              {!booking ? (
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 mb-4">Why this setup is advanced</p>
                      <h2 className="text-2xl font-black text-white leading-snug">
                        Structured booking flow with organization-level routing.
                      </h2>
                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <FeatureCard title="Organization routing" description="Customers first choose the business network and then see only its branches." />
                        <FeatureCard title="Queue intelligence" description="Priority-aware routing serves VIP and online appointments in the correct order." />
                        <FeatureCard title="Live tracking" description="Each token can be tracked in real time through the status page and TV board." />
                        <FeatureCard title="Email notifications" description="Booking confirmations and turn alerts are sent through Gmail SMTP." />
                      </div>
                    </div>

                    {selectedBranch && (
                        <div className="mt-6 rounded-xl border border-sky-400/20 bg-sky-400/8 p-5">
                          <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-sky-400/15 p-2.5 text-sky-300 flex-shrink-0">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300 mb-2">Selected Branch</p>
                              <p className="text-lg font-bold text-white">{selectedBranch.name}</p>
                              <p className="text-sm text-slate-300 mt-1">{selectedBranch.location}</p>
                              <p className="text-xs text-sky-200 mt-1">{selectedBranch.organizationName}</p>
                              <p className="text-xs text-sky-200">{selectedBranch.supportEmail}</p>
                            </div>
                          </div>
                        </div>
                    )}
                  </div>
              ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-emerald-400/15 border border-emerald-400/20 p-4 text-emerald-300 mb-4">
                      <Ticket className="h-7 w-7" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Booking Confirmed</p>
                    <h2 className="mt-2 text-8xl font-black text-white tracking-tight">{booking.tokenIdentifier}</h2>
                    <p className="mt-2 text-lg text-slate-300">{booking.queueName}</p>

                    <div className="mt-6 grid w-full max-w-sm gap-3 grid-cols-3">
                      <Metric label="Ahead" value={booking.peopleAhead} />
                      <Metric label="Est. Wait" value={`${booking.estimatedWaitMinutes}m`} />
                      <Metric label="Branch" value={booking.branchName} small />
                    </div>

                    <div className="mt-8 rounded-2xl bg-white p-4 shadow-xl">
                      <QRCodeSVG value={`${window.location.origin}/status/${booking.id}`} size={160} />
                    </div>

                    <Link
                        to={`/status/${booking.id}`}
                        className="mt-5 text-sm font-semibold text-amber-300 hover:underline underline-offset-4"
                    >
                      Open live tracking →
                    </Link>
                    <p className="mt-3 max-w-sm text-xs leading-6 text-slate-400">
                      {booking.customerEmail
                          ? `Confirmation sent to ${booking.customerEmail}.`
                          : 'No email provided — only local tracking available.'}
                    </p>
                    <button
                        onClick={reset}
                        className="mt-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition"
                    >
                      Book Another Token
                    </button>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

function InputField({ icon: Icon, placeholder, value, onChange }) {
  return (
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={placeholder === 'Customer name' || placeholder === 'Phone number'}
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400 transition"
            placeholder={placeholder}
        />
      </div>
  );
}

function FeatureCard({ title, description }) {
  return (
      <div className="rounded-xl border border-white/8 bg-white/4 p-4">
        <p className="text-sm font-bold text-white mb-1">{title}</p>
        <p className="text-xs leading-5 text-slate-400">{description}</p>
      </div>
  );
}

function Metric({ label, value, small }) {
  return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1.5">{label}</p>
        <p className={`font-black text-white ${small ? 'text-base' : 'text-2xl'}`}>{value}</p>
      </div>
  );
}