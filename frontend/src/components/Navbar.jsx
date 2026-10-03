import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import { HiMenu, HiX, HiShieldCheck, HiSun, HiMoon, HiDesktopComputer } from 'react-icons/hi';

export default function Navbar() {
  const { user, isAuthenticated, logout, isSuperAdmin, isInstitutionAdmin, isStudent } = useAuth();
  const { themeMode, cycleTheme, resolvedTheme } = useTheme();
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

  const getThemeIcon = () => {
    if (themeMode === 'system') return <HiDesktopComputer className="text-indigo-400 text-lg" />;
    if (themeMode === 'light') return <HiSun className="text-amber-400 text-lg" />;
    return <HiMoon className="text-indigo-300 text-lg" />;
  };

  const getThemeLabel = () => {
    if (themeMode === 'system') return `System (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})`;
    if (themeMode === 'light') return 'Light Mode';
    return 'Dark Mode';
  };

  return (
    <nav className="sticky top-0 z-50 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--color-border)] shadow-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-indigo-500/40 transition-all duration-300">
              <HiShieldCheck className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold font-[var(--font-heading)] tracking-tight">
              <span className="gradient-text">Certi</span>
              <span className="text-[var(--color-text-primary)]">Chain</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/verify" className="text-[var(--color-text-secondary)] hover:text-indigo-400 transition-colors font-medium text-sm">
              Verify Certificate
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={cycleTheme}
              title={`Current: ${getThemeLabel()}. Click to switch theme (System -> Light -> Dark)`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-indigo-500/50 transition-all duration-200 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] shadow-sm"
            >
              {getThemeIcon()}
              <span className="capitalize">{themeMode}</span>
            </button>

            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="text-[var(--color-text-secondary)] hover:text-indigo-400 transition-colors font-medium text-sm">
                  Dashboard
                </Link>
                <div className="flex items-center gap-4 pl-3 border-l border-[var(--color-border)]">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">{user.fullName}</p>
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

          {/* Mobile Right Controls */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={cycleTheme}
              title={`Theme: ${themeMode}`}
              className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-sm flex items-center justify-center"
            >
              {getThemeIcon()}
            </button>
            <button
              className="text-[var(--color-text-primary)] text-2xl p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-[var(--color-border)] animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link to="/verify" onClick={() => setMobileOpen(false)} className="text-[var(--color-text-secondary)] hover:text-indigo-400 transition-colors font-medium py-1.5">
                Verify Certificate
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="text-[var(--color-text-secondary)] hover:text-indigo-400 transition-colors font-medium py-1.5">
                    Dashboard
                  </Link>
                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{user.fullName}</p>
                    <p className="text-xs text-indigo-400 mb-2">{getRoleBadge()}</p>
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="btn-secondary text-xs w-full justify-center">
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2 border-t border-[var(--color-border)]">
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
