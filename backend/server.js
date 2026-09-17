// Load variabel dari .env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

// Panggil koneksi database (tes konek saat server start)
require("./config/db");

const usersRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");

const app = express();

// Middleware dasar
app.use(cors());
app.use(express.json());

// Sajikan file di folder uploads lewat URL /uploads/...
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routing users (register, login)
app.use("/api/users", usersRoutes);

// Routing admin
app.use("/api/admin", adminRoutes);

// Endpoint cek server hidup
app.get("/", (req, res) => {
  res.send("API jalan");
});

// Jalankan server sesuai PORT di .env
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});