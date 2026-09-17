// Koneksi ke database MySQL pakai pool (mysql2)
require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Tes koneksi saat file ini dipanggil pertama kali
pool.getConnection()
  .then((conn) => {
    console.log("Mysql connected");
    conn.release();
  })
  .catch((err) => {
    console.error("Mysql gagal konek:", err.message);
  });

module.exports = pool;