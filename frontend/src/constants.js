/**
 * constants.js — info toko (SITE), menu publik, enum form.
 */

// Base URL backend, diambil dari .env
export const API_URL = import.meta.env.VITE_API_URL;

// Origin backend tanpa "/api" — dipakai untuk menyusun URL gambar hasil upload
// (backend simpan path relatif, mis. "/uploads/images/xxx.jpg", disajikan lewat
// express.static di server.js, BUKAN di bawah /api).
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

// Ubah path gambar dari backend jadi URL yang bisa langsung dipakai di <img src>.
// - Path relatif hasil upload ("/uploads/images/xxx.jpg") -> digabung dengan API_ORIGIN
// - URL penuh (https://...) -> dipakai apa adanya
export function getImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

// Info toko hardcode di frontend (TIDAK ada tabel kontak di database).
// Ganti nilai di bawah dengan data asli toko kalau perlu.
export const SITE = {
  logo_toko: "",
  nama_toko: "Batik Ponorogo",
  tentang:
    "Batik tulis dan batik cap asli karya perajin lokal Ponorogo. Setiap helai kain dibuat dengan proses tradisional turun-temurun, memadukan motif khas Reog dan Nusantara dengan kualitas kain pilihan.",
  foto_banner: "",
  alamat_toko: "RT 003 / RW 001, Desa Turi, Kec. Jetis, Kab. Ponorogo 63473",
  email_toko: "info@batikponorogo.my.id",
  tlp_toko: 6281315937215,
  nama_bank_a: "BCA",
  nama_bank_b: "Dana",
  no_rek_a: "3562742739023",
  no_rek_b: "081315937215",
  jam_buka: 8,
  jam_tutup: 20,
  logo_wa: "",
  logo_ig: "",
  logo_fb: "",
  link_wa: "https://wa.me/6281315937215",
  link_ig: "https://instagram.com/batikponorogo.id",
  link_fb: "",
};

export const PUBLIC_NAV = [
  { to: "/", label: "Beranda", end: true },
  { to: "/toko", label: "Toko" },
  { to: "/artikel", label: "Artikel" },
];

export const KELAMIN = ["Laki-laki", "Perempuan"];

// Kategori produk — harus PERSIS sama dengan KATEGORI_VALID di backend/controllers/adminController.js
export const KATEGORI_PRODUK = ["Batik Tulis", "Batik Cap", "Batik Kombinasi", "Aksesoris"];

// Metode pembayaran — harus PERSIS sama dengan METODE_VALID di backend/controllers/usersController.js
export const METODE_BAYAR = ["Bank Transfer", "COD"];

// Kurir pengiriman — harus PERSIS sama dengan PENGIRIMAN_VALID di backend/controllers/usersController.js
export const SHIPPING = ["JNT Express", "JNE"];

// Status proses pesanan (kolom `status` tabel pembelian)
export const STATUS_PROSES = ["Tertunda", "Dikemas", "Dikirim", "Diterima", "Selesai"];

// Status pembayaran (kolom `pembayaran` tabel pembelian — bebas teks di backend,
// dua nilai ini dipakai sebagai pilihan standar di form admin)
export const STATUS_BAYAR = ["Belum Bayar", "Sudah Bayar"];
