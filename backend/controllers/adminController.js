// Controller admin
const bcrypt = require("bcrypt");
const { middlewareUploadGambar, sendHasilUpload } = require("../middlewares");
const {
  findAllProduk,
  findProdukById,
  insertProduk,
  updateProduk: updateProdukModel,
  deleteProduk: deleteProdukModel,
  countProduk,
} = require("../models/produkModel");
const {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
  findAllUsersByRole,
  deleteUserById,
  countByRole,
} = require("../models/usersModel");
const {
  findAllArtikel,
  countArtikel,
  findArtikelById,
  insertArtikel,
  updateArtikel: updateArtikelModel,
  deleteArtikel: deleteArtikelModel,
} = require("../models/artikelModel");
const {
  findAllPembelianWithDetail,
  findPembelianById,
  updatePembelian: updatePembelianModel,
  deletePembelian: deletePembelianModel,
  getAdminStats,
  getRecentPembelian,
  countTerjualBelumBayar,
  countTransaksi,
  countProdukTerjual,
  countPesananAktif,
  sumPendapatanDibayar,
  getLaporanSummary,
} = require("../models/pembelianModel");

// Kategori sesuai ENUM di tabel produk (schema Toko Batik Ponorogo)
const KATEGORI_VALID = ["Batik Tulis", "Batik Cap", "Batik Kombinasi", "Aksesoris"];

// ===== CRUD produk =====

async function listProduk(req, res) {
  try {
    const data = await findAllProduk();
    res.status(200).json({ message: "OK", data });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil produk", error: err.message });
  }
}

async function getProdukById(req, res) {
  try {
    const produk = await findProdukById(req.params.id);
    if (!produk) return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.status(200).json({ message: "OK", data: produk });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil produk", error: err.message });
  }
}

async function createProduk(req, res) {
  try {
    const { nama_produk, deskripsi, harga, stok, gambar, kategori } = req.body;
    if (!nama_produk || !deskripsi || !harga || !kategori) {
      return res.status(400).json({ message: "Field wajib diisi" });
    }
    if (!KATEGORI_VALID.includes(kategori)) {
      return res.status(400).json({ message: "Kategori tidak valid" });
    }
    const id = await insertProduk({
      nama_produk,
      deskripsi,
      harga,
      stok: parseInt(stok, 10) || 0,
      gambar: gambar || null,
      kategori,
    });
    res.status(201).json({ message: "Produk ditambahkan", id });
  } catch (err) {
    res.status(500).json({ message: "Gagal tambah produk", error: err.message });
  }
}

async function updateProduk(req, res) {
  try {
    const { nama_produk, deskripsi, harga, stok, gambar, kategori } = req.body;
    if (!nama_produk || !deskripsi || !harga || !kategori) {
      return res.status(400).json({ message: "Field wajib diisi" });
    }
    if (!KATEGORI_VALID.includes(kategori)) {
      return res.status(400).json({ message: "Kategori tidak valid" });
    }
    const affected = await updateProdukModel(req.params.id, {
      nama_produk,
      deskripsi,
      harga,
      stok: parseInt(stok, 10) || 0,
      gambar: gambar || null,
      kategori,
    });
    if (!affected) return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.status(200).json({ message: "Produk diperbarui" });
  } catch (err) {
    res.status(500).json({ message: "Gagal update produk", error: err.message });
  }
}

async function deleteProduk(req, res) {
  try {
    const affected = await deleteProdukModel(req.params.id);
    if (!affected) return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.status(200).json({ message: "Produk dihapus" });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
      return res.status(409).json({
        message: "Produk ini tidak bisa dihapus karena sudah pernah dipesan oleh pembeli.",
      });
    }
    res.status(500).json({ message: "Gagal hapus produk", error: err.message });
  }
}

// ===== Kelola pembeli (role: pembeli) =====

async function getAllPembeli(req, res) {
  try {
    const data = await findAllUsersByRole("pembeli");
    res.status(200).json({ message: "OK", data });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil data pembeli", error: err.message });
  }
}

async function getUserById(req, res) {
  try {
    const user = await findUserById(req.params.id);
    if (!user || user.role !== "pembeli") {
      return res.status(404).json({ message: "Pembeli tidak ditemukan" });
    }
    res.status(200).json({ message: "OK", data: user });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil data pembeli", error: err.message });
  }
}

async function createUserByAdmin(req, res) {
  try {
    const { nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname, passwd } = req.body;
    if (!nama_d || !nama_b || !kelamin || !lahir || !alamat || !phone || !email || !uname || !passwd) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ message: "Email sudah terdaftar" });

    const hashedPasswd = await bcrypt.hash(passwd, 10);
    const id = await createUser({
      nama_d, nama_b, kelamin, lahir, alamat, phone, email,
      role: "pembeli", uname, passwd: hashedPasswd, foto: "",
    });

    res.status(201).json({ message: "Akun pembeli ditambahkan", id });
  } catch (err) {
    res.status(500).json({ message: "Gagal tambah pembeli", error: err.message });
  }
}

