import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import api from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('fullName', response.data.fullName || '');
      localStorage.setItem('email', response.data.email || '');
      localStorage.setItem('branchId', response.data.branchId ?? '');
      localStorage.setItem('counterId', response.data.counterId ?? '');
      navigate(response.data.role === 'AGENT' ? '/agent' : '/admin');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.25),_transparent_30%),linear-gradient(180deg,#111827_0%,#020617_100%)] px-6 py-10">
        <div className="mx-auto flex min-h-[85vh] max-w-6xl items-center justify-center">
          <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/40 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="hidden bg-[linear-gradient(160deg,rgba(2,6,23,0.1),rgba(15,23,42,0.9)),radial-gradient(circle_at_top_left,rgba(56,189,248,0.35),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.22),transparent_30%)] p-10 lg:block">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">Staff Access</p>
              <h1 className="mt-5 text-5xl font-black leading-tight text-white">Manage advanced queue operations from a secure control console.</h1>
              <div className="mt-8 space-y-5 text-slate-300">
                <LoginFeature title="Auto admin initialization" description="The admin account and enterprise network are seeded automatically when the server starts." />
                <LoginFeature title="Agent-first workflow" description="Counter assignment, next-token calls, no-show handling, and completion flows are managed from this console." />
              </div>
            </div>

            <div className="p-8 md:p-12">
              <div className="mb-8 inline-flex rounded-2xl bg-sky-500/15 p-4 text-sky-300">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h2 className="text-4xl font-black text-white">Login</h2>
              <p className="mt-3 text-slate-400">Sign in with either your username or your email address.</p>

              <form onSubmit={handleLogin} className="mt-10 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Username / Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none transition focus:border-sky-400"
                        placeholder="admin or sonagarasmit2006@gmail.com"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Password</span>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-14 text-white outline-none transition focus:border-sky-400"
                        placeholder="Enter password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-lg font-bold text-white transition hover:from-sky-400 hover:to-blue-500 disabled:opacity-70"
                >
                  {loading ? 'Authenticating...' : 'Open Console'}
                </button>

                {errorMessage && (
                    <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-4 text-sm font-medium text-rose-100">
                      {errorMessage}
                    </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}

function LoginFeature({ title, description }) {
  return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-lg font-semibold text-white">{title}</p>
        <p className="mt-2 text-sm leading-7">{description}</p>
      </div>
  );
}