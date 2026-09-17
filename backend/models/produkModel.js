// Model untuk tabel produk
const db = require("../config/db");

// Ambil semua produk
function findAllProduk() {
  return db.query("SELECT * FROM produk ORDER BY created_at DESC")
    .then(([rows]) => rows);
}

// Ambil satu produk by id_produk
function findProdukById(id) {
  return db.query("SELECT * FROM produk WHERE id_produk = ?", [id])
    .then(([rows]) => rows[0]);
}

// Tambah produk baru, return insertId
function insertProduk(data) {
  const { nama_produk, deskripsi, harga, gambar, kategori } = data;
  return db.query(
    `INSERT INTO produk (nama_produk, deskripsi, harga, gambar, kategori)
     VALUES (?, ?, ?, ?, ?)`,
    [nama_produk, deskripsi, harga, gambar, kategori]
  ).then(([result]) => result.insertId);
}

// Update produk by id_produk, return affectedRows
function updateProduk(id, data) {
  const { nama_produk, deskripsi, harga, gambar, kategori } = data;
  return db.query(
    `UPDATE produk
     SET nama_produk = ?, deskripsi = ?, harga = ?, gambar = ?, kategori = ?
     WHERE id_produk = ?`,
    [nama_produk, deskripsi, harga, gambar, kategori, id]
  ).then(([result]) => result.affectedRows);
}

// Hapus produk by id_produk, return affectedRows
function deleteProduk(id) {
  return db.query("DELETE FROM produk WHERE id_produk = ?", [id])
    .then(([result]) => result.affectedRows);
}

// Hitung total produk di katalog
function countProduk() {
  return db.query("SELECT COUNT(*) AS total FROM produk")
    .then(([rows]) => rows[0].total);
}

module.exports = {
  findAllProduk,
  findProdukById,
  insertProduk,
  updateProduk,
  deleteProduk,
  countProduk,
};