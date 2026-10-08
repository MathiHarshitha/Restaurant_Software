import Modal from './Modal';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = false, busy = false, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={(
        <>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={busy}>{confirmLabel}</button>
        </>
      )}
    >
      <p className="text-sm text-ink-600">{message}</p>
    </Modal>
  );
}
