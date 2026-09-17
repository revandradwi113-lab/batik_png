import { Link } from "react-router-dom";
import { useFetch } from "../../hooks";
import { formatRupiah, formatTanggal, mediaUrl } from "../../utils";

export default function PembeliOverviewPage() {
  const { data, loading, error } = useFetch("/users/dashboard");

  const statusCounts = data?.statusCounts || [];
  const recentOrders = data?.recentOrders || [];

  function totalUntuk(status) {
    const found = statusCounts.find((s) => s.status === status);
    return found ? Number(found.total) : 0;
  }

  const totalPesanan = statusCounts.reduce(
    (sum, s) => sum + Number(s.total || 0),
    0
  );
  const pesananAktif =
    totalUntuk("Tertunda") + totalUntuk("Dikemas") + totalUntuk("Dikirim");

  const belumDibayar =
    data?.belum_dibayar != null
      ? Number(data.belum_dibayar)
      : 0;

  const totalBelanja =
    data?.total_belanja_dibayar != null
      ? Number(data.total_belanja_dibayar)
      : 0;

  return (
    <div className="pb-dash">
      <h1 className="pb-dash-title">Dashboard</h1>

      {loading && <p className="text-muted">Memuat…</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <>
          <div className="pb-stat-row">
            <div className="pb-stat pb-stat--dark">
              <span className="pb-stat-label">TOTAL PESANAN</span>
              <strong className="pb-stat-value">{totalPesanan}</strong>
            </div>
            <div className="pb-stat pb-stat--red">
              <span className="pb-stat-label">PESANAN AKTIF</span>
              <strong className="pb-stat-value">{pesananAktif}</strong>
            </div>
            <div className="pb-stat pb-stat--gold">
              <span className="pb-stat-label">BELUM DIBAYAR</span>
              <strong className="pb-stat-value">{belumDibayar}</strong>
            </div>
          </div>

          <div className="pb-panel pb-panel-spend">
            <div>
              <h2 className="pb-panel-title">Total belanja (sudah dibayar)</h2>
              <p className="pb-panel-desc">
                Akumulasi harga produk pada pesanan berstatus pembayaran
                &quot;Dibayar&quot;.
              </p>
            </div>
            <span className="pb-spend-amount">{formatRupiah(totalBelanja)}</span>
          </div>

          <div className="pb-panel">
            <div className="pb-panel-head">
              <h2 className="pb-panel-title mb-0">Pesanan terbaru</h2>
              <Link to="/akun/pesanan" className="pb-btn-outline">
                Lihat semua
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="pb-empty-text">
                Belum ada pesanan.{" "}
                <Link to="/akun/belanja">Mulai belanja</Link>
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table pb-table mb-0">
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Status</th>
                      <th>Bayar</th>
                      <th>Tanggal</th>
                      <th className="text-end">Harga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <div className="pb-order-cell">
                            {o.gambar ? (
                              <img src={mediaUrl(o.gambar)} alt="" />
                            ) : null}
                            <span>
                              {o.nama_produk}
                              {(Number(o.jumlah) || 1) > 1 ? ` × ${o.jumlah}` : ''}
                            </span>
                          </div>
                        </td>
                        <td>{o.status}</td>
                        <td>{o.pembayaran || "-"}</td>
                        <td className="text-nowrap">
                          {formatTanggal(o.created_at)}
                        </td>
                        <td className="text-end">
                          {formatRupiah((Number(o.harga) || 0) * (Number(o.jumlah) || 1))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pb-quick">
            <Link to="/akun/belanja" className="pb-quick-btn">
              Belanja produk
            </Link>
            <Link to="/akun/pesanan" className="pb-quick-btn">
              Riwayat pesanan
            </Link>
            <Link to="/akun/profil" className="pb-quick-btn">
              Edit profil
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
