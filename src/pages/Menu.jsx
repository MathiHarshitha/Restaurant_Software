import { useEffect, useRef, useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { menuService, ValidationError } from '../services/menuService';
import { useMenuItems } from '../hooks/useData';
import { formatCurrency } from '../utils/format';
import { CATEGORIES, GST_RATES } from '../data/categories';
import { DietMark, EmptyState, PageHeader } from '../components/ui/misc';
import Switch from '../components/ui/Switch';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { cn } from '../utils/cn';

const BLANK = { name: '', category: CATEGORIES[0], price: '', gstRate: 5, isVeg: true, isAvailable: true };

function FieldError({ msg }) {
  return msg ? <p className="mt-1 text-xs text-red-600">{msg}</p> : null;
}

function ItemForm({ initial = BLANK, onSave, onCancel }) {
  const [data, setData] = useState({ ...BLANK, ...initial });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => nameRef.current?.focus(), []);

  const set = (k, v) => { setData((d) => ({ ...d, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave(data);
    } catch (err) {
      if (err instanceof ValidationError) setErrors(err.fieldErrors);
      else toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Food Name</label>
        <input ref={nameRef} className={cn('input', errors.name && 'input-error')} placeholder="e.g. Chicken Biryani"
          value={data.name} onChange={(e) => set('name', e.target.value)} />
        <FieldError msg={errors.name} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Category</label>
          <select className={cn('input', errors.category && 'input-error')} value={data.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <FieldError msg={errors.category} />
        </div>
        <div>
          <label className="label">Price (₹)</label>
          <input type="number" min="1" step="0.5" className={cn('input', errors.price && 'input-error')}
            placeholder="220" value={data.price} onChange={(e) => set('price', e.target.value)} />
          <FieldError msg={errors.price} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">GST Rate</label>
          <select className="input" value={data.gstRate} onChange={(e) => set('gstRate', Number(e.target.value))}>
            {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
          </select>
        </div>
        <div>
          <label className="label">Type</label>
          <div className="flex gap-2">
            {[true, false].map((v) => (
              <button key={String(v)} type="button"
                className={cn('flex-1 h-10 rounded-lg border text-sm font-medium transition-colors',
                  data.isVeg === v
                    ? v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-red-400 bg-red-50 text-red-700'
                    : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50')}
                onClick={() => set('isVeg', v)}>
                {v ? '🟢 Veg' : '🔴 Non-veg'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2.5">
        <span className="text-sm font-medium text-ink-700">Available in billing</span>
        <Switch checked={data.isAvailable} onChange={(v) => set('isAvailable', v)} label="Available" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save Item'}</button>
      </div>
    </form>
  );
}

export default function Menu() {
  const items = useMenuItems();
  const [modalMode, setModalMode] = useState(null); // 'add' | item-to-edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const handleSave = async (data) => {
    if (modalMode === 'add') await menuService.createMenuItem(data);
    else await menuService.updateMenuItem(modalMode.id, data);
    toast.success(modalMode === 'add' ? 'Item added to menu.' : 'Item updated.');
    setModalMode(null);
  };

  const handleDelete = async () => {
    setDeleteBusy(true);
    try {
      await menuService.deleteMenuItem(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" removed from menu.`);
      setDeleteTarget(null);
    } catch { toast.error('Could not delete item.'); }
    finally { setDeleteBusy(false); }
  };

  const handleToggleAvail = async (item) => {
    try {
      await menuService.setAvailability(item.id, !item.isAvailable);
      toast.success(item.isAvailable ? `${item.name} marked unavailable.` : `${item.name} is now available.`);
    } catch { toast.error('Could not update availability.'); }
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const rows = (items ?? []).filter((m) => m.category === cat);
    if (rows.length) acc[cat] = rows;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Food Items"
        subtitle={`${(items ?? []).length} items across ${Object.keys(grouped).length} categories`}
        actions={
          <button className="btn-primary" onClick={() => setModalMode('add')}>
            <Plus size={16} /> Add Food Item
          </button>
        }
      />

      {/* Table */}
      {Object.entries(grouped).map(([cat, rows]) => (
        <div key={cat} className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">{cat}</h2>
          <div className="card overflow-hidden">
            <table className="min-w-full">
              <thead className="border-b border-ink-100 bg-ink-50">
                <tr>
                  {['Food Name', 'Price', 'GST', 'Availability', ''].map((h) => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rows.map((item) => (
                  <tr key={item.id} className={cn('transition-colors hover:bg-ink-50/50', !item.isAvailable && 'opacity-60')}>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <DietMark isVeg={item.isVeg} />
                        <span className="font-medium text-ink-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="table-td num font-semibold">{formatCurrency(item.price)}</td>
                    <td className="table-td text-ink-600">{item.gstRate}%</td>
                    <td className="table-td">
                      <Switch
                        checked={item.isAvailable}
                        onChange={() => handleToggleAvail(item)}
                        label={`${item.name} availability`}
                        size="sm"
                      />
                    </td>
                    <td className="table-td">
                      <div className="flex gap-1">
                        <button type="button" className="icon-btn" title="Edit" onClick={() => setModalMode(item)}>
                          <Edit2 size={14} />
                        </button>
                        <button type="button" className="icon-btn text-red-400 hover:bg-red-50 hover:text-red-700" title="Delete" onClick={() => setDeleteTarget(item)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {!items?.length && (
        <EmptyState icon={Plus} title="No menu items yet" description="Add your first food item." action={<button className="btn-primary" onClick={() => setModalMode('add')}><Plus size={15} />Add Item</button>} />
      )}

      {/* Add / Edit modal */}
      <Modal
        open={!!modalMode}
        onClose={() => setModalMode(null)}
        title={modalMode === 'add' ? 'Add Food Item' : `Edit — ${modalMode?.name}`}
        size="md"
        hideClose
      >
        {modalMode && (
          <ItemForm
            initial={modalMode === 'add' ? BLANK : modalMode}
            onSave={handleSave}
            onCancel={() => setModalMode(null)}
          />
        )}
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Menu Item"
        message={`Remove "${deleteTarget?.name}" from the menu? Past bills that include this item will not be affected.`}
        confirmLabel="Remove"
        danger
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
