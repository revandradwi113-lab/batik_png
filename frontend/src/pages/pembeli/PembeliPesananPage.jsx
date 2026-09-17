import { useState } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../../hooks";
import { formatHarga, formatTanggal } from "../../utils";
import { getImageUrl } from "../../constants";

export default function PembeliPesananPage() {
  const { data: pesanan, loading, error } = useFetch("/users/pembelian");
  const daftarPesanan = pesanan || [];
  const [expandedId, setExpandedId] = useState(null);

  function toggle(id) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <div className="container-fluid">
      <h2 className="fs-3 mb-3">Pesanan Saya</h2>

      {loading && <p className="text-muted">Memuat pesanan...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && daftarPesanan.length === 0 && (
        <p className="text-muted">
          Belum ada pesanan.{" "}
          <Link to="/akun/belanja">Mulai belanja</Link>
        </p>
      )}

      <div className="d-flex flex-column gap-3">
        {daftarPesanan.map((p) => {
          const qty = Math.max(1, Number(p.jumlah) || 1);
          const subtotal = Number(p.harga || 0) * qty;
          return (
            <div key={p.id} className="fg-card p-3">
              <button
                type="button"
                className="btn btn-link text-decoration-none p-0 w-100 text-start d-flex align-items-center gap-3"
                onClick={() => toggle(p.id)}
              >
                <div
                  className="fg-card-thumb"
                  style={{
                    width: "72px",
                    height: "72px",
                    flexShrink: 0,
                    borderRadius: "10px",
                  }}
                >
                  {p.gambar ? (
                    <img
                      src={getImageUrl(p.gambar)}
                      alt={p.nama_produk}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "0.65rem" }}>{p.nama_produk}</span>
                  )}
                </div>

                <div className="flex-grow-1">
                  <div className="fg-card-title mb-1">{p.nama_produk}</div>
                  <div className="small text-muted">
                    {formatTanggal(p.created_at)}
                    {qty > 1 ? ` · ${qty} pcs` : ""}
                  </div>
                </div>

                <div className="text-end">
                  <div className="fg-card-harga">{formatHarga(subtotal)}</div>
                  {qty > 1 && (
                    <div className="small text-muted">
                      {formatHarga(p.harga)} × {qty}
                    </div>
                  )}
                  <span className="badge bg-secondary mt-1">{p.status}</span>
                </div>

                <i
                  className={`bi ${
                    expandedId === p.id ? "bi-chevron-up" : "bi-chevron-down"
                  } text-muted`}
                ></i>
              </button>

              {expandedId === p.id && (
                <>
                  <hr />
                  <dl className="row mb-0 small">
                    <dt className="col-5 text-muted">Jumlah</dt>
                    <dd className="col-7">{qty} pcs</dd>

                    <dt className="col-5 text-muted">Harga satuan</dt>
                    <dd className="col-7">{formatHarga(p.harga)}</dd>

                    <dt className="col-5 text-muted">Subtotal</dt>
                    <dd className="col-7">{formatHarga(subtotal)}</dd>

                    <dt className="col-5 text-muted">Metode Pembayaran</dt>
                    <dd className="col-7">{p.metode_pembayaran}</dd>

                    <dt className="col-5 text-muted">Status Pembayaran</dt>
                    <dd className="col-7">{p.pembayaran}</dd>

                    <dt className="col-5 text-muted">Kurir</dt>
                    <dd className="col-7">{p.pengiriman}</dd>

                    <dt className="col-5 text-muted">Nama Penerima</dt>
                    <dd className="col-7">{p.nama_pembeli || "-"}</dd>

                    <dt className="col-5 text-muted">Alamat</dt>
                    <dd className="col-7">{p.alamat_pembeli || "-"}</dd>

                    <dt className="col-5 text-muted">No. HP</dt>
                    <dd className="col-7">{p.phone_pembeli || "-"}</dd>

                    <dt className="col-5 text-muted">Catatan</dt>
                    <dd className="col-7">{p.catatan || "-"}</dd>
                  </dl>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
