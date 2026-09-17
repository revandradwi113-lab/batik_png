-- Jalankan sekali di database (MySQL):
--   mysql -u USER -p NAMA_DB < migration_add_jumlah.sql
--
-- Menambah kolom jumlah supaya 1 baris pesanan bisa berisi qty > 1
-- (misalnya beli 5 batik = 1 baris, jumlah=5)

ALTER TABLE pembelian
  ADD COLUMN jumlah INT NOT NULL DEFAULT 1 AFTER id_produk;
