import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import { useRestaurant, useSyncMeta, useSyncLogs } from '../hooks/useData';
import { formatDate, formatTime } from '../utils/dates';
import { PageHeader } from '../components/ui/misc';
import ConfirmDialog from '../components/ui/ConfirmDialog';

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        className="input"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default function Settings() {
  const restaurant = useRestaurant();
  const syncMeta = useSyncMeta();
  const syncLogs = useSyncLogs(6);

  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetProgress, setResetProgress] = useState(0);

  useEffect(() => { if (restaurant) setForm({ ...restaurant }); }, [restaurant?.id]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await settingsService.updateRestaurant(form);
      toast.success('Settings saved.');
    } catch { toast.error('Could not save settings.'); }
    finally { setBusy(false); }
  };

  const handleReset = async () => {
    setResetBusy(true);
    try {
      await settingsService.resetDemoData((p, msg) => setResetProgress(p));
      toast.success('Demo data reset successfully. Refreshing…');
      setTimeout(() => window.location.reload(), 1000);
    } catch { toast.error('Reset failed.'); }
    finally { setResetBusy(false); setResetOpen(false); }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Restaurant profile and application settings" />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* Profile form */}
        <form onSubmit={handleSave}>
          <div className="card card-pad space-y-4">
            <h2 className="card-title">Restaurant Profile</h2>
            <Field label="Restaurant Name" value={form.name} onChange={set('name')} placeholder="Connect Dhaba" />
            <Field label="Tagline" value={form.tagline} onChange={set('tagline')} placeholder="Pure taste since 1998" />
            <Field label="Address" value={form.address} onChange={set('address')} placeholder="12-2-417, Main Road, Ameerpet, Hyderabad" />
            <Field label="Phone Number" value={form.phone} onChange={set('phone')} placeholder="040 2374 5566" />
            <Field label="GSTIN" value={form.gstin} onChange={set('gstin')} placeholder="36AABFS4821K1Z5" />
            <Field label="Receipt Footer" value={form.receiptFooter} onChange={set('receiptFooter')} placeholder="Thank You. Visit Again." />
            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        </form>

        {/* Right column */}
        <div className="space-y-5">
          {/* Sync status */}
          <div className="card card-pad">
            <h2 className="card-title mb-3">Sync Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">Last synced</span>
                <span className="text-ink-900">
                  {syncMeta?.lastSyncedAt
                    ? `${formatDate(syncMeta.lastSyncedAt)} ${formatTime(syncMeta.lastSyncedAt)}`
                    : 'Never'}
                </span>
              </div>
            </div>
            {syncLogs?.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">Recent Activity</p>
                {syncLogs.map((log) => (
                  <div key={log.logId} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-xs">
                    <span className={log.type === 'success' ? 'text-emerald-700' : 'text-red-600'}>
                      {log.type === 'success' ? `✓ Synced ${log.count} bill${log.count !== 1 ? 's' : ''}` : `✗ ${log.message}`}
                    </span>
                    <span className="text-ink-400">{formatTime(log.at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Demo data reset */}
          <div className="card card-pad">
            <h2 className="card-title">Demo Data</h2>
            <p className="card-sub mt-0.5 mb-3">Reset all local data and regenerate the demo restaurant from scratch. This cannot be undone.</p>
            {resetBusy && (
              <div className="mb-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${Math.round(resetProgress * 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-ink-500 text-center">Resetting… {Math.round(resetProgress * 100)}%</p>
              </div>
            )}
            <button type="button" className="btn-secondary w-full" onClick={() => setResetOpen(true)} disabled={resetBusy}>
              <RefreshCw size={15} /> Reset Demo Data
            </button>
          </div>

          {/* App info */}
          <div className="card card-pad">
            <h2 className="card-title mb-3">About</h2>
            <div className="space-y-1.5 text-sm">
              {[['Version', '1.0.0 Demo'], ['Technology', 'React · Vite · Dexie.js'], ['Storage', 'IndexedDB (offline-first)'], ['PWA', 'Supported']].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-ink-500">{k}</span>
                  <span className="text-ink-800">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset Demo Data"
        message="This will permanently delete all local bills, menu changes, and settings, then regenerate fresh demo data. Are you sure?"
        confirmLabel="Reset Everything"
        danger
        busy={resetBusy}
        onConfirm={handleReset}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}
