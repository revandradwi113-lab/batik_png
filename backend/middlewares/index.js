// Middleware autentikasi, otorisasi role, dan upload gambar
const jwt = require("jsonwebtoken");
const multer = require("multer");
const supabase = require("../config/db");

const BUCKET_NAME = "produk-images";

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

// Simpan file di memory (buffer) dulu, BUKAN di disk lokal.
// Vercel serverless function filesystem-nya read-only, jadi diskStorage tidak bisa dipakai.
const storage = multer.memoryStorage();

// Hanya terima file gambar
function fileFilter(req, file, cb) {
  const validMime = /image\/(jpeg|jpg|png|webp)/;
  const isValid = validMime.test(file.mimetype);
  if (isValid) return cb(null, true);
  cb(new Error("File harus berupa gambar (jpg, jpeg, png, webp)"));
}

// Middleware upload single file dari field "gambar", maks 5MB
const middlewareUploadGambar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("gambar");

// Upload buffer ke Supabase Storage, lalu kirim response berisi public URL
async function sendHasilUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Gambar tidak ditemukan" });
    }

    const ext = req.file.originalname.split(".").pop();
    const namaUnik = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(namaUnik, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("[upload-gambar]", uploadError.message);
      return res.status(500).json({ message: "Gagal upload gambar", error: uploadError.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(namaUnik);

    res.status(200).json({
      message: "Upload berhasil",
      path: publicUrlData.publicUrl,
    });
  } catch (err) {
    console.error("[upload-gambar]", err.message);
    res.status(500).json({ message: "Gagal upload gambar", error: err.message });
  }
}

module.exports = { authenticate, requireRole, middlewareUploadGambar, sendHasilUpload };