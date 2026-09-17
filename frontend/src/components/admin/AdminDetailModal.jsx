/**
 * [buatan] Modal lebar hanya-baca untuk melihat detail satu baris tabel.
 *
 * Membungkus AdminModal dengan tombol Tutup.
 */
import AdminModal from './AdminModal';

/** Modal detail read-only — membungkus AdminModal wide + tombol Tutup. */
export default function AdminDetailModal({ show, title, onClose, children }) {
  return (
    <AdminModal show={show} title={title} onClose={onClose} wide>
      <div className="admin-detail-body">{children}</div>
      <button type="button" className="btn btn-outline-dark rounded-0 w-100 mt-3" onClick={onClose}>
        Tutup
      </button>
    </AdminModal>
  );
}
