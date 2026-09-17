// Wrapper fetch tipis ke backend
import { API_URL } from "./constants";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(data?.message || "Terjadi kesalahan pada server");
    err.status = res.status;
    throw err;
  }
  return data;
}

// Request khusus upload file (multipart/form-data) - TIDAK set Content-Type manual
// supaya browser yang isi boundary-nya otomatis.
async function requestUpload(path, formData) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(data?.message || "Terjadi kesalahan pada server");
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  del: (path) => request(path, { method: "DELETE" }),
  uploadGambar: (file) => {
    const formData = new FormData();
    formData.append("gambar", file);
    return requestUpload("/admin/upload-gambar", formData);
  },
};

// ===== adminApi — dipakai khusus di halaman-halaman /admin/* =====
export const adminApi = {
  // Profil admin sendiri
  getMe: () => api.get("/admin/me"),
  putMe: (payload) => api.put("/admin/me", payload),

  // Statistik dashboard
  getStats: () => api.get("/admin/stats"),

  // Laporan penjualan
  getLaporan: (params = {}) => {
    const q = new URLSearchParams();
    if (params.from) q.set("from", params.from);
    if (params.to) q.set("to", params.to);
    const qs = q.toString();
    return api.get(`/admin/laporan${qs ? `?${qs}` : ""}`);
  },

  // Kelola pembeli / users
  getPembeli: () => api.get("/admin/pembeli"),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (payload) => api.post("/admin/users", payload),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload),
  deleteUser: (id) => api.del(`/admin/users/${id}`),

  // CRUD produk
  getProduk: () => api.get("/admin/produk"),
  getProdukById: (id) => api.get(`/admin/produk/${id}`),
  createProduk: (payload) => api.post("/admin/produk", payload),
  updateProduk: (id, payload) => api.put(`/admin/produk/${id}`, payload),
  deleteProduk: (id) => api.del(`/admin/produk/${id}`),

  // Kelola pembelian / pesanan
  getPembelian: () => api.get("/admin/pembelian"),
  getPembelianById: (id) => api.get(`/admin/pembelian/${id}`),
  updatePembelian: (id, payload) => api.put(`/admin/pembelian/${id}`, payload),
  deletePembelian: (id) => api.del(`/admin/pembelian/${id}`),

  // CRUD artikel
  getArtikel: () => api.get("/admin/artikel"),
  getArtikelById: (id) => api.get(`/admin/artikel/${id}`),
  createArtikel: (payload) => api.post("/admin/artikel", payload),
  updateArtikel: (id, payload) => api.put(`/admin/artikel/${id}`, payload),
  deleteArtikel: (id) => api.del(`/admin/artikel/${id}`),

  // Upload gambar (produk/artikel/profil)
  uploadGambar: (file) => api.uploadGambar(file),
};