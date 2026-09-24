import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMail, HiLockClosed, HiUser, HiAcademicCap, HiOfficeBuilding, HiPhone, HiGlobeAlt } from 'react-icons/hi';

export default function SignupPage({ showToast }) {
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', role: 'STUDENT',
    institutionName: '', accreditationId: '', contactPhone: '',
    institutionAddress: '', website: '', description: ''
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await signup(formData);
      showToast?.('Account created successfully!', 'success');
      if (data.role === 'INSTITUTION_ADMIN') navigate('/institution');
      else navigate('/student');
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isInstitution = formData.role === 'INSTITUTION_ADMIN';

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div className="w-full max-w-xl animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">Join CertiChain to issue or manage verified credentials</p>
        </div>

        <div className="glass-card p-6 sm:p-8">
          {/* Role Selector */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer
                ${!isInstitution ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-md shadow-indigo-500/10' : 'border-white/10 text-[var(--color-text-muted)] hover:border-white/20'}`}
            >
              <HiAcademicCap className="text-lg" /> Student
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'INSTITUTION_ADMIN' })}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer
                ${isInstitution ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-md shadow-indigo-500/10' : 'border-white/10 text-[var(--color-text-muted)] hover:border-white/20'}`}
            >
              <HiOfficeBuilding className="text-lg" /> Institution
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">Full Name</label>
                <div className="relative">
                  <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-lg" />
                  <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} className="input-field !pl-12" placeholder="Your full name" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">Email</label>
                <div className="relative">
                  <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-lg" />
                  <input name="email" type="email" value={formData.email} onChange={handleChange} className="input-field !pl-12" placeholder="you@example.com" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-lg" />
                  <input name="password" type="password" value={formData.password} onChange={handleChange} className="input-field !pl-12" placeholder="Min. 6 characters" required minLength={6} />
                </div>
              </div>
            </div>

            {isInstitution && (
              <div className="space-y-4 pt-5 mt-2 border-t border-white/10">
                <p className="text-sm font-bold text-indigo-400">Institution Accreditation & Profile</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">Institution Name</label>
                    <input name="institutionName" type="text" value={formData.institutionName} onChange={handleChange} className="input-field" placeholder="e.g., IIT Delhi" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">Accreditation ID</label>
                    <input name="accreditationId" type="text" value={formData.accreditationId} onChange={handleChange} className="input-field" placeholder="AICTE-2024-XXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">Contact Phone</label>
                    <div className="relative">
                      <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input name="contactPhone" type="tel" value={formData.contactPhone} onChange={handleChange} className="input-field !pl-11" placeholder="+91-..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">Official Website</label>
                    <div className="relative">
                      <HiGlobeAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input name="website" type="url" value={formData.website} onChange={handleChange} className="input-field !pl-11" placeholder="https://..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">Address</label>
                    <input name="institutionAddress" type="text" value={formData.institutionAddress} onChange={handleChange} className="input-field" placeholder="City, State" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">Brief Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="input-field" rows="2" placeholder="Brief details about your university / institute" />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3.5 text-base font-semibold disabled:opacity-50 mt-6">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : isInstitution ? 'Submit Application' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:underline font-semibold">Sign in</Link>
            </p>
          </div>
          {isInstitution && (
            <p className="text-xs text-[var(--color-text-muted)] text-center mt-3">
              * Note: Institution registrations undergo Super Admin verification before certificate issuance is enabled.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