async function updateUser(req, res) {
  try {
    const target = await findUserById(req.params.id);
    if (!target || target.role !== "pembeli") {
      return res.status(404).json({ message: "Pembeli tidak ditemukan" });
    }

    const { nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname, foto } = req.body;
    const affected = await updateUserProfile(req.params.id, {
      nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname, foto: foto || target.foto,
    });
    if (!affected) return res.status(404).json({ message: "Pembeli tidak ditemukan" });
    res.status(200).json({ message: "Data pembeli diperbarui" });
  } catch (err) {
    res.status(500).json({ message: "Gagal update pembeli", error: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    const target = await findUserById(req.params.id);
    if (!target || target.role !== "pembeli") {
      return res.status(404).json({ message: "Pembeli tidak ditemukan" });
    }
    await deleteUserById(req.params.id);
    res.status(200).json({ message: "Pembeli dihapus" });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
      return res.status(409).json({
        message: "Pembeli ini tidak bisa dihapus karena masih punya riwayat pesanan.",
      });
    }
    res.status(500).json({ message: "Gagal hapus pembeli", error: err.message });
  }
}

// ===== CRUD artikel =====

async function getAllArtikel(req, res) {
  try {
    const data = await findAllArtikel();
    res.status(200).json({ message: "OK", data });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil artikel", error: err.message });
  }
}

async function getArtikelById(req, res) {
  try {
    const artikel = await findArtikelById(req.params.id);
    if (!artikel) return res.status(404).json({ message: "Artikel tidak ditemukan" });
    res.status(200).json({ message: "OK", data: artikel });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil artikel", error: err.message });
  }
}

async function createArtikel(req, res) {
  try {
    const { judul, ringkasan, isi, gambar } = req.body;
    if (!judul || !ringkasan || !isi || !gambar) {
      return res.status(400).json({ message: "Field wajib diisi" });
    }
    const id = await insertArtikel({ judul, ringkasan, isi, gambar });
    res.status(201).json({ message: "Artikel ditambahkan", id });
  } catch (err) {
    res.status(500).json({ message: "Gagal tambah artikel", error: err.message });
  }
}

async function updateArtikel(req, res) {
  try {
    const { judul, ringkasan, isi, gambar } = req.body;
    if (!judul || !ringkasan || !isi || !gambar) {
      return res.status(400).json({ message: "Field wajib diisi" });
    }
    const affected = await updateArtikelModel(req.params.id, { judul, ringkasan, isi, gambar });
    if (!affected) return res.status(404).json({ message: "Artikel tidak ditemukan" });
    res.status(200).json({ message: "Artikel diperbarui" });
  } catch (err) {
    res.status(500).json({ message: "Gagal update artikel", error: err.message });
  }
}

async function deleteArtikel(req, res) {
  try {
    const affected = await deleteArtikelModel(req.params.id);
    if (!affected) return res.status(404).json({ message: "Artikel tidak ditemukan" });
    res.status(200).json({ message: "Artikel dihapus" });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
      return res.status(409).json({ message: "Artikel ini tidak bisa dihapus karena masih terpakai di tempat lain." });
    }
    res.status(500).json({ message: "Gagal hapus artikel", error: err.message });
  }
}

// ===== Dashboard stats =====

async function getStats(req, res) {
  try {
    const [
      jumlah_pembeli,
      jumlah_transaksi,
      jumlah_produk,
      produk_terjual,
      jumlah_artikel,
      pesanan_aktif,
      belum_dibayar,
      total_pendapatan,
      transaksi_terbaru,
    ] = await Promise.all([
      countByRole("pembeli"),
      countTransaksi(),
      countProduk(),
      countProdukTerjual(),
      countArtikel(),
      countPesananAktif(),
      countTerjualBelumBayar(),
      sumPendapatanDibayar(),
      getRecentPembelian(5),
    ]);

    res.status(200).json({
      message: "OK",
      data: {
        jumlah_pembeli,
        jumlah_transaksi,
        jumlah_produk,
        produk_terjual,
        jumlah_artikel,
        pesanan_aktif,
        belum_dibayar,
        total_pendapatan,
        transaksi_terbaru,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil statistik", error: err.message });
  }
}

// ===== Kelola pembelian =====

async function listPembelian(req, res) {
  try {
    const data = await findAllPembelianWithDetail();
    res.status(200).json({ message: "OK", data });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil pembelian", error: err.message });
  }
}

async function getPembelianByIdAdmin(req, res) {
  try {
    const pembelian = await findPembelianById(req.params.id);
    if (!pembelian) return res.status(404).json({ message: "Pembelian tidak ditemukan" });
    res.status(200).json({ message: "OK", data: pembelian });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil pembelian", error: err.message });
  }
}

async function updatePembelianAdmin(req, res) {
  try {
    const { pembayaran, status, catatan, foto_bukti } = req.body;
    const affected = await updatePembelianModel(req.params.id, {
      pembayaran, status, catatan, foto_bukti: foto_bukti || null,
    });
    if (!affected) return res.status(404).json({ message: "Pembelian tidak ditemukan" });
    res.status(200).json({ message: "Pembelian diperbarui" });
  } catch (err) {
    res.status(500).json({ message: "Gagal update pembelian", error: err.message });
  }
}

async function deletePembelianAdmin(req, res) {
  try {
    const affected = await deletePembelianModel(req.params.id);
    if (!affected) return res.status(404).json({ message: "Pembelian tidak ditemukan" });
    res.status(200).json({ message: "Pembelian dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal hapus pembelian", error: err.message });
  }
}

// ===== Laporan penjualan =====
async function getLaporan(req, res) {
  try {
    const { from, to } = req.query;
    const data = await getLaporanSummary(from || null, to || null);
    res.status(200).json({ message: "OK", data });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil laporan", error: err.message });
  }
}

// ===== Upload gambar (produk/artikel) =====
const uploadGambar = [middlewareUploadGambar, sendHasilUpload];

module.exports = {
  listProduk, getProdukById, createProduk, updateProduk, deleteProduk,
  getStats, getAllPembeli,
  getUserById, createUserByAdmin, updateUser, deleteUser,
  listPembelian,
  getPembelianById: getPembelianByIdAdmin,
  updatePembelian: updatePembelianAdmin,
  deletePembelian: deletePembelianAdmin,
  getAllArtikel, getArtikelById, createArtikel, updateArtikel, deleteArtikel,
  uploadGambar,
  getLaporan,
};