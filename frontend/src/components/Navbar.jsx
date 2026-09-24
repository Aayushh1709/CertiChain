import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { HiMenu, HiX, HiShieldCheck } from 'react-icons/hi';

export default function Navbar() {
  const { user, isAuthenticated, logout, isSuperAdmin, isInstitutionAdmin, isStudent } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isSuperAdmin) return '/admin';
    if (isInstitutionAdmin) return '/institution';
    if (isStudent) return '/student';
    return '/';
  };

  const getRoleBadge = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isInstitutionAdmin) return 'Institution';
    if (isStudent) return 'Student';
    return '';
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#090d16]/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-indigo-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-indigo-500/40 transition-all duration-300">
              <HiShieldCheck className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold font-[var(--font-heading)] tracking-tight">
              <span className="gradient-text">Certi</span>
              <span className="text-white">Chain</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/verify" className="text-[var(--color-text-secondary)] hover:text-indigo-300 transition-colors font-medium text-sm">
              Verify Certificate
            </Link>

            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="text-[var(--color-text-secondary)] hover:text-indigo-300 transition-colors font-medium text-sm">
                  Dashboard
                </Link>
                <div className="flex items-center gap-4 pl-3 border-l border-white/10">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white leading-tight">{user.fullName}</p>
                    <p className="text-xs font-medium text-indigo-400">{getRoleBadge()}</p>
                  </div>
                  <button onClick={handleLogout} className="btn-secondary text-xs !py-2 !px-3.5">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-secondary text-sm !py-2 !px-4">Log In</Link>
                <Link to="/signup" className="btn-primary text-sm !py-2 !px-4">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white text-2xl p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/10 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link to="/verify" onClick={() => setMobileOpen(false)} className="text-[var(--color-text-secondary)] hover:text-indigo-300 transition-colors font-medium py-1.5">
                Verify Certificate
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="text-[var(--color-text-secondary)] hover:text-indigo-300 transition-colors font-medium py-1.5">
                    Dashboard
                  </Link>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-sm font-semibold text-white">{user.fullName}</p>
                    <p className="text-xs text-indigo-400 mb-2">{getRoleBadge()}</p>
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="btn-secondary text-xs w-full justify-center">
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm text-center">Log In</Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
