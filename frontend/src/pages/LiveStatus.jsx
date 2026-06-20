import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BellRing, Clock3, RefreshCw } from 'lucide-react';
import api from '../api';

export default function LiveStatus() {
  const { tokenId } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/public/tokens/${tokenId}/tracking`);
        setTracking(response.data);
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [tokenId]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#0f172a_50%,#111827_100%)] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link to="/kiosk" className="text-sm font-semibold text-slate-300 hover:text-white">
          Back to Kiosk
        </Link>

        <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
          {loading && !tracking ? (
            <div className="flex min-h-[18rem] items-center justify-center text-slate-300">
              <RefreshCw className="mr-3 h-5 w-5 animate-spin" /> Loading live status...
            </div>
          ) : tracking ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Live Tracking</p>
                  <h1 className="mt-3 text-6xl font-black text-white">{tracking.tokenIdentifier}</h1>
                  <p className="mt-3 text-lg text-slate-300">{tracking.queueName} - {tracking.branchName}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white">
                  {tracking.status}
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <StatusMetric label="People Ahead" value={tracking.peopleAhead} />
                <StatusMetric label="Estimated Wait" value={`${tracking.estimatedWaitMinutes} min`} />
                <StatusMetric label="Counter" value={tracking.counterName || 'Awaiting call'} />
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-6">
                {tracking.status === 'SERVING' ? (
                  <AlertBox text={`It is now your turn. Please proceed to ${tracking.counterName || 'the assigned counter'}.`} />
                ) : tracking.nearTurn ? (
                  <AlertBox text="Your turn will arrive shortly. Please stay near the service area and be ready for the next call." />
                ) : (
                  <div className="flex items-center text-slate-300">
                    <Clock3 className="mr-3 h-5 w-5 text-amber-300" />
                    Live status refreshes automatically. You will receive an email when your turn is close and another one when your turn is called.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-slate-300">Tracking details are not available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusMetric({ label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function AlertBox({ text }) {
  return (
    <div className="flex items-center rounded-[1.25rem] border border-emerald-300/25 bg-emerald-300/10 px-5 py-4 text-emerald-100">
      <BellRing className="mr-3 h-5 w-5" />
      {text}
    </div>
  );
}
