// Model untuk tabel pembelian
const db = require("../config/db");

// Ambil semua pembelian + detail pembeli & produk (untuk admin)
function findAllPembelianWithDetail() {
  return db.query(
    `SELECT pb.*,
            CONCAT(u.nama_d, ' ', u.nama_b) AS nama_pembeli,
            u.email AS email_pembeli,
            u.uname AS uname_pembeli,
            pr.nama_produk,
            pr.harga,
            pr.gambar AS gambar_produk
     FROM pembelian pb
     JOIN users u ON u.id = pb.id_pembeli
     JOIN produk pr ON pr.id_produk = pb.id_produk
     ORDER BY pb.created_at DESC`
  ).then(([rows]) => rows);
}

// Ambil satu pembelian berdasarkan ID
function findPembelianById(id) {
  return db.query(
    `SELECT pb.*,
            CONCAT(u.nama_d, ' ', u.nama_b) AS nama_pembeli,
            u.email AS email_pembeli,
            u.uname AS uname_pembeli,
            pr.nama_produk,
            pr.harga,
            pr.gambar AS gambar_produk
     FROM pembelian pb
     JOIN users u ON u.id = pb.id_pembeli
     JOIN produk pr ON pr.id_produk = pb.id_produk
     WHERE pb.id = ?`,
    [id]
  ).then(([rows]) => rows[0]);
}

