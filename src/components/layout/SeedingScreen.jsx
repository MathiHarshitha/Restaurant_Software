import logoSrc from '/logo.jpeg';

export default function SeedingScreen({ progress = 0, message = 'Setting up your restaurant…' }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-white" style={{ background: '#282623' }}>
      {/* Logo */}
      <img
        src={logoSrc}
        alt="Connect Family Restaurant & Dhaba"
        className="mb-4 h-[130px] w-auto object-contain"
        draggable={false}
      />

      {/* Gold rule */}
      <div className="mb-6 w-48 h-px" style={{ background: 'linear-gradient(90deg,transparent,#D4AF6B,transparent)' }} />

      <p className="text-sm" style={{ color: '#D4AF6B80' }}>Restaurant Billing &amp; Management</p>

      {/* Progress */}
      <div className="mt-8 w-64">
        <div className="mb-2 flex justify-between text-xs" style={{ color: '#D4AF6B70' }}>
          <span>{message}</span>
          <span className="num">{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: '#ffffff15' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.round(progress * 100)}%`, background: '#D4AF6B' }}
          />
        </div>
      </div>
      <p className="mt-5 text-xs" style={{ color: '#D4AF6B40' }}>First run — generating demo data…</p>
    </div>
  );
}
