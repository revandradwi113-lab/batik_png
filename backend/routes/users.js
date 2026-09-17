// Routing untuk autentikasi user + akses publik + area khusus pembeli
const express = require("express");
const router = express.Router();
const { authenticate, requireRole, middlewareUploadGambar, sendHasilUpload } = require("../middlewares");
const {
  registerUser,
  loginUser,
  getMyProfile,
  updateMyProfile,
  listProduk,
  getProdukById,
  listArtikelPublik,
  getArtikelPublikById,
  getDashboard,
  createPembelian,
  listMyPembelian,
  getMyPembelianById,
} = require("../controllers/usersController");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Akses publik, tanpa login
router.get("/produk", listProduk);
router.get("/produk/:id_produk", getProdukById);
router.get("/artikel", listArtikelPublik);
router.get("/artikel/:id", getArtikelPublikById);

// Area khusus pembeli, wajib login + role pembeli
router.get("/me", authenticate, requireRole("pembeli"), getMyProfile);
router.put("/me", authenticate, requireRole("pembeli"), updateMyProfile);
router.post("/upload-gambar", authenticate, requireRole("pembeli"), middlewareUploadGambar, sendHasilUpload);
router.get("/dashboard", authenticate, requireRole("pembeli"), getDashboard);
router.post("/pembelian", authenticate, requireRole("pembeli"), createPembelian);
router.get("/pembelian", authenticate, requireRole("pembeli"), listMyPembelian);
router.get("/pembelian/:id", authenticate, requireRole("pembeli"), getMyPembelianById);

module.exports = router;