// Tambah pembelian baru (jumlah = qty produk dalam 1 baris pesanan)
function insertPembelian(data) {
  const {
    id_pembeli,
    id_produk,
    jumlah,
    nama_pembeli,
    alamat_pembeli,
    phone_pembeli,
    metode_pembayaran,
    pengiriman,
    catatan,
  } = data;

  const qty = Math.max(1, parseInt(jumlah, 10) || 1);

  return db.query(
    `INSERT INTO pembelian
      (
        id_pembeli,
        id_produk,
        jumlah,
        nama_pembeli,
        alamat_pembeli,
        phone_pembeli,
        metode_pembayaran,
        pengiriman,
        catatan
      )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id_pembeli,
      id_produk,
      qty,
      nama_pembeli,
      alamat_pembeli,
      phone_pembeli,
      metode_pembayaran,
      pengiriman,
      catatan,
    ]
  ).then(([result]) => result.insertId);
}

// Update pembelian
function updatePembelian(id, data) {
  const {
    pembayaran,
    status,
    catatan,
    foto_bukti,
  } = data;

  return db.query(
    `UPDATE pembelian
     SET pembayaran = ?,
         status = ?,
         catatan = ?,
         foto_bukti = ?
     WHERE id = ?`,
    [
      pembayaran,
      status,
      catatan,
      foto_bukti,
      id,
    ]
  ).then(([result]) => result.affectedRows);
}

// Hapus pembelian
function deletePembelian(id) {
  return db
    .query(
      "DELETE FROM pembelian WHERE id = ?",
      [id]
    )
    .then(([result]) => result.affectedRows);
}

// Riwayat pembelian milik pembeli
function findPembelianByPembeliIdWithDetail(idPembeli) {
  return db.query(
    `SELECT pb.*,
            pr.nama_produk,
            pr.harga,
            pr.gambar
     FROM pembelian pb
     JOIN produk pr ON pr.id_produk = pb.id_produk
     WHERE pb.id_pembeli = ?
     ORDER BY pb.created_at DESC`,
    [idPembeli]
  ).then(([rows]) => rows);
}

// Ambil pembelian berdasarkan ID dan ID pembeli
function findPembelianByIdAndPembeliId(id, idPembeli) {
  return db.query(
    `SELECT pb.*,
            pr.nama_produk,
            pr.harga,
            pr.gambar
     FROM pembelian pb
     JOIN produk pr ON pr.id_produk = pb.id_produk
     WHERE pb.id = ?
       AND pb.id_pembeli = ?`,
    [id, idPembeli]
  ).then(([rows]) => rows[0]);
}

// Statistik pembelian milik satu pembeli
function getStatsByPembeliId(idPembeli) {
  return db.query(
    `SELECT status,
            COUNT(*) AS total
     FROM pembelian
     WHERE id_pembeli = ?
     GROUP BY status`,
    [idPembeli]
  ).then(([rows]) => rows);
}

// Statistik pembelian keseluruhan
function getAdminStats() {
  return db.query(
    `SELECT status,
            COUNT(*) AS total
     FROM pembelian
     GROUP BY status`
  ).then(([rows]) => rows);
}

// Pesanan selesai tetapi belum dibayar
function countTerjualBelumBayar() {
  return db.query(
    `SELECT COUNT(*) AS total
     FROM pembelian
     WHERE LOWER(TRIM(status)) = 'selesai'
       AND LOWER(TRIM(pembayaran)) IN ('belum bayar', 'belum')`
  ).then(([rows]) => Number(rows[0].total || 0));
}

// Total semua transaksi
function countTransaksi() {
  return db
    .query(
      "SELECT COUNT(*) AS total FROM pembelian"
    )
    .then(([rows]) => Number(rows[0].total || 0));
}

// Total produk terjual
function countProdukTerjual() {
  return db
    .query(
      `SELECT COALESCE(SUM(COALESCE(jumlah, 1)), 0) AS total
       FROM pembelian
       WHERE LOWER(TRIM(status)) = 'selesai'`
    )
    .then(([rows]) => Number(rows[0].total || 0));
}

// Pesanan yang masih aktif
function countPesananAktif() {
  return db
    .query(
      `SELECT COUNT(*) AS total
       FROM pembelian
       WHERE LOWER(TRIM(status)) <> 'selesai'`
    )
    .then(([rows]) => Number(rows[0].total || 0));
}

// ======================================================
// TOTAL PENDAPATAN
// Pendapatan dihitung dari semua pesanan yang statusnya
// SUDAH SELESAI.
// ======================================================
function sumPendapatanDibayar() {
  return db
    .query(
      `SELECT COALESCE(SUM(pr.harga * COALESCE(pb.jumlah, 1)), 0) AS total
       FROM pembelian pb
       JOIN produk pr ON pr.id_produk = pb.id_produk
       WHERE LOWER(TRIM(pb.status)) = 'selesai'`
    )
    .then(([rows]) => Number(rows[0].total || 0));
}

// Pembelian terbaru
function getRecentPembelian(limit = 5) {
  return db.query(
    `SELECT pb.*,
            CONCAT(u.nama_d, ' ', u.nama_b) AS nama_pembeli,
            pr.nama_produk
     FROM pembelian pb
     JOIN users u ON u.id = pb.id_pembeli
     JOIN produk pr ON pr.id_produk = pb.id_produk
     ORDER BY pb.created_at DESC
     LIMIT ?`,
    [limit]
  ).then(([rows]) => rows);
}

// Laporan admin: filter opsional by tanggal (YYYY-MM-DD)
function getLaporanSummary(fromDate, toDate) {
  const params = [];
  let where = "1=1";
  if (fromDate) {
    where += " AND DATE(pb.created_at) >= ?";
    params.push(fromDate);
  }
  if (toDate) {
    where += " AND DATE(pb.created_at) <= ?";
    params.push(toDate);
  }

  return Promise.all([
    // total transaksi + pendapatan (status selesai)
    db
      .query(
        `SELECT
           COUNT(*) AS total_transaksi,
           COALESCE(SUM(CASE WHEN LOWER(TRIM(pb.status)) = 'selesai' THEN pr.harga * COALESCE(pb.jumlah, 1) ELSE 0 END), 0) AS total_pendapatan,
           COALESCE(SUM(CASE WHEN LOWER(TRIM(pb.pembayaran)) IN ('sudah bayar', 'dibayar', 'lunas') THEN pr.harga * COALESCE(pb.jumlah, 1) ELSE 0 END), 0) AS pendapatan_dibayar
         FROM pembelian pb
         JOIN produk pr ON pr.id_produk = pb.id_produk
         WHERE ${where}`,
        params
      )
      .then(([rows]) => rows[0]),
    // breakdown status
    db
      .query(
        `SELECT pb.status, COUNT(*) AS total
         FROM pembelian pb
         WHERE ${where}
         GROUP BY pb.status
         ORDER BY total DESC`,
        params
      )
      .then(([rows]) => rows),
    // top produk
    db
      .query(
        `SELECT pr.id_produk, pr.nama_produk, pr.harga, pr.gambar, COUNT(*) AS terjual,
                COALESCE(SUM(pr.harga), 0) AS omzet
         FROM pembelian pb
         JOIN produk pr ON pr.id_produk = pb.id_produk
         WHERE ${where}
         GROUP BY pr.id_produk, pr.nama_produk, pr.harga, pr.gambar
         ORDER BY terjual DESC
         LIMIT 10`,
        params
      )
      .then(([rows]) => rows),
    // per bulan (6 bulan terakhir atau dalam range)
    db
      .query(
        `SELECT DATE_FORMAT(pb.created_at, '%Y-%m') AS bulan,
                COUNT(*) AS total_transaksi,
                COALESCE(SUM(CASE WHEN LOWER(TRIM(pb.status)) = 'selesai' THEN pr.harga * COALESCE(pb.jumlah, 1) ELSE 0 END), 0) AS pendapatan
         FROM pembelian pb
         JOIN produk pr ON pr.id_produk = pb.id_produk
         WHERE ${where}
         GROUP BY DATE_FORMAT(pb.created_at, '%Y-%m')
         ORDER BY bulan DESC
         LIMIT 12`,
        params
      )
      .then(([rows]) => rows),
  ]).then(([summary, byStatus, topProduk, perBulan]) => ({
    total_transaksi: Number(summary.total_transaksi || 0),
    total_pendapatan: Number(summary.total_pendapatan || 0),
    pendapatan_dibayar: Number(summary.pendapatan_dibayar || 0),
    by_status: byStatus,
    top_produk: topProduk,
    per_bulan: perBulan,
  }));
}

// Pesanan terbaru milik satu pembeli
function getRecentByPembeliId(idPembeli, limit = 5) {
  return db
    .query(
      `SELECT pb.id, pb.status, pb.pembayaran, pb.created_at,
              pr.nama_produk, pr.harga, pr.gambar
       FROM pembelian pb
       JOIN produk pr ON pr.id_produk = pb.id_produk
       WHERE pb.id_pembeli = ?
       ORDER BY pb.created_at DESC
       LIMIT ?`,
      [idPembeli, limit]
    )
    .then(([rows]) => rows);
}


// Total belanja pembeli yang sudah dibayar
// Status bayar di app: "Sudah Bayar" / "Belum Bayar" (lihat STATUS_BAYAR frontend)
function sumBelanjaDibayarByPembeli(idPembeli) {
  const sqlWithJumlah = `
    SELECT COALESCE(SUM(pr.harga * COALESCE(pb.jumlah, 1)), 0) AS total
    FROM pembelian pb
    JOIN produk pr ON pr.id_produk = pb.id_produk
    WHERE pb.id_pembeli = ?
      AND (
        LOWER(TRIM(pb.pembayaran)) IN ('sudah bayar', 'dibayar', 'lunas', 'paid')
        OR LOWER(TRIM(pb.pembayaran)) LIKE '%sudah%bayar%'
      )`;
  const sqlNoJumlah = `
    SELECT COALESCE(SUM(pr.harga), 0) AS total
    FROM pembelian pb
    JOIN produk pr ON pr.id_produk = pb.id_produk
    WHERE pb.id_pembeli = ?
      AND (
        LOWER(TRIM(pb.pembayaran)) IN ('sudah bayar', 'dibayar', 'lunas', 'paid')
        OR LOWER(TRIM(pb.pembayaran)) LIKE '%sudah%bayar%'
      )`;

  return db
    .query(sqlWithJumlah, [idPembeli])
    .then(([rows]) => Number(rows[0].total || 0))
    .catch(() =>
      db
        .query(sqlNoJumlah, [idPembeli])
        .then(([rows]) => Number(rows[0].total || 0))
    );
}

// Jumlah pesanan belum dibayar milik pembeli
function countBelumBayarByPembeli(idPembeli) {
  return db
    .query(
      `SELECT COUNT(*) AS total
       FROM pembelian pb
       WHERE pb.id_pembeli = ?
         AND (
           pb.pembayaran IS NULL
           OR TRIM(pb.pembayaran) = ''
           OR LOWER(TRIM(pb.pembayaran)) IN ('belum bayar', 'belum')
         )`,
      [idPembeli]
    )
    .then(([rows]) => Number(rows[0].total || 0));
}

module.exports = {
  findAllPembelianWithDetail,
  findPembelianById,
  updatePembelian,
  deletePembelian,
  insertPembelian,
  findPembelianByPembeliIdWithDetail,
  findPembelianByIdAndPembeliId,
  getStatsByPembeliId,
  getAdminStats,
  getRecentPembelian,
  countTerjualBelumBayar,
  countTransaksi,
  countProdukTerjual,
  countPesananAktif,
  sumPendapatanDibayar,
  getLaporanSummary,
  getRecentByPembeliId,
  sumBelanjaDibayarByPembeli,
  countBelumBayarByPembeli,
};