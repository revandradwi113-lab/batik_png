// Middleware autentikasi, otorisasi role, dan upload gambar
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// Cek token JWT dari header Authorization: Bearer <token>
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Simpan payload token ({ id, role }) ke req.user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid atau kedaluwarsa" });
  }
}

// Batasi akses berdasarkan role, dipanggil setelah authenticate
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Akses ditolak" });
    }
    next();
  };
}

// Konfigurasi penyimpanan file gambar (produk/artikel) ke uploads/images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads", "images"));
  },
  filename: (req, file, cb) => {
    const unik = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unik);
  },
});

// Hanya terima file gambar
function fileFilter(req, file, cb) {
  const validExt = /jpeg|jpg|png|webp/;
  const isValid = validExt.test(path.extname(file.originalname).toLowerCase());
  if (isValid) return cb(null, true);
  cb(new Error("File harus berupa gambar (jpg, jpeg, png, webp)"));
}

// Middleware upload single file dari field "gambar", maks 5MB
const middlewareUploadGambar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("gambar");

// Kirim response JSON berisi path gambar yang sudah diupload
function sendHasilUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Gambar tidak ditemukan" });
  }
  res.status(200).json({
    message: "Upload berhasil",
    path: `/uploads/images/${req.file.filename}`,
  });
}

module.exports = { authenticate, requireRole, middlewareUploadGambar, sendHasilUpload };