/**
 * [buatan] Dashboard ringkasan admin.
 * URL: `/admin` — statistik dari adminApi.getStats, StatCard.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import { useAdminGuard } from '../../hooks';
import StatCard from '../../components/admin/StatCard';
import LoadingBlock from '../../components/admin/LoadingBlock';
import { formatRupiah, formatTanggal } from '../../utils';

export default function AdminOverviewPage() {
  const { handleError } = useAdminGuard();
  const [data, setData] = useState(null); // payload GET /api/admin/stats
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    adminApi
      .getStats()
      .then((r) => {
        if (alive) setData(r.data);
      })
      .catch((err) => {
        if (!alive) return;
        if (!handleError(err)) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [handleError]);

  if (loading) return <LoadingBlock />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return null;

  // Konfigurasi kartu StatCard — label, nilai, warna tone
  const stats = [
    { label: 'Pembeli terdaftar', value: data.jumlah_pembeli, tone: 'gold' },
    { label: 'Total transaksi', value: data.jumlah_transaksi, tone: 'dark' },
    { label: 'Produk di katalog', value: data.jumlah_produk, tone: 'default' },
    { label: 'Produk terjual', value: data.produk_terjual, hint: 'Jumlah pesanan', tone: 'gold' },
    { label: 'Artikel', value: data.jumlah_artikel, tone: 'default' },
    { label: 'Pesanan aktif', value: data.pesanan_aktif, tone: 'warn' },
    { label: 'Belum dibayar', value: data.belum_dibayar, tone: 'warn' },
  ];

  return (
    <div>
      <div className="admin-stats-grid">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="admin-panel mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="admin-section-title mb-0">Pendapatan (dibayar)</h2>
          <span className="admin-revenue">{formatRupiah(data.total_pendapatan)}</span>
        </div>
        <p className="text-secondary small mb-0">
          Total dari pesanan dengan status pembayaran &quot;Dibayar&quot;.
        </p>
      </div>

      <div className="admin-panel mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="admin-section-title mb-0">Transaksi terbaru</h2>
          <Link to="/admin/pembelian" className="btn btn-sm btn-outline-dark rounded-0">
            Lihat semua
          </Link>
        </div>
        {(data.transaksi_terbaru || []).length === 0 ? (
          <p className="text-secondary mb-0">Belum ada pesanan.</p>
        ) : (
          <div className="table-responsive">
            <table className="table admin-table mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pembeli</th>
                  <th>Produk</th>
                  <th>Status</th>
                  <th>Bayar</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {data.transaksi_terbaru.map((row) => (
                  <tr key={row.id}>
                    <td>#{row.id}</td>
                    <td>{row.nama_pembeli}</td>
                    <td>{row.nama_produk}</td>
                    <td>
                      <span className="admin-badge">{row.status}</span>
                    </td>
                    <td>{row.pembayaran}</td>
                    <td className="text-nowrap">{formatTanggal(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-quick-links mt-4">
        <Link to="/admin/produk" className="admin-quick-link">
          + Tambah produk
        </Link>
        <Link to="/admin/artikel" className="admin-quick-link">
          + Tulis artikel
        </Link>
        <Link to="/admin/pembeli" className="admin-quick-link">
          Kelola pembeli
        </Link>
      </div>
    </div>
  );
}
