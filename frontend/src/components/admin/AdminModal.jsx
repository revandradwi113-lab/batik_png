/**
 * components/admin/AdminModal.jsx — modal dialog generik panel admin.
 *
 * Backdrop klik menutup; opsi lebar (`wide`) untuk form panjang.
 * Props: show, title, onClose, children, wide (opsional).
 */
export default function AdminModal({ show, title, onClose, children, wide }) {
  if (!show) return null;

  return (
    <div className="admin-modal-root" role="dialog" aria-modal="true">
      {/* Klik area gelap di luar kotak → tutup modal */}
      <div className="admin-modal-backdrop" onClick={onClose} />
      <div className={`admin-modal ${wide ? 'admin-modal--wide' : ''}`}>
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  );
}
