// Routing khusus admin, semua wajib login + role admin
const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middlewares");
const { getMyProfile, updateMyProfile } = require("../controllers/usersController");
const adminController = require("../controllers/adminController");

// Semua route di bawah ini wajib admin
router.use(authenticate, requireRole("admin"));

// Profil admin sendiri
router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);

// Statistik dashboard admin
router.get("/stats", adminController.getStats);

// Laporan penjualan (opsional ?from=YYYY-MM-DD&to=YYYY-MM-DD)
router.get("/laporan", adminController.getLaporan);

// Kelola pembeli
router.get("/pembeli", adminController.getAllPembeli);
router.get("/users/:id", adminController.getUserById);
router.post("/users", adminController.createUserByAdmin);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

// CRUD produk
router.get("/produk", adminController.listProduk);
router.get("/produk/:id", adminController.getProdukById);
router.post("/produk", adminController.createProduk);
router.put("/produk/:id", adminController.updateProduk);
router.delete("/produk/:id", adminController.deleteProduk);

// Kelola pembelian
router.get("/pembelian", adminController.listPembelian);
router.get("/pembelian/:id", adminController.getPembelianById);
router.put("/pembelian/:id", adminController.updatePembelian);
router.delete("/pembelian/:id", adminController.deletePembelian);

// CRUD artikel
router.get("/artikel", adminController.getAllArtikel);
router.get("/artikel/:id", adminController.getArtikelById);
router.post("/artikel", adminController.createArtikel);
router.put("/artikel/:id", adminController.updateArtikel);
router.delete("/artikel/:id", adminController.deleteArtikel);

// Upload gambar (produk/artikel)
router.post("/upload-gambar", adminController.uploadGambar);

module.exports = router;