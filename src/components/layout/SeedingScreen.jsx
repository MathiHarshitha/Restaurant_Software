import { UtensilsCrossed } from 'lucide-react';

export default function SeedingScreen({ progress = 0, message = 'Setting up your restaurant…' }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-brand-900 text-white">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
        <UtensilsCrossed size={30} />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">Connect Dhaba</h1>
      <p className="mt-1 text-sm text-white/60">Restaurant Billing &amp; Management</p>

      <div className="mt-10 w-64">
        <div className="mb-2 flex justify-between text-xs text-white/50">
          <span>{message}</span>
          <span className="num">{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white/70 transition-all duration-300"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
      <p className="mt-6 text-xs text-white/30">First run — generating demo data…</p>
    </div>
  );
}
