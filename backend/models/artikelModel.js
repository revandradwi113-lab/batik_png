// Model untuk tabel artikel
const db = require("../config/db");

// Ambil semua artikel
function findAllArtikel() {
  return db.query("SELECT * FROM artikel ORDER BY created_at DESC")
    .then(([rows]) => rows);
}

// Hitung total artikel yang sudah diupload
function countArtikel() {
  return db.query("SELECT COUNT(*) AS total FROM artikel")
    .then(([rows]) => rows[0].total);
}

// Ambil satu artikel by id
function findArtikelById(id) {
  return db.query("SELECT * FROM artikel WHERE id = ?", [id])
    .then(([rows]) => rows[0]);
}

// Tambah artikel baru, return insertId
function insertArtikel(data) {
  const { judul, ringkasan, isi, gambar } = data;
  return db.query(
    `INSERT INTO artikel (judul, ringkasan, isi, gambar)
     VALUES (?, ?, ?, ?)`,
    [judul, ringkasan, isi, gambar]
  ).then(([result]) => result.insertId);
}

// Update artikel by id, return affectedRows
function updateArtikel(id, data) {
  const { judul, ringkasan, isi, gambar } = data;
  return db.query(
    `UPDATE artikel
     SET judul = ?, ringkasan = ?, isi = ?, gambar = ?
     WHERE id = ?`,
    [judul, ringkasan, isi, gambar, id]
  ).then(([result]) => result.affectedRows);
}

// Hapus artikel by id, return affectedRows
function deleteArtikel(id) {
  return db.query("DELETE FROM artikel WHERE id = ?", [id])
    .then(([result]) => result.affectedRows);
}

module.exports = {
  findAllArtikel,
  countArtikel,
  findArtikelById,
  insertArtikel,
  updateArtikel,
  deleteArtikel,
};