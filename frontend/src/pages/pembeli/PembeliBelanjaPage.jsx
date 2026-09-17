import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useFetch } from "../../hooks";
import { api } from "../../api";
import { formatHarga } from "../../utils";
import {
  KATEGORI_PRODUK,
  METODE_BAYAR,
  SHIPPING,
  SITE,
  getImageUrl,
} from "../../constants";

const KATEGORI = ["Semua", ...KATEGORI_PRODUK];

const initialForm = {
  nama_pembeli: "",
  alamat_pembeli: "",
  phone_pembeli: "",
  metode_pembayaran: METODE_BAYAR[0],
  pengiriman: SHIPPING[0],
  catatan: "",
};

// Halaman belanja: pilih produk dari katalog, lalu isi form pesanan
export default function PembeliBelanjaPage() {
  const { data: produk, loading, error } = useFetch("/users/produk");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [q, setQ] = useState("");
  const [produkDipilih, setProdukDipilih] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [sukses, setSukses] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const daftarProduk = produk || [];

  const keyword = q.trim().toLowerCase();
  const produkTampil = daftarProduk.filter((p) => {
    const matchKat = kategoriAktif === "Semua" || p.kategori === kategoriAktif;
    if (!matchKat) return false;
    if (!keyword) return true;
    const hay = `${p.nama_produk || ""} ${p.deskripsi || ""} ${p.kategori || ""}`.toLowerCase();
    return hay.includes(keyword);
  });

  // Kalau datang dari tombol "Beli produk ini" (?produk=ID),
  // langsung buka panel pesan untuk produk tersebut.
  useEffect(() => {
    const idDariUrl = searchParams.get("produk");

    if (idDariUrl && daftarProduk.length > 0 && !produkDipilih) {
      const target = daftarProduk.find(
        (p) => String(p.id_produk) === idDariUrl
      );

      if (target) {
        pilihProduk(target);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daftarProduk.length]);

  function pilihProduk(p) {
    setProdukDipilih(p);
    setForm(initialForm);
    setFormError("");
    setSukses("");
    // scroll ke form transaksi di atas
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function batalPilih() {
    setProdukDipilih(null);
    setSearchParams({});
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function validateCheckout(f) {
    if (!f.nama_pembeli?.trim() || f.nama_pembeli.trim().length < 3) {
      return "Nama penerima minimal 3 karakter";
    }
    if (!f.alamat_pembeli?.trim() || f.alamat_pembeli.trim().length < 10) {
      return "Alamat minimal 10 karakter";
    }
    const phone = String(f.phone_pembeli || "").replace(/\D/g, "");
    if (!phone || phone.length < 10 || phone.length > 15) {
      return "Nomor telepon harus 10–15 digit";
    }
    if (!METODE_BAYAR.includes(f.metode_pembayaran)) {
      return "Pilih metode pembayaran";
    }
    if (!SHIPPING.includes(f.pengiriman)) {
      return "Pilih kurir pengiriman";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const v = validateCheckout(form);
    if (v) {
      setFormError(v);
      return;
    }
    setSubmitting(true);

    try {
      await api.post("/users/pembelian", {
        id_produk: produkDipilih.id_produk,
        ...form,
      });

      setSukses("Pesanan berhasil dibuat, mengarahkan ke Pesanan Saya...");

      setProdukDipilih(null);
      setSearchParams({});

      setTimeout(() => navigate("/akun/pesanan"), 900);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-fluid">
      <h2 className="fs-3">Belanja</h2>

      {sukses && (
        <div className="alert alert-success py-2">{sukses}</div>
      )}

      {/* Form transaksi di ATAS daftar produk */}
      {produkDipilih && (
        <div className="fg-form-card mb-4" style={{ maxWidth: "720px" }}>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="fg-card-thumb"
                style={{
                  width: "64px",
                  height: "64px",
                  flexShrink: 0,
                  borderRadius: "10px",
                }}
              >
                {produkDipilih.gambar ? (
                  <img
                    src={getImageUrl(produkDipilih.gambar)}
                    alt={produkDipilih.nama_produk}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "0.6rem" }}>
                    {produkDipilih.nama_produk}
                  </span>
                )}
              </div>

              <div>
                <div className="small text-muted mb-0">Pesan produk</div>
                <div className="fg-card-title mb-1">
                  {produkDipilih.nama_produk}
                </div>
                <div className="fg-card-harga">
                  {formatHarga(produkDipilih.harga)}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-close"
              aria-label="Batal"
              onClick={batalPilih}
            ></button>
          </div>

          {formError && (
            <div className="alert alert-danger py-2">{formError}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nama Penerima</label>
              <input
                type="text"
                name="nama_pembeli"
                className="form-control"
                value={form.nama_pembeli}
                onChange={handleChange}
                placeholder="Nama lengkap penerima"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Alamat Pengiriman</label>
              <textarea
                name="alamat_pembeli"
                className="form-control"
                rows="2"
                value={form.alamat_pembeli}
                onChange={handleChange}
                placeholder="Jalan, RT/RW, Desa, Kecamatan, Kabupaten"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">No. HP Penerima</label>
              <input
                type="tel"
                name="phone_pembeli"
                className="form-control"
                value={form.phone_pembeli}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Metode Pembayaran</label>
                <select
                  name="metode_pembayaran"
                  className="form-select"
                  value={form.metode_pembayaran}
                  onChange={handleChange}
                >
                  {METODE_BAYAR.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                {form.metode_pembayaran === "Bank Transfer" && (
                  <div className="alert alert-info mt-2 mb-0 py-2 small">
                    <div className="fw-semibold mb-1">
                      Transfer ke rekening toko:
                    </div>
                    <div>
                      {SITE.nama_bank_a}:{" "}
                      <strong>{SITE.no_rek_a}</strong>
                    </div>
                    <div>
                      {SITE.nama_bank_b}:{" "}
                      <strong>{SITE.no_rek_b}</strong>
                    </div>
                    <div className="mt-1">
                      Atas nama: <strong>{SITE.nama_toko}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">Kurir</label>
                <select
                  name="pengiriman"
                  className="form-select"
                  value={form.pengiriman}
                  onChange={handleChange}
                >
                  {SHIPPING.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3 mt-3">
              <label className="form-label">Catatan (opsional)</label>
              <textarea
                name="catatan"
                className="form-control"
                rows="2"
                value={form.catatan}
                onChange={handleChange}
                placeholder="Contoh: warna motif, ukuran, dll."
              />
            </div>

            <button
              type="submit"
              className="btn btn-fg-primary w-100 mt-2"
              disabled={submitting}
            >
              {submitting ? "Memproses..." : "Buat Pesanan"}
            </button>
          </form>
        </div>
      )}

      <div className="mb-3" style={{ maxWidth: 360 }}>
        <label className="form-label small text-muted mb-1">
          Pencarian produk
        </label>
        <input
          type="search"
          className="form-control"
          placeholder="Cari nama / motif..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="fg-kategori-tabs fg-kategori-tabs--light mb-4">
        {KATEGORI.map((k) => (
          <button
            key={k}
            type="button"
            className={`fg-kategori-pill fg-kategori-pill--light ${
              kategoriAktif === k ? "active" : ""
            }`}
            onClick={() => setKategoriAktif(k)}
          >
            {k}
          </button>
        ))}
      </div>

      {loading && <p className="text-muted">Memuat produk...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && produkTampil.length === 0 && (
        <p className="text-muted">Belum ada produk di kategori ini.</p>
      )}

      <div className="row g-4">
        {produkTampil.map((p) => (
          <div className="col-6 col-md-4 col-lg-3" key={p.id_produk}>
            <div
              className={`fg-card h-100 ${
                produkDipilih?.id_produk === p.id_produk
                  ? "fg-card--selected"
                  : ""
              }`}
            >
              <div className="fg-card-thumb">
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
                  <span>{p.nama_produk}</span>
                )}
              </div>

              <div className="fg-card-body">
                <span className="fg-card-kategori">{p.kategori}</span>
                <div className="fg-card-title">{p.nama_produk}</div>
                <div className="fg-card-harga">{formatHarga(p.harga)}</div>
                <button
                  type="button"
                  className="btn btn-fg-primary btn-sm w-100 mt-2"
                  onClick={() => pilihProduk(p)}
                >
                  Pesan
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
