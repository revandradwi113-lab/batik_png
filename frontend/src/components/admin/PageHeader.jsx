/**
 * [buatan] Judul bagian + slot tombol aksi di halaman admin.
 *
 * Misalnya tombol "Tambah" di kanan judul tabel.
 * Props: title, subtitle (opsional), action (node React — tombol kanan).
 */
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="admin-page-header">
      <div>
        {title && <h2 className="admin-section-title">{title}</h2>}
        {subtitle && <p className="text-secondary small mb-0">{subtitle}</p>}
      </div>
      {action && <div className="admin-page-header-action">{action}</div>}
    </div>
  );
}
