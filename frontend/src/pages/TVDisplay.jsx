import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MonitorSpeaker, RefreshCw, Ticket } from 'lucide-react';
import api from '../api';

export default function TVDisplay() {
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [board, setBoard] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    api.get('/public/branches').then((response) => {
      setBranches(response.data);
      if (response.data.length) {
        setBranchId(String(response.data[0].id));
      }
    });
  }, []);

  useEffect(() => {
    if (!branchId) return;
    const loadBoard = () =>
        api.get(`/public/branches/${branchId}/board`).then((response) => {
          setBoard(response.data);
          setLastUpdated(new Date());
        });
    loadBoard();
    const interval = setInterval(loadBoard, 4000);
    return () => clearInterval(interval);
  }, [branchId]);

  const currentBranch = useMemo(
      () => branches.find((branch) => String(branch.id) === branchId),
      [branches, branchId],
  );

  return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#030712_0%,#0f172a_55%,#022c22_100%)]">

        {/* Header bar */}
        <header className="border-b border-white/8 bg-black/30 backdrop-blur-sm px-6 py-4">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-emerald-400/15 border border-emerald-400/20 p-3 text-emerald-300">
                <MonitorSpeaker className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Live Queue Board</p>
                <h1 className="text-2xl font-black text-white leading-tight">
                  {board?.organizationName || currentBranch?.organizationName || 'Smart Queue Network'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lastUpdated && (
                  <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                <RefreshCw className="h-3 w-3" />
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
              )}
              <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400"
              >
                {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
              <Link
                  to="/"
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition"
              >
                Home
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">

            {/* Now Serving */}
            <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Now Serving</p>
                  <p className="mt-1 text-lg font-bold text-white">{board?.branchName || 'Loading...'}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Auto refresh
                </div>
              </div>

              <div className="space-y-3">
                {board?.serving?.length ? (
                    board.serving.map((item, index) => (
                        <div
                            key={`${item.id}-${index}`}
                            className="rounded-2xl border border-emerald-400/25 bg-emerald-400/8 p-5"
                        >
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/60 mb-2">Token</p>
                              <p className="text-5xl font-black text-white tracking-tight">{item.tokenIdentifier}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/60 mb-2">Queue</p>
                              <p className="text-xl font-bold text-white">{item.queueName}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/60 mb-2">Counter</p>
                              <p className="text-xl font-bold text-white">{item.counterName}</p>
                            </div>
                          </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-8 text-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                        <Ticket className="h-5 w-5 text-slate-500" />
                      </div>
                      <p className="text-slate-400 text-sm">No active serving tokens right now.</p>
                    </div>
                )}
              </div>
            </div>

            {/* Waiting Preview */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Waiting Preview</p>
                {board?.waiting?.length > 0 && (
                    <span className="text-xs font-bold text-amber-300 bg-amber-300/10 border border-amber-300/20 rounded-full px-2.5 py-1">
                  {board.waiting.length} waiting
                </span>
                )}
              </div>

              <div className="space-y-2.5">
                {board?.waiting?.length ? (
                    board.waiting.map((item, index) => (
                        <div
                            key={`${item.id}-${index}`}
                            className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-4 py-3.5 hover:bg-white/6 transition"
                        >
                          <div>
                            <p className="text-xl font-black text-white">{item.tokenIdentifier}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{item.queueName}</p>
                          </div>
                          <span className={`text-xs font-bold uppercase tracking-[0.15em] rounded-full px-3 py-1.5 ${
                              item.type === 'VIP'
                                  ? 'bg-purple-400/15 text-purple-300 border border-purple-400/20'
                                  : item.type === 'ONLINE_APPOINTMENT'
                                      ? 'bg-sky-400/15 text-sky-300 border border-sky-400/20'
                                      : 'bg-amber-300/15 text-amber-200 border border-amber-300/20'
                          }`}>
                      {item.type?.replace('_', ' ')}
                    </span>
                        </div>
                    ))
                ) : (
                    <div className="rounded-xl border border-white/8 bg-white/4 p-6 text-center text-sm text-slate-400">
                      Waiting queue is currently empty.
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}