/**
 * [buatan] Indikator loading standar halaman admin.
 *
 * Spinner + teks; dipakai saat useAdminList masih memuat.
 */
/** Props: text — pesan di bawah spinner (default: Memuat data…). */
export default function LoadingBlock({ text = 'Memuat data…' }) {
  return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      <p>{text}</p>
    </div>
  );
}
