// Kumpulan fungsi bantuan yang dipakai di berbagai halaman
import { API_ORIGIN, KELAMIN } from "./constants";

// Format angka jadi Rupiah, contoh: 5000 -> "Rp5.000"
export function formatHarga(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);
}

// Alias formatHarga — dipakai halaman-halaman admin versi baru
export function formatRupiah(angka) {
  return formatHarga(angka);
}

// Format tanggal jadi format Indonesia, contoh: "24 Agustus 2026"
export function formatTanggal(tanggal) {
  if (!tanggal) return "-";
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Ubah path gambar dari backend jadi URL yang bisa langsung dipakai di <img src>.
// - Path relatif hasil upload ("/uploads/images/xxx.jpg") -> digabung dengan API_ORIGIN
// - URL penuh (https://...) -> dipakai apa adanya
// - Kosong -> string kosong (biar <img> tidak nge-request path aneh)
export function mediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

// Ubah tanggal dari backend (Date/ISO string) jadi format "YYYY-MM-DD"
// supaya bisa dipakai sebagai value <input type="date">.
export function toDateInputValue(tanggal) {
  if (!tanggal) return "";
  const d = new Date(tanggal);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

// Samakan nilai kelamin dari database dengan salah satu opsi di KELAMIN,
// biar <select> selalu punya value yang valid.
export function normalizeKelamin(value) {
  const found = KELAMIN.find((k) => k.toLowerCase() === String(value || "").toLowerCase());
  return found || KELAMIN[0];
}

// Field kosong untuk form ganti password (dipakai ProfilePasswordFields)
export const emptyPasswordFields = {
  passwd_lama: "",
  passwd_baru: "",
  passwd_konfirmasi: "",
};

// Susun payload PUT /me dari state form profil — buang field ganti password
// kalau kosong (berarti user tidak mau ganti password).
export function buildProfilePayload(form) {
  const { passwd_lama, passwd_baru, passwd_konfirmasi, ...rest } = form;
  const payload = { ...rest };
  if (passwd_baru) {
    payload.passwd_lama = passwd_lama;
    payload.passwd_baru = passwd_baru;
    payload.passwd_konfirmasi = passwd_konfirmasi;
  }
  return payload;
}
