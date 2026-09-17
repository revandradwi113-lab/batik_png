/**
 * [buatan] Tombol aksi baris tabel admin: Detail, Ubah, Hapus.
 *
 * Dipakai halaman kelola produk, pembeli, pesanan, artikel.
 */
/** Props: onDetail, onEdit, onDelete — callback per baris tabel admin. */
export default function AdminRowActions({ onDetail, onEdit, onDelete }) {
  return (
    <div className="admin-row-actions">
      <button type="button" className="btn btn-sm btn-outline-secondary rounded-0" onClick={onDetail} title="Lihat detail">
        Detail
      </button>
      <button type="button" className="btn btn-sm btn-outline-dark rounded-0" onClick={onEdit} title="Ubah">
        Ubah
      </button>
      <button type="button" className="btn btn-sm btn-outline-danger rounded-0" onClick={onDelete} title="Hapus">
        Hapus
      </button>
    </div>
  );
}
