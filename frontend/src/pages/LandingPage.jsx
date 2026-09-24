import { Link } from 'react-router-dom';
import { HiShieldCheck, HiLightningBolt, HiGlobeAlt, HiDocumentSearch, HiAcademicCap, HiCheckCircle, HiLockClosed } from 'react-icons/hi';

export default function LandingPage() {
  const features = [
    {
      icon: HiLockClosed,
      title: 'Tamper-Proof',
      desc: 'Certificates are hashed and anchored on the blockchain, making forgery mathematically impossible.',
      color: 'from-indigo-500/20 to-purple-500/20',
      iconColor: 'text-indigo-400'
    },
    {
      icon: HiLightningBolt,
      title: 'Instant Verification',
      desc: 'Verify any certificate in under 5 seconds with zero paperwork or institutional delay.',
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400'
    },
    {
      icon: HiGlobeAlt,
      title: 'Decentralized Trust',
      desc: 'No single point of failure. Verification works 24/7 even if the issuing university is offline.',
      color: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400'
    },
    {
      icon: HiCheckCircle,
      title: 'Public Access',
      desc: 'Anyone, including employers and recruiters, can verify credentials without logging in.',
      color: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-400'
    },
  ];

  const steps = [
    { num: '01', title: 'Institution Issues', desc: 'Registrar enters student details or uploads batch CSV. System generates QR-coded certificate.' },
    { num: '02', title: 'Blockchain Anchoring', desc: 'SHA-256 certificate hash is committed to the simulated immutable ledger with timestamp.' },
    { num: '03', title: 'Student Receives', desc: 'Student accesses digital certificate, shares verification links, or downloads official PDF.' },
    { num: '04', title: 'Anyone Verifies', desc: 'Employers enter ID, upload file, or scan QR code for instant VALID / INVALID verification.' },
  ];

  const stats = [
    { value: '100K+', label: 'Certificates Secured', grad: 'from-indigo-400 to-purple-400' },
    { value: '<5s', label: 'Verification Time', grad: 'from-blue-400 to-cyan-400' },
    { value: '99.9%', label: 'Platform Uptime', grad: 'from-emerald-400 to-teal-400' },
    { value: '0', label: 'Forged Certificates', grad: 'from-purple-400 to-pink-400' },
  ];

  return (
    <div style={{ width: '100%', overflowX: 'hidden', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', paddingTop: '5rem', paddingBottom: '5rem', textAlign: 'center' }}>
        {/* Glow blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 rounded-full blur-[130px] animate-float" />
          <div className="absolute top-1/3 left-1/6 w-80 h-80 bg-blue-500/15 rounded-full blur-[90px] animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-purple-500/15 rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          className="animate-fade-in">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 mb-8 backdrop-blur-md shadow-lg shadow-indigo-500/10">
            <HiShieldCheck className="text-indigo-400 text-lg" />
            <span className="text-sm font-semibold tracking-wide text-indigo-200">
              Blockchain-Powered Credential Verification
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.15] tracking-tight text-white">
            <span className="gradient-text">Tamper-Proof</span>
            <br />
            Academic Certificates
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-[var(--color-text-secondary)] mb-10 leading-relaxed font-normal" style={{ maxWidth: '40rem' }}>
            Issue, manage, and verify educational credentials on an immutable simulated blockchain ledger.
            Eliminate fraud and guarantee instant institutional trust.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <Link to="/verify" className="btn-primary animate-glow" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              <HiDocumentSearch style={{ fontSize: '1.25rem', flexShrink: 0 }} />
              <span>Verify a Certificate</span>
            </Link>
            <Link to="/signup" className="btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              <HiAcademicCap style={{ fontSize: '1.25rem', flexShrink: 0 }} />
              <span>Register Institution</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: '2.5rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}
          className="lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card animate-fade-in"
              style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', animationDelay: `${i * 0.1}s` }}>
              <p className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r ${stat.grad} bg-clip-text text-transparent`} style={{ marginBottom: '0.5rem' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '4rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ marginBottom: '1rem' }}>
              Why <span className="gradient-text">CertiChain</span>?
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', maxWidth: '40rem', margin: '0 auto' }}>
              A comprehensive solution engineered to eliminate academic credential fraud end-to-end.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {features.map((feature, i) => (
              <div key={i} className="glass-card group animate-fade-in"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', animationDelay: `${i * 0.1}s` }}>
                <div className={`bg-gradient-to-br ${feature.color} border border-white/10 group-hover:scale-110 transition-transform`}
                  style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <feature.icon className={feature.iconColor} style={{ fontSize: '1.5rem' }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '0.625rem' }}>{feature.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, flexGrow: 1 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '4rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ marginBottom: '1rem' }}>
              How It <span className="gradient-text">Works</span>
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', maxWidth: '40rem', margin: '0 auto' }}>
              From institutional issuance to instant public verification in four simple steps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {steps.map((step, i) => (
              <div key={i} className="glass-card animate-fade-in"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', animationDelay: `${i * 0.12}s` }}>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.25rem 0.75rem', borderRadius: '9999px',
                    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                    color: '#a5b4fc', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.75rem'
                  }}>
                    Step {step.num}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '0.625rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, flexGrow: 1 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '4rem 0', marginBottom: '3rem' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="glass-card"
            style={{
              padding: '4rem 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(49,46,129,0.3) 0%, rgba(88,28,135,0.2) 50%, rgba(131,24,67,0.2) 100%)',
              border: '1px solid rgba(99,102,241,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
            <div style={{ position: 'absolute', top: '-6rem', right: '-6rem', width: '16rem', height: '16rem', background: 'rgba(99,102,241,0.2)', borderRadius: '9999px', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-6rem', left: '-6rem', width: '16rem', height: '16rem', background: 'rgba(168,85,247,0.2)', borderRadius: '9999px', filter: 'blur(60px)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 10, maxWidth: '40rem', width: '100%' }}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ marginBottom: '1rem' }}>Ready to Secure Your Credentials?</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.7 }}>
                Join universities, students, and employers leveraging CertiChain for fraud-free academic verification.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
                <Link to="/signup" className="btn-primary" style={{ fontSize: '1.05rem', padding: '1rem 2rem' }}>
                  <span>Register Your Institution</span>
                </Link>
                <Link to="/verify" className="btn-secondary" style={{ fontSize: '1.05rem', padding: '1rem 2rem' }}>
                  <span>Verify a Certificate</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <p>© 2026 CertiChain. All rights reserved.</p>
          <p style={{ fontSize: '0.75rem', fontWeight: 500 }}>Blockchain-Based Academic Certificate Verification System</p>
        </div>
      </footer>
    </div>
  );
}
