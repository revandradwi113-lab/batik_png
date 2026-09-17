// Model untuk tabel users
const db = require("../config/db");

// Simpan user baru, return insertId
async function createUser(data) {
  const {
    nama_d, nama_b, kelamin, lahir, alamat, phone, email, role, uname, passwd, foto,
  } = data;

  const [result] = await db.execute(
    `INSERT INTO users
      (nama_d, nama_b, kelamin, lahir, alamat, phone, email, role, uname, passwd, foto)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nama_d, nama_b, kelamin, lahir, alamat, phone, email, role, uname, passwd, foto]
  );
  return result.insertId;
}

// Cari user berdasarkan email (cek duplikat saat register)
async function findUserByEmail(email) {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0];
}

// Cari user berdasarkan email ATAU uname (dipakai saat login)
async function findUserByCredential(credential) {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE email = ? OR uname = ? LIMIT 1",
    [credential, credential]
  );
  return rows[0];
}

// Ambil profil user by id, tanpa kolom passwd
async function findUserById(id) {
  const [rows] = await db.execute(
    `SELECT id, nama_d, nama_b, kelamin, lahir, alamat, phone, email, role, uname, foto, created_at, updated_at
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0];
}

// Ambil hash passwd by id (dipakai saat ganti password)
async function findPasswdHashById(id) {
  const [rows] = await db.execute(
    "SELECT passwd FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ? rows[0].passwd : null;
}

// Update profil user (tanpa ganti passwd/role)
async function updateUserProfile(id, data) {
  const {
    nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname, foto,
  } = data;

  const [result] = await db.execute(
    `UPDATE users
     SET nama_d = ?, nama_b = ?, kelamin = ?, lahir = ?, alamat = ?,
         phone = ?, email = ?, uname = ?, foto = ?
     WHERE id = ?`,
    [nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname, foto, id]
  );
  return result.affectedRows;
}

// Ambil semua user berdasarkan role (dipakai admin untuk kelola pembeli), tanpa passwd
async function findAllUsersByRole(role) {
  const [rows] = await db.execute(
    `SELECT id, nama_d, nama_b, kelamin, lahir, alamat, phone, email, role, uname, foto, created_at, updated_at
     FROM users WHERE role = ? ORDER BY created_at DESC`,
    [role]
  );
  return rows;
}

// Hapus user by id, return affectedRows
async function deleteUserById(id) {
  const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows;
}

// Hitung jumlah user berdasarkan role (mis. total pembeli terdaftar)
async function countByRole(role) {
  const [rows] = await db.execute(
    "SELECT COUNT(*) AS total FROM users WHERE role = ?",
    [role]
  );
  return rows[0].total;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserByCredential,
  findUserById,
  findPasswdHashById,
  updateUserProfile,
  findAllUsersByRole,
  deleteUserById,
  countByRole,
};