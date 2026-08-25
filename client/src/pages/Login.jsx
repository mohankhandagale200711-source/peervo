import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, Users } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/explore');
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Cannot connect to backend server. Make sure "npm run dev" is running in your terminal!');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-5xl grid overflow-hidden rounded-[2rem] border border-white/[0.09] bg-slate-900/70 shadow-2xl shadow-indigo-950/30 backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-900 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-2xl" />
          <div className="relative">
            <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur">
              <Sparkles className="h-6 w-6 fill-white/20 text-white" />
            </div>
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.22em] text-indigo-100">Your campus, connected</p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">Learn together.<br />Build what’s next.</h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-indigo-100/85">A focused home for student projects, useful notes, and the people who make ideas real.</p>
          </div>
          <div className="relative space-y-3">
            {['Showcase work you are proud of', 'Find notes when you need them', 'Collaborate in real time'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-semibold text-white"><CheckCircle2 className="h-4 w-4 text-indigo-200" />{item}</div>
            ))}
          </div>
        </aside>

      <div className="relative p-7 sm:p-10">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to continue your student journey</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@uni.edu"
                className="input-field py-2.5 pl-11 pr-4"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field py-2.5 pl-11 pr-4"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="primary-button w-full px-4 py-3.5 mt-2"
          >
            <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500"><Users className="h-3.5 w-3.5 text-indigo-400" />Join students who build together</div>
        <p className="text-center text-xs text-slate-400 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline font-semibold">
            Create Profile
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
