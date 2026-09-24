/**
 * Laporan penjualan admin — filter, ringkasan, grafik, tabel, cetak PDF.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api";
import { useAdminGuard } from "../../hooks";
import LoadingBlock from "../../components/admin/LoadingBlock";
import StatCard from "../../components/admin/StatCard";
import { BarChart, DonutChart, HBarChart } from "../../components/admin/SimpleCharts";
import { formatRupiah, formatTanggal, mediaUrl } from "../../utils";

function bulanLabel(ym) {
  if (!ym) return "-";
  const [y, m] = String(ym).split("-");
  const nama = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  return `${nama[Number(m)] || m} ${y}`;
}

export default function AdminLaporanPage() {
  const { handleError } = useAdminGuard();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    adminApi
      .getLaporan({ from: from || undefined, to: to || undefined })
      .then((r) => setData(r.data))
      .catch((err) => {
        if (!handleError(err)) setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [from, to, handleError]);

  useEffect(() => {
    load();
  }, [load]);

  function onFilter(e) {
    e.preventDefault();
    load();
  }

  function resetFilter() {
    setFrom("");
    setTo("");
  }

  function handleCetakPdf() {
    window.print();
  }

  const chartBulan = useMemo(() => {
    const rows = [...(data?.per_bulan || [])].reverse();
    return rows.map((r) => ({
      label: bulanLabel(r.bulan).split(" ")[0],
      value: Number(r.pendapatan) || 0,
    }));
  }, [data]);

  const chartStatus = useMemo(
    () =>
      (data?.by_status || []).map((r) => ({
        label: r.status || "-",
        value: Number(r.total) || 0,
      })),
    [data]
  );

  const chartProduk = useMemo(
    () =>
      (data?.top_produk || []).map((p) => ({
        label: p.nama_produk,
        value: Number(p.omzet) || 0,
      })),
    [data]
  );

  if (loading && !data) return <LoadingBlock />;
  if (error && !data) return <div className="alert alert-danger">{error}</div>;
  if (!data) return null;

  const periodeText =
    from || to
      ? `${from ? formatTanggal(from) : "awal"} – ${to ? formatTanggal(to) : "sekarang"}`
      : "Semua waktu";

  const stats = [
    { label: "Total transaksi", value: data.total_transaksi, tone: "dark" },
    {
      label: "Pendapatan (selesai)",
      value: formatRupiah(data.total_pendapatan),
      tone: "gold",
    },
    {
      label: "Sudah dibayar",
      value: formatRupiah(data.pendapatan_dibayar),
      tone: "default",
    },
  ];

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 no-print">
        <div>
          <h1 className="admin-section-title mb-1">Laporan Penjualan</h1>
          <p className="text-secondary small mb-0">
            Ringkasan transaksi, status, produk terlaris, dan omzet per bulan.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-dark rounded-0"
          onClick={handleCetakPdf}
          disabled={loading}
        >
          Cetak PDF
        </button>
      </div>

      <div className="print-only print-header mb-3">
        <h1>Laporan Penjualan</h1>
        <p>Periode: {periodeText}</p>
      </div>

      <form
        className="admin-panel mb-4 no-print"
        onSubmit={onFilter}
        style={{ padding: "16px 18px" }}
      >
        <div className="row g-2 align-items-end">
          <div className="col-sm-4 col-md-3">
            <label className="form-label small mb-1">Dari tanggal</label>
            <input
              type="date"
              className="form-control form-control-sm rounded-0"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="col-sm-4 col-md-3">
            <label className="form-label small mb-1">Sampai tanggal</label>
            <input
              type="date"
              className="form-control form-control-sm rounded-0"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="col-sm-4 col-md-auto d-flex gap-2">
            <button type="submit" className="btn btn-sm btn-dark rounded-0">
              Terapkan
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-0"
              onClick={resetFilter}
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {loading && <p className="text-secondary small no-print">Memuat ulang...</p>}

      <div className="admin-stats-grid mb-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Grafik */}
      <div className="row g-3 mb-4">
        <div className="col-lg-7">
          <div className="admin-panel h-100">
            <h2 className="admin-section-title mb-1">Grafik omzet per bulan</h2>
            <p className="text-secondary small mb-3">
              Pendapatan pesanan status Selesai.
            </p>
            <BarChart data={chartBulan} height={220} />
          </div>
        </div>
        <div className="col-lg-5">
          <div className="admin-panel h-100">
            <h2 className="admin-section-title mb-1">Grafik status pesanan</h2>
            <p className="text-secondary small mb-3">Proporsi status.</p>
            <DonutChart data={chartStatus} size={150} />
          </div>
        </div>
      </div>

      <div className="admin-panel mb-4">
        <h2 className="admin-section-title mb-1">Grafik produk terlaris</h2>
        <p className="text-secondary small mb-3">Berdasarkan omzet.</p>
        <HBarChart data={chartProduk} />
      </div>

      {/* Tabel */}
      <div className="row g-3">
        <div className="col-lg-5">
          <div className="admin-panel h-100">
            <h2 className="admin-section-title mb-3">Status pesanan</h2>
            {(data.by_status || []).length === 0 ? (
              <p className="text-secondary mb-0">Tidak ada data di periode ini.</p>
            ) : (
              <div className="table-responsive">
                <table className="table admin-table mb-0">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th className="text-end">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.by_status.map((row) => (
                      <tr key={row.status}>
                        <td>
                          <span className="admin-badge">{row.status}</span>
                        </td>
                        <td className="text-end fw-semibold">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-7">
          <div className="admin-panel h-100">
            <h2 className="admin-section-title mb-3">Omzet per bulan</h2>
            {(data.per_bulan || []).length === 0 ? (
              <p className="text-secondary mb-0">Belum ada data bulanan.</p>
            ) : (
              <div className="table-responsive">
                <table className="table admin-table mb-0">
                  <thead>
                    <tr>
                      <th>Bulan</th>
                      <th className="text-end">Transaksi</th>
                      <th className="text-end">Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.per_bulan.map((row) => (
                      <tr key={row.bulan}>
                        <td>{bulanLabel(row.bulan)}</td>
                        <td className="text-end">{row.total_transaksi}</td>
                        <td className="text-end">{formatRupiah(row.pendapatan)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="admin-panel mt-4">
        <h2 className="admin-section-title mb-3">Produk terlaris</h2>
        {(data.top_produk || []).length === 0 ? (
          <p className="text-secondary mb-0">Belum ada penjualan di periode ini.</p>
        ) : (
          <div className="table-responsive">
            <table className="table admin-table mb-0">
              <thead>
                <tr>
                  <th className="no-print" style={{ width: 56 }}></th>
                  <th>Produk</th>
                  <th className="text-end">Harga</th>
                  <th className="text-end">Terjual</th>
                  <th className="text-end">Omzet</th>
                </tr>
              </thead>
              <tbody>
                {data.top_produk.map((p) => (
                  <tr key={p.id_produk}>
                    <td className="no-print">
                      {p.gambar ? (
                        <img
                          src={mediaUrl(p.gambar)}
                          alt=""
                          width={40}
                          height={40}
                          style={{ objectFit: "cover", borderRadius: 4 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            background: "#eee",
                            borderRadius: 4,
                          }}
                        />
                      )}
                    </td>
                    <td>{p.nama_produk}</td>
                    <td className="text-end">{formatRupiah(p.harga)}</td>
                    <td className="text-end fw-semibold">{p.terjual}</td>
                    <td className="text-end">{formatRupiah(p.omzet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-secondary small mt-3 mb-0">Periode: {periodeText}</p>
    </div>
  );
}