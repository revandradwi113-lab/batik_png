import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PublicPage from "../components/layout/PublicPage";
import { useFetch } from "../hooks";
import { formatHarga } from "../utils";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../constants";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data: produk, loading, error } = useFetch(`/users/produk/${id}`, [id]);
  const { isLoggedIn, role } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState("");

  const canUseCart = isLoggedIn && role === "pembeli";
  const stok = Number(produk?.stok ?? 0);
  const habis = stok <= 0;

  function handleAddCart() {
    if (!produk) return;
    if (!canUseCart) {
      navigate("/login", { state: { from: { pathname: `/produk/${id}` } } });
      return;
    }
    if (habis) {
      setToast("Stok produk ini habis");
      setTimeout(() => setToast(""), 2500);
      return;
    }
    const jumlah = Math.min(qty, stok);
    addItem(produk, jumlah);
    setToast(`${jumlah} item ditambahkan ke keranjang`);
    setTimeout(() => setToast(""), 2500);
  }

  return (
    <PublicPage>
      {loading && <div className="container py-5 text-muted">Memuat produk...</div>}
      {error && <div className="container py-5 text-danger">{error}</div>}

      {produk && (
        <div className="container py-5">
          <Link to="/toko" className="small text-decoration-none text-muted">
            ← Kembali ke toko
          </Link>

          <div className="row g-4 g-lg-5 mt-1">
            <div className="col-md-5">
              <div className="fg-product-gallery">
                {produk.gambar ? (
                  <img
                    src={getImageUrl(produk.gambar)}
                    alt={produk.nama_produk}
                    className="fg-product-img"
                    style={{ opacity: habis ? 0.55 : 1 }}
                  />
                ) : (
                  <div className="fg-product-placeholder">{produk.nama_produk}</div>
                )}
              </div>
            </div>

            <div className="col-md-7">
              <span className="fg-card-kategori">{produk.kategori}</span>
              <h1 className="fg-display mt-2" style={{ fontSize: "1.85rem" }}>
                {produk.nama_produk}
              </h1>
              <p className="fg-card-harga fs-3 mt-2 mb-1">{formatHarga(produk.harga)}</p>
              <p
                className="small mb-3"
                style={{ color: habis ? "#c0392b" : "#6b5e52" }}
              >
                {habis ? "Stok habis" : `Stok tersedia: ${stok}`}
              </p>
              <p className="text-secondary" style={{ lineHeight: 1.85 }}>
                {produk.deskripsi}
              </p>

              <div className="fg-product-actions mt-4">
                <div className="d-flex flex-wrap align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <label className="small text-muted mb-0">Jumlah</label>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, stok)}
                      className="form-control form-control-sm fg-qty-input"
                      value={qty}
                      disabled={habis}
                      onChange={(e) => {
                        const v = Math.max(1, Number(e.target.value) || 1);
                        setQty(stok > 0 ? Math.min(v, stok) : 1);
                      }}
                    />
                  </div>

                  {canUseCart ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-fg-primary"
                        onClick={handleAddCart}
                        disabled={habis}
                      >
                        {habis ? "Stok habis" : "+ Keranjang"}
                      </button>
                      {!habis && (
                        <Link
                          to={`/akun/belanja?produk=${produk.id_produk}`}
                          className="btn btn-fg-outline"
                        >
                          Beli langsung
                        </Link>
                      )}
                      <Link to="/akun/keranjang" className="btn btn-link text-decoration-none">
                        Lihat keranjang →
                      </Link>
                    </>
                  ) : (
                    <div className="fg-login-prompt">
                      <Link to="/login" className="btn btn-fg-primary">
                        Masuk untuk belanja
                      </Link>
                      <Link to="/daftar" className="btn btn-fg-outline">
                        Daftar akun
                      </Link>
                      <span className="small text-muted ms-1">
                        Keranjang hanya untuk member terdaftar
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {toast && (
                <div className="alert alert-success py-2 px-3 mt-3 mb-0 d-inline-block">
                  {toast}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PublicPage>
  );
}