import { useMemo, useState } from "react";
import PublicPage from "../components/layout/PublicPage";
import { KATEGORI_PRODUK } from "../constants";
import { useFetch } from "../hooks";
import ProdukCard from "../components/home/ProdukCard";

const KATEGORI = ["Semua", ...KATEGORI_PRODUK];

export default function TokoPage() {
  const { data: produk, loading, error } = useFetch("/users/produk");
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [q, setQ] = useState("");

  const daftarProduk = produk || [];

  const produkTampil = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return daftarProduk.filter((p) => {
      const matchKategori =
        kategoriAktif === "Semua" || p.kategori === kategoriAktif;
      if (!matchKategori) return false;
      if (!keyword) return true;
      const hay = `${p.nama_produk || ""} ${p.deskripsi || ""} ${p.kategori || ""}`.toLowerCase();
      return hay.includes(keyword);
    });
  }, [daftarProduk, kategoriAktif, q]);

  return (
    <PublicPage>
      <div className="container py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
          <div>
            <h2 className="fs-2 mb-1">Toko</h2>
          </div>
          <div style={{ minWidth: 260, maxWidth: 360, width: "100%" }}>
            <label className="form-label small text-muted mb-1">
              Pencarian produk
            </label>
            <input
              type="search"
              className="form-control"
              placeholder="Cari nama, motif, atau deskripsi..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Pencarian produk"
            />
          </div>
        </div>

        <div className="fg-kategori-tabs fg-kategori-tabs--light mb-4">
          {KATEGORI.map((k) => (
            <button
              key={k}
              type="button"
              className={`fg-kategori-pill fg-kategori-pill--light ${kategoriAktif === k ? "active" : ""}`}
              onClick={() => setKategoriAktif(k)}
            >
              {k}
            </button>
          ))}
        </div>

        {loading && <p className="text-muted">Memuat produk...</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loading && !error && produkTampil.length === 0 && (
          <p className="text-muted">
            {q.trim()
              ? `Tidak ada produk yang cocok dengan “${q.trim()}”.`
              : "Belum ada produk di kategori ini."}
          </p>
        )}

        <div className="row g-4">
          {produkTampil.map((p) => (
            <div className="col-6 col-md-4 col-lg-3" key={p.id_produk}>
              <ProdukCard produk={p} />
            </div>
          ))}
        </div>
      </div>
    </PublicPage>
  );
}
