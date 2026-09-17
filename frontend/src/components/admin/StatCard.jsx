/**
 * [buatan] Kartu statistik di dashboard admin.
 *
 * Menampilkan angka ringkas dari adminApi.getStats (AdminOverviewPage).
 */
/** Kartu angka dashboard — props: label, value, hint (opsional), tone (warna tema). */
export default function StatCard({ label, value, hint, tone = 'default' }) {
  return (
    <div className={`admin-stat-card admin-stat-card--${tone}`}>
      <p className="admin-stat-label">{label}</p>
      <p className="admin-stat-value">{value}</p>
      {hint && <p className="admin-stat-hint">{hint}</p>}
    </div>
  );
}
