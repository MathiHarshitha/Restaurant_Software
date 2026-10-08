import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '../store/authSlice';
import logoSrc from '/logo.jpeg';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { status, error } = useSelector((s) => s.auth);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ identifier, password }));
    if (result.meta.requestStatus === 'fulfilled') navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left brand panel ── */}
      <div
        className="hidden w-[460px] shrink-0 flex-col justify-between p-10 lg:flex"
        style={{ background: '#282623' }}
      >
        {/* Logo */}
        <div className="flex justify-center pt-4">
          <img
            src={logoSrc}
            alt="Connect Family Restaurant & Dhaba"
            className="h-[160px] w-auto object-contain"
            draggable={false}
          />
        </div>

        {/* Tagline */}
        <div className="pb-4">
          {/* Gold rule */}
          <div className="mb-6 h-px" style={{ background: 'linear-gradient(90deg,transparent,#D4AF6B,transparent)' }} />
          <h2 className="text-[36px] font-bold leading-tight tracking-tight" style={{ color: '#F7EAD6' }}>
            Bill faster.<br />
            Work offline.<br />
            Know your business.
          </h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: '#D4AF6B80' }}>
            A modern POS &amp; analytics platform built for Indian restaurant owners — works even when the internet doesn't.
          </p>
        </div>

        {/* Bottom credits */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: '#D4AF6B30' }} />
          <span className="text-xs" style={{ color: '#D4AF6B60' }}>Demo Version · 2026</span>
          <div className="h-px flex-1" style={{ background: '#D4AF6B30' }} />
        </div>
      </div>

      {/* ── Right login form ── */}
      <div className="flex flex-1 flex-col items-center justify-center p-8" style={{ background: '#F7EAD620', backdropFilter: 'none' }}>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-6 flex justify-center lg:hidden">
            <img src={logoSrc} alt="Connect Dhaba" className="h-24 w-auto" />
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#282623' }}>
              Connect Family Restaurant &amp; Dhaba
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: '#8B5E3C' }}>Restaurant Billing &amp; Management</p>
          </div>

          <form onSubmit={handleSubmit} className="card card-pad space-y-4">
            <div>
              <label className="label" htmlFor="identifier">Email / Username</label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                className="input"
                placeholder="owner@connectdhaba.in"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-400 hover:text-ink-700"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-200">{error}</p>
            )}

            <button
              type="submit"
              className="btn-primary btn-lg w-full"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Gold line below form */}
          <div className="mt-4 h-px" style={{ background: 'linear-gradient(90deg,transparent,#D4AF6B80,transparent)' }} />

          <p className="mt-3 text-center text-xs" style={{ color: '#8B5E3C' }}>
            Demo: <span className="font-mono">owner@srilakshmi.in</span> / <span className="font-mono">demo1234</span>
          </p>
        </div>
      </div>
    </div>
  );
}
