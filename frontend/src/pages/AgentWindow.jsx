import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, LogOut, PlayCircle, UserX2 } from 'lucide-react';
import api, { clearSession } from '../api';

export default function AgentWindow() {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const navigate = useNavigate();
  const counterId = localStorage.getItem('counterId');

  const loadWorkspace = async () => {
    const query = counterId ? `?counterId=${counterId}` : '';
    const response = await api.get(`/agent/workspace${query}`);
    setWorkspace(response.data);
  };

  useEffect(() => {
    loadWorkspace().catch(() => {
      clearSession();
      navigate('/login');
    });
    const interval = setInterval(() => loadWorkspace().catch(() => {}), 4000);
    return () => clearInterval(interval);
  }, [navigate]);

  const runAction = async (request) => {
    setLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const response = await request();
      await loadWorkspace();
      setFeedback({
        type: 'success',
        message: response?.data?.tokenIdentifier
            ? `${response.data.tokenIdentifier} is now being served at this counter.`
            : 'Counter action completed successfully.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error?.response?.data?.message || 'The action could not be completed.',
      });
    } finally {
      setLoading(false);
    }
  };

  const currentTokenId = workspace?.currentTokenId;

  return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#111827_0%,#0f172a_50%,#1e1b4b_100%)]">

        {/* Header */}
        <header className="border-b border-white/8 bg-black/25 backdrop-blur-sm px-6 py-4">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">Agent Console</p>
              <h1 className="text-xl font-black text-white mt-0.5">
                {workspace?.counterName || 'Counter Workspace'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {workspace?.agentName || localStorage.getItem('fullName')}
                {workspace?.branchName && <> &mdash; {workspace.branchName}</>}
              </p>
            </div>
            <button
                onClick={() => { clearSession(); navigate('/login'); }}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">

            {/* Left — current serving + actions */}
            <div className="space-y-4">
              {/* Token display */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 mb-5">Current Service</p>

                <div className="rounded-2xl border border-sky-400/20 bg-sky-400/8 p-6 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300/70 mb-3">Now Serving</p>
                  <p className="text-8xl font-black text-white tracking-tight leading-none">
                    {workspace?.currentTokenIdentifier || '—'}
                  </p>
                  <p className="mt-3 text-slate-300 text-sm">
                    {workspace?.currentQueueName || 'No active token at this counter'}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <ActionButton
                      disabled={loading || !workspace?.counterId || Boolean(currentTokenId)}
                      tone="emerald"
                      onClick={() => runAction(() => api.post(`/agent/counters/${workspace.counterId}/next`))}
                      icon={PlayCircle}
                      label="Call Next"
                  />
                  <ActionButton
                      disabled={loading || !currentTokenId}
                      tone="sky"
                      onClick={() => runAction(() => api.post(`/agent/tokens/${currentTokenId}/complete`))}
                      icon={CheckCircle2}
                      label="Complete"
                  />
                  <ActionButton
                      disabled={loading || !currentTokenId}
                      tone="rose"
                      onClick={() => runAction(() => api.post(`/agent/tokens/${currentTokenId}/no-show`))}
                      icon={UserX2}
                      label="No Show"
                  />
                </div>
              </div>

              {/* Guide note */}
              <div className="rounded-xl border border-white/8 bg-slate-950/40 px-5 py-4 text-xs leading-6 text-slate-400">
                Complete the current service or mark as no-show before calling the next token.
              </div>

              {/* Feedback */}
              {feedback.message && (
                  <div className={`rounded-xl border px-4 py-3.5 text-sm font-medium ${
                      feedback.type === 'error'
                          ? 'border-red-300/20 bg-red-300/8 text-red-200'
                          : 'border-emerald-300/20 bg-emerald-300/8 text-emerald-200'
                  }`}>
                    {feedback.message}
                  </div>
              )}
            </div>

            {/* Right — panels */}
            <div className="grid gap-4">
              <Panel title="Branch Serving Board" items={workspace?.branchServing} badgeTone="emerald" />
              <Panel title="Next Waiting Tokens" items={workspace?.nextWaiting} badgeTone="amber" />
            </div>
          </div>
        </div>
      </div>
  );
}

function ActionButton({ disabled, tone, onClick, icon: Icon, label }) {
  const styles = {
    emerald: 'bg-emerald-500 hover:bg-emerald-400 text-white disabled:bg-emerald-900 disabled:text-emerald-700',
    sky: 'bg-sky-500 hover:bg-sky-400 text-white disabled:bg-sky-900 disabled:text-sky-700',
    rose: 'bg-rose-500 hover:bg-rose-400 text-white disabled:bg-rose-900 disabled:text-rose-700',
  };

  return (
      <button
          disabled={disabled}
          onClick={onClick}
          className={`rounded-xl px-3 py-3.5 text-sm font-bold transition flex flex-col items-center gap-1.5 disabled:cursor-not-allowed ${styles[tone]}`}
      >
        <Icon className="h-5 w-5" />
        {label}
      </button>
  );
}

function Panel({ title, items, badgeTone }) {
  const badgeStyles = {
    emerald: 'bg-emerald-400/12 text-emerald-300 border border-emerald-400/20',
    amber: 'bg-amber-300/12 text-amber-200 border border-amber-300/20',
  };

  return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 mb-4">{title}</p>
        <div className="space-y-2.5">
          {items?.length ? (
              items.map((item) => (
                  <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-4 py-3.5"
                  >
                    <div>
                      <p className="text-2xl font-black text-white tracking-tight">{item.tokenIdentifier}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.queueName}</p>
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-[0.15em] rounded-full px-3 py-1.5 ${badgeStyles[badgeTone]}`}>
                {badgeTone === 'amber' ? item.type?.replace('_', ' ') : item.counterName}
              </span>
                  </div>
              ))
          ) : (
              <div className="rounded-xl border border-white/8 bg-white/4 p-5 text-sm text-slate-400 text-center">
                No records available.
              </div>
          )}
        </div>
      </div>
  );
}