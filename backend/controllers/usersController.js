// Controller untuk autentikasi user + akses publik produk/artikel + pembelian pembeli
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  createUser,
  findUserByEmail,
  findUserByCredential,
  findUserById,
  findPasswdHashById,
  updateUserProfile,
} = require("../models/usersModel");
const { findAllProduk, findProdukById } = require("../models/produkModel");
const { findAllArtikel, findArtikelById } = require("../models/artikelModel");
const {
  insertPembelian,
  findPembelianByPembeliIdWithDetail,
  findPembelianByIdAndPembeliId,
  getStatsByPembeliId,
  getRecentByPembeliId,
  sumBelanjaDibayarByPembeli,
  countBelumBayarByPembeli,
} = require("../models/pembelianModel");
const db = require("../config/db");

// Validasi enum sesuai schema tabel pembelian
const METODE_VALID = ["Bank Transfer", "COD"];
const PENGIRIMAN_VALID = ["JNT Express", "JNE"];

// Registrasi user baru (role default: pembeli)
async function registerUser(req, res) {
  try {
    const {
      nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname, passwd,
    } = req.body;
    if (!nama_d || !nama_b || !kelamin || !lahir || !alamat || !phone || !email || !uname || !passwd) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }
    const hashedPasswd = await bcrypt.hash(passwd, 10);
    const id = await createUser({
      nama_d, nama_b, kelamin, lahir, alamat, phone, email,
      role: "pembeli", uname, passwd: hashedPasswd, foto: "",
    });
    res.status(201).json({ message: "Registrasi berhasil", id });
  } catch (err) {
    res.status(500).json({ message: "Gagal registrasi", error: err.message });
  }
}

// Login user pakai email/uname (credential) + passwd
async function loginUser(req, res) {
  try {
    const { credential, passwd } = req.body;
    if (!credential || !passwd) {
      return res.status(400).json({ message: "Credential dan passwd wajib diisi" });
    }
    const user = await findUserByCredential(credential);
    if (!user) {
      return res.status(400).json({ message: "User tidak ditemukan" });
    }
    const match = await bcrypt.compare(passwd, user.passwd);
    if (!match) {
      return res.status(400).json({ message: "Password salah" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({ message: "Login berhasil", token });
  } catch (err) {
    res.status(500).json({ message: "Gagal login", error: err.message });
  }
}

// GET /api/admin/me — ambil profil sendiri (pakai req.user.id dari JWT)
async function getMyProfile(req, res) {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.status(200).json({ message: "OK", data: user });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil profil", error: err.message });
  }
}

// PUT /api/admin/me — update profil sendiri, ganti password opsional (butuh passwd_lama)
async function updateMyProfile(req, res) {
  try {
    const {
      nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname, foto,
      passwd_lama, passwd_baru,
    } = req.body;

    const current = await findUserById(req.user.id);
    if (!current) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Update data profil (field kosong tetap pakai data lama)
    await updateUserProfile(req.user.id, {
      nama_d: nama_d || current.nama_d,
      nama_b: nama_b || current.nama_b,
      kelamin: kelamin || current.kelamin,
      lahir: lahir || current.lahir,
      alamat: alamat || current.alamat,
      phone: phone || current.phone,
      email: email || current.email,
      uname: uname || current.uname,
      foto: foto || current.foto,
    });

    // Ganti password jika passwd_baru dikirim, wajib verifikasi passwd_lama dulu
    if (passwd_baru) {
      if (!passwd_lama) {
        return res.status(400).json({ message: "Password lama wajib diisi untuk ganti password" });
      }
      const hashLama = await findPasswdHashById(req.user.id);
      const match = await bcrypt.compare(passwd_lama, hashLama);
      if (!match) {
        return res.status(400).json({ message: "Password lama salah" });
      }
      const hashBaru = await bcrypt.hash(passwd_baru, 10);
      await db.query("UPDATE users SET passwd = ? WHERE id = ?", [hashBaru, req.user.id]);
    }

    res.status(200).json({ message: "Profil berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ message: "Gagal update profil", error: err.message });
  }
}

// GET /api/produk — daftar produk, bisa diakses publik
async function listProduk(req, res) {
  try {
    const data = await findAllProduk();
    res.status(200).json({ message: "OK", data });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil produk", error: err.message });
  }
}

// GET /api/produk/:id_produk — detail satu produk, bisa diakses publik
async function getProdukById(req, res) {
  try {
    const produk = await findProdukById(req.params.id_produk);
    if (!produk) return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.status(200).json({ message: "OK", data: produk });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil produk", error: err.message });
  }
}

// GET /api/artikel — daftar artikel, bisa diakses publik
async function listArtikelPublik(req, res) {
  try {
    const data = await findAllArtikel();
    res.status(200).json({ message: "OK", data });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil artikel", error: err.message });
  }
}

// GET /api/artikel/:id — detail satu artikel, bisa diakses publik
async function getArtikelPublikById(req, res) {
  try {
    const artikel = await findArtikelById(req.params.id);
    if (!artikel) return res.status(404).json({ message: "Artikel tidak ditemukan" });
    res.status(200).json({ message: "OK", data: artikel });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil artikel", error: err.message });
  }
}

// GET /api/users/dashboard — ringkasan statistik + pesanan terbaru pembeli login
async function getDashboard(req, res) {
  try {
    const id = req.user.id;
    const safe = (promise, fallback) =>
      promise.catch((err) => {
        console.error("[dashboard]", err.message);
        return fallback;
      });

    const [stats, recent, total_belanja_dibayar, belum_dibayar, allOrders] = await Promise.all([
      safe(getStatsByPembeliId(id), []),
      safe(getRecentByPembeliId(id, 5), []),
      safe(sumBelanjaDibayarByPembeli(id), 0),
      safe(countBelumBayarByPembeli(id), 0),
      safe(findPembelianByPembeliIdWithDetail(id), []),
    ]);

    // Fallback hitung manual dari semua pesanan (jaga-jaga query SUM gagal / kolom beda)
    let totalBelanja = Number(total_belanja_dibayar) || 0;
    let belumBayar = Number(belum_dibayar) || 0;
    if (Array.isArray(allOrders) && allOrders.length > 0) {
      const isSudah = (v) => {
        const s = String(v || "").toLowerCase().trim();
        return s.includes("sudah") || s === "dibayar" || s === "lunas" || s === "paid";
      };
      const isBelum = (v) => {
        const s = String(v || "").toLowerCase().trim();
        return !s || s.includes("belum");
      };
      if (totalBelanja === 0) {
        totalBelanja = allOrders.reduce((sum, o) => {
          if (!isSudah(o.pembayaran)) return sum;
          return sum + Number(o.harga || 0) * Math.max(1, Number(o.jumlah) || 1);
        }, 0);
      }
      // selalu sinkronkan belum bayar dari data aktual bila query khusus 0
      const manualBelum = allOrders.filter((o) => isBelum(o.pembayaran)).length;
      if (belumBayar === 0 && manualBelum > 0) belumBayar = manualBelum;
    }

    res.status(200).json({
      message: "OK",
      data: {
        statusCounts: stats,
        recentOrders: recent,
        total_belanja_dibayar: totalBelanja,
        belum_dibayar: belumBayar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil dashboard", error: err.message });
  }
}

// POST /api/pembeli/pembelian — buat pembelian baru, id_pembeli dari token
async function createPembelian(req, res) {
  try {
    const {
      id_produk, jumlah, nama_pembeli, alamat_pembeli, phone_pembeli,
      metode_pembayaran, pengiriman, catatan,
    } = req.body;

    if (!id_produk || !metode_pembayaran || !pengiriman) {
      return res.status(400).json({ message: "Field wajib diisi" });
    }
    if (!METODE_VALID.includes(metode_pembayaran)) {
      return res.status(400).json({ message: "Metode pembayaran tidak valid" });
    }
    if (!PENGIRIMAN_VALID.includes(pengiriman)) {
      return res.status(400).json({ message: "Kurir pengiriman tidak valid" });
    }

    const produk = await findProdukById(id_produk);
    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const qty = Math.max(1, Math.min(99, parseInt(jumlah, 10) || 1));

    const id = await insertPembelian({
      id_pembeli: req.user.id, // id_pembeli diambil dari JWT, bukan body
      id_produk,
      jumlah: qty,
      nama_pembeli: nama_pembeli || null,
      alamat_pembeli: alamat_pembeli || null,
      phone_pembeli: phone_pembeli || null,
      metode_pembayaran,
      pengiriman,
      catatan: catatan || null,
    });

    res.status(201).json({ message: "Pembelian berhasil dibuat", id });
  } catch (err) {
    res.status(500).json({ message: "Gagal membuat pembelian", error: err.message });
  }
}

// GET /api/pembeli/pembelian — riwayat pembelian milik pembeli login
async function listMyPembelian(req, res) {
  try {
    const data = await findPembelianByPembeliIdWithDetail(req.user.id);
    res.status(200).json({ message: "OK", data });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil riwayat pembelian", error: err.message });
  }
}

// GET /api/pembeli/pembelian/:id — detail satu pembelian, hanya milik sendiri
async function getMyPembelianById(req, res) {
  try {
    const pembelian = await findPembelianByIdAndPembeliId(req.params.id, req.user.id);
    if (!pembelian) return res.status(404).json({ message: "Pembelian tidak ditemukan" });
    res.status(200).json({ message: "OK", data: pembelian });
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil pembelian", error: err.message });
  }
}

module.exports = {
  registerUser, loginUser, getMyProfile, updateMyProfile,
  listProduk, getProdukById, listArtikelPublik, getArtikelPublikById,
  getDashboard, createPembelian, listMyPembelian, getMyPembelianById,
};