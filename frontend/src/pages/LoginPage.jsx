import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMail, HiLockClosed, HiShieldCheck } from 'react-icons/hi';

export default function LoginPage({ showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      showToast?.('Welcome back, ' + data.fullName + '!', 'success');
      if (data.role === 'SUPER_ADMIN') navigate('/admin');
      else if (data.role === 'INSTITUTION_ADMIN') navigate('/institution');
      else navigate('/student');
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const demoLogins = [
    { label: 'Super Admin', email: 'admin@certichain.com', password: 'admin123' },
    { label: 'Institution Admin', email: 'registrar@iitd.ac.in', password: 'inst123' },
    { label: 'Student', email: 'ayush@student.com', password: 'student123' },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <HiShieldCheck className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">Sign in to access your CertiChain dashboard</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Email Address</label>
              <div className="relative">
                <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-lg" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field !pl-12"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-lg" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center !py-3.5 text-base font-semibold disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-400 hover:underline font-semibold">Sign up</Link>
            </p>
          </div>
        </div>

        {/* Quick Demo Logins */}
        <div className="mt-8">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] text-center uppercase tracking-wider mb-3">
            Quick Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            {demoLogins.map((demo, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleDemoClick(demo.email, demo.password)}
                className="p-2.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-slate-300 transition-all text-center truncate cursor-pointer"
              >
                {demo.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
