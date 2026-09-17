/**
 * Halaman Keranjang Belanja + Checkout.
 * Hanya bisa diakses oleh akun pembeli yang sudah login (dilindungi RequireAuth).
 * Fitur: Keranjang Belanja, Checkout, Validasi Form.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { api } from "../api";
import { formatHarga } from "../utils";
import {
  METODE_BAYAR,
  SHIPPING,
  SITE,
  getImageUrl,
} from "../constants";

const initialForm = {
  nama_pembeli: "",
  alamat_pembeli: "",
  phone_pembeli: "",
  metode_pembayaran: METODE_BAYAR[0],
  pengiriman: SHIPPING[0],
  catatan: "",
};

function validateForm(form) {
  const errors = {};
  if (!form.nama_pembeli.trim() || form.nama_pembeli.trim().length < 3) {
    errors.nama_pembeli = "Nama minimal 3 karakter";
  }
  if (!form.alamat_pembeli.trim() || form.alamat_pembeli.trim().length < 10) {
    errors.alamat_pembeli = "Alamat minimal 10 karakter";
  }
  const phone = form.phone_pembeli.replace(/\D/g, "");
  if (!phone || phone.length < 10 || phone.length > 15) {
    errors.phone_pembeli = "Nomor telepon 10–15 digit";
  }
  if (!METODE_BAYAR.includes(form.metode_pembayaran)) {
    errors.metode_pembayaran = "Pilih metode pembayaran";
  }
  if (!SHIPPING.includes(form.pengiriman)) {
    errors.pengiriman = "Pilih kurir pengiriman";
  }
  return errors;
}

export default function CartPage() {
  const { items, totalItems, totalHarga, updateQty, removeItem, clearCart } =
    useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [sukses, setSukses] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleCheckout(e) {
    e.preventDefault();
    setFormError("");
    setSukses("");

    if (items.length === 0) {
      setFormError("Keranjang masih kosong");
      return;
    }

    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError("Periksa kembali data form checkout");
      return;
    }

    setSubmitting(true);
    try {
      for (const item of items) {
        await api.post("/users/pembelian", {
          id_produk: item.id_produk,
          jumlah: item.qty,
          nama_pembeli: form.nama_pembeli.trim(),
          alamat_pembeli: form.alamat_pembeli.trim(),
          phone_pembeli: form.phone_pembeli.trim(),
          metode_pembayaran: form.metode_pembayaran,
          pengiriman: form.pengiriman,
          catatan: form.catatan.trim() || undefined,
        });
      }
      clearCart();
      setSukses("Pesanan berhasil dibuat. Mengarahkan ke Pesanan Saya...");
      setTimeout(() => navigate("/akun/pesanan"), 1200);
    } catch (err) {
      setFormError(err.message || "Gagal membuat pesanan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="container py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-2 mb-4">
          <div>
            <h2 className="fs-2 mb-1">Keranjang Belanja</h2>
            <p className="text-muted mb-0">
              {totalItems > 0
                ? `${totalItems} item · total ${formatHarga(totalHarga)}`
                : "Belum ada produk di keranjang"}
            </p>
          </div>
          {items.length > 0 && (
            <Link to="/toko" className="btn btn-fg-outline btn-sm">
              + Tambah produk
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <div className="fg-empty-cart text-center py-5 px-3">
            <div className="fg-empty-icon mb-3">🛍️</div>
            <h3 className="fs-5 mb-2">Keranjang Anda kosong</h3>
            <p className="text-muted mb-4">
              Jelajahi koleksi batik kami dan temukan motif favorit Anda.
            </p>
            <Link to="/toko" className="btn btn-fg-primary px-4">
              Belanja di Toko
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="fg-cart-list">
                {items.map((item) => (
                  <div key={item.id_produk} className="fg-cart-item">
                    <div className="fg-cart-thumb">
                      {item.gambar ? (
                        <img
                          src={getImageUrl(item.gambar)}
                          alt={item.nama_produk}
                        />
                      ) : (
                        <span className="small text-muted p-2 text-center">
                          {item.nama_produk}
                        </span>
                      )}
                    </div>
                    <div className="fg-cart-info flex-grow-1">
                      <div className="fw-semibold">{item.nama_produk}</div>
                      <div className="small text-muted">{item.kategori}</div>
                      <div className="fg-card-harga mt-1">
                        {formatHarga(item.harga)}
                      </div>
                    </div>
                    <div className="fg-cart-qty">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() =>
                          updateQty(item.id_produk, Math.max(1, item.qty - 1))
                        }
                        aria-label="Kurangi"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        className="form-control form-control-sm text-center fg-qty-input"
                        value={item.qty}
                        onChange={(e) =>
                          updateQty(
                            item.id_produk,
                            Math.max(1, Number(e.target.value) || 1)
                          )
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() =>
                          updateQty(item.id_produk, Math.min(99, item.qty + 1))
                        }
                        aria-label="Tambah"
                      >
                        +
                      </button>
                    </div>
                    <div className="fg-cart-subtotal text-end">
                      <div className="fw-semibold">
                        {formatHarga(item.harga * item.qty)}
                      </div>
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-danger p-0 mt-1"
                        onClick={() => removeItem(item.id_produk)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="d-flex justify-content-end mt-3">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-danger"
                  onClick={clearCart}
                >
                  Kosongkan keranjang
                </button>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="fg-checkout-card">
                <h3 className="fs-5 mb-3">Checkout</h3>
                <div className="fg-checkout-total d-flex justify-content-between align-items-center mb-4">
                  <span className="text-muted">Total bayar</span>
                  <strong className="fg-card-harga fs-4">
                    {formatHarga(totalHarga)}
                  </strong>
                </div>

                <form onSubmit={handleCheckout} noValidate>
                  {formError && (
                    <div className="alert alert-danger py-2 small">{formError}</div>
                  )}
                  {sukses && (
                    <div className="alert alert-success py-2 small">{sukses}</div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Nama penerima</label>
                    <input
                      name="nama_pembeli"
                      className={`form-control ${fieldErrors.nama_pembeli ? "is-invalid" : ""}`}
                      value={form.nama_pembeli}
                      onChange={handleChange}
                      required
                      minLength={3}
                      placeholder="Nama lengkap penerima"
                    />
                    {fieldErrors.nama_pembeli && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.nama_pembeli}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Alamat lengkap</label>
                    <textarea
                      name="alamat_pembeli"
                      className={`form-control ${fieldErrors.alamat_pembeli ? "is-invalid" : ""}`}
                      rows={3}
                      value={form.alamat_pembeli}
                      onChange={handleChange}
                      required
                      minLength={10}
                      placeholder="Jalan, RT/RW, Desa, Kecamatan, Kabupaten"
                    />
                    {fieldErrors.alamat_pembeli && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.alamat_pembeli}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">No. telepon</label>
                    <input
                      name="phone_pembeli"
                      type="tel"
                      className={`form-control ${fieldErrors.phone_pembeli ? "is-invalid" : ""}`}
                      value={form.phone_pembeli}
                      onChange={handleChange}
                      required
                      placeholder="08xxxxxxxxxx"
                    />
                    {fieldErrors.phone_pembeli && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.phone_pembeli}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Metode pembayaran</label>
                    <select
                      name="metode_pembayaran"
                      className="form-select"
                      value={form.metode_pembayaran}
                      onChange={handleChange}
                      required
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

                  <div className="mb-3">
                    <label className="form-label">Kurir pengiriman</label>
                    <select
                      name="pengiriman"
                      className="form-select"
                      value={form.pengiriman}
                      onChange={handleChange}
                      required
                    >
                      {SHIPPING.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Catatan (opsional)</label>
                    <textarea
                      name="catatan"
                      className="form-control"
                      rows={2}
                      value={form.catatan}
                      onChange={handleChange}
                      placeholder="Contoh: warna motif, ukuran, dll."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-fg-primary w-100 py-2"
                    disabled={submitting}
                  >
                    {submitting ? "Memproses..." : "Checkout sekarang"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
