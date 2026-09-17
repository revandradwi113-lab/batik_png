// Model untuk tabel pembelian (Supabase)
const supabase = require("../config/db");

// PENTING: kolom "status" di tabel pembelian bertipe ENUM (status_pembelian_enum),
// bukan text/varchar. Operator ILIKE (.ilike()) TIDAK bisa dipakai ke kolom enum,
// makanya sebelumnya muncul error "operator does not exist: status_pembelian_enum ~~* unknown".
// Solusinya: pakai .eq() dengan value yang PERSIS SAMA (termasuk huruf besar/kecil)
// dengan salah satu value yang ada di enum tersebut.
//
// Cek value enum yang valid lewat Supabase SQL editor:
//   SELECT enum_range(NULL::status_pembelian_enum);
// Lalu sesuaikan konstanta di bawah ini persis sama case-nya.
const STATUS_SELESAI = "selesai"; // <-- GANTI sesuai value asli di enum kalau berbeda

// Ambil semua pembelian + detail pembeli & produk (untuk admin)
async function findAllPembelianWithDetail() {
  const { data, error } = await supabase
    .from("pembelian")
    .select(`
      *,
      users:id_pembeli ( nama_d, nama_b, email, uname ),
      produk:id_produk ( nama_produk, harga, gambar )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Rapikan hasil biar mirip query lama
  return data.map((row) => ({
    ...row,
    nama_pembeli: row.users ? `${row.users.nama_d} ${row.users.nama_b}` : null,
    email_pembeli: row.users?.email || null,
    uname_pembeli: row.users?.uname || null,
    nama_produk: row.produk?.nama_produk || null,
    harga: row.produk?.harga || null,
    gambar_produk: row.produk?.gambar || null,
    users: undefined,
    produk: undefined,
  }));
}

// Ambil satu pembelian berdasarkan ID
async function findPembelianById(id) {
  const { data, error } = await supabase
    .from("pembelian")
    .select(`
      *,
      users:id_pembeli ( nama_d, nama_b, email, uname ),
      produk:id_produk ( nama_produk, harga, gambar )
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return {
    ...data,
    nama_pembeli: data.users ? `${data.users.nama_d} ${data.users.nama_b}` : null,
    email_pembeli: data.users?.email || null,
    uname_pembeli: data.users?.uname || null,
    nama_produk: data.produk?.nama_produk || null,
    harga: data.produk?.harga || null,
    gambar_produk: data.produk?.gambar || null,
    users: undefined,
    produk: undefined,
  };
}

// Tambah pembelian baru
async function insertPembelian(data) {
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

  const { data: result, error } = await supabase
    .from("pembelian")
    .insert([{
      id_pembeli,
      id_produk,
      jumlah: qty,
      nama_pembeli,
      alamat_pembeli,
      phone_pembeli,
      metode_pembayaran,
      pengiriman,
      catatan,
    }])
    .select("id")
    .single();

  if (error) throw error;
  return result.id;
}

// Update pembelian
async function updatePembelian(id, data) {
  const { pembayaran, status, catatan, foto_bukti } = data;

  const { data: result, error } = await supabase
    .from("pembelian")
    .update({ pembayaran, status, catatan, foto_bukti })
    .eq("id", id)
    .select();

  if (error) throw error;
  return result.length > 0 ? 1 : 0;
}

// Hapus pembelian
async function deletePembelian(id) {
  const { data, error } = await supabase
    .from("pembelian")
    .delete()
    .eq("id", id)
    .select();

  if (error) throw error;
  return data.length > 0 ? 1 : 0;
}

// Riwayat pembelian milik pembeli
async function findPembelianByPembeliIdWithDetail(idPembeli) {
  const { data, error } = await supabase
    .from("pembelian")
    .select(`
      *,
      produk:id_produk ( nama_produk, harga, gambar )
    `)
    .eq("id_pembeli", idPembeli)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((row) => ({
    ...row,
    nama_produk: row.produk?.nama_produk || null,
    harga: row.produk?.harga || null,
    gambar: row.produk?.gambar || null,
    produk: undefined,
  }));
}

// Ambil pembelian berdasarkan ID dan ID pembeli
async function findPembelianByIdAndPembeliId(id, idPembeli) {
  const { data, error } = await supabase
    .from("pembelian")
    .select(`
      *,
      produk:id_produk ( nama_produk, harga, gambar )
    `)
    .eq("id", id)
    .eq("id_pembeli", idPembeli)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return {
    ...data,
    nama_produk: data.produk?.nama_produk || null,
    harga: data.produk?.harga || null,
    gambar: data.produk?.gambar || null,
    produk: undefined,
  };
}

// Statistik pembelian milik satu pembeli
async function getStatsByPembeliId(idPembeli) {
  const { data, error } = await supabase
    .from("pembelian")
    .select("status")
    .eq("id_pembeli", idPembeli);

  if (error) throw error;

  const result = {};
  data.forEach((row) => {
    const status = row.status || "unknown";
    result[status] = (result[status] || 0) + 1;
  });

  return Object.entries(result).map(([status, total]) => ({ status, total }));
}

// Statistik pembelian keseluruhan
async function getAdminStats() {
  const { data, error } = await supabase
    .from("pembelian")
    .select("status");

  if (error) throw error;

  const result = {};
  data.forEach((row) => {
    const status = row.status || "unknown";
    result[status] = (result[status] || 0) + 1;
  });

  return Object.entries(result).map(([status, total]) => ({ status, total }));
}

// Pesanan selesai tetapi belum dibayar
async function countTerjualBelumBayar() {
  const { count, error } = await supabase
    .from("pembelian")
    .select("*", { count: "exact", head: true })
    .eq("status", STATUS_SELESAI)
    .or("pembayaran.ilike.%belum bayar%,pembayaran.ilike.%belum%");

  if (error) throw error;
  return count || 0;
}

// Total semua transaksi
async function countTransaksi() {
  const { count, error } = await supabase
    .from("pembelian")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
}

// Total produk terjual
async function countProdukTerjual() {
  const { data, error } = await supabase
    .from("pembelian")
    .select("jumlah")
    .eq("status", STATUS_SELESAI);

  if (error) throw error;
  return data.reduce((sum, row) => sum + (row.jumlah || 1), 0);
}

// Pesanan yang masih aktif
async function countPesananAktif() {
  const { count, error } = await supabase
    .from("pembelian")
    .select("*", { count: "exact", head: true })
    .not("status", "eq", STATUS_SELESAI);

  if (error) throw error;
  return count || 0;
}

// Total pendapatan (status selesai)
async function sumPendapatanDibayar() {
  const { data, error } = await supabase
    .from("pembelian")
    .select(`
      jumlah,
      produk:id_produk ( harga )
    `)
    .eq("status", STATUS_SELESAI);

  if (error) throw error;

  return data.reduce((sum, row) => {
    const harga = row.produk?.harga || 0;
    const qty = row.jumlah || 1;
    return sum + harga * qty;
  }, 0);
}

// Pembelian terbaru
async function getRecentPembelian(limit = 5) {
  const { data, error } = await supabase
    .from("pembelian")
    .select(`
      *,
      users:id_pembeli ( nama_d, nama_b ),
      produk:id_produk ( nama_produk )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data.map((row) => ({
    ...row,
    nama_pembeli: row.users ? `${row.users.nama_d} ${row.users.nama_b}` : null,
    nama_produk: row.produk?.nama_produk || null,
    users: undefined,
    produk: undefined,
  }));
}

// Laporan admin (sederhana dulu)
async function getLaporanSummary(fromDate, toDate) {
  let query = supabase
    .from("pembelian")
    .select(`
      *,
      produk:id_produk ( id_produk, nama_produk, harga, gambar )
    `);

  if (fromDate) query = query.gte("created_at", fromDate);
  if (toDate) query = query.lte("created_at", toDate + "T23:59:59");

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;

  const total_transaksi = data.length;
  let total_pendapatan = 0;
  let pendapatan_dibayar = 0;
  const byStatus = {};
  const produkMap = {};

  data.forEach((row) => {
    // row.status adalah value enum asli (case-sensitive), dipakai apa adanya untuk perbandingan exact
    const status = row.status || "";
    const pembayaran = (row.pembayaran || "").toLowerCase().trim();
    const harga = row.produk?.harga || 0;
    const qty = row.jumlah || 1;
    const subtotal = harga * qty;

    byStatus[status] = (byStatus[status] || 0) + 1;

    if (status === STATUS_SELESAI) {
      total_pendapatan += subtotal;
    }

    if (["sudah bayar", "dibayar", "lunas"].includes(pembayaran) || pembayaran.includes("sudah")) {
      pendapatan_dibayar += subtotal;
    }

    const pid = row.produk?.id_produk;
    if (pid) {
      if (!produkMap[pid]) {
        produkMap[pid] = {
          id_produk: pid,
          nama_produk: row.produk.nama_produk,
          harga: row.produk.harga,
          gambar: row.produk.gambar,
          terjual: 0,
          omzet: 0,
        };
      }
      produkMap[pid].terjual += 1;
      produkMap[pid].omzet += subtotal;
    }
  });

  const top_produk = Object.values(produkMap)
    .sort((a, b) => b.terjual - a.terjual)
    .slice(0, 10);

  return {
    total_transaksi,
    total_pendapatan,
    pendapatan_dibayar,
    by_status: Object.entries(byStatus).map(([status, total]) => ({ status, total })),
    top_produk,
    per_bulan: [], // bisa ditambah nanti
  };
}

// Pesanan terbaru milik satu pembeli
async function getRecentByPembeliId(idPembeli, limit = 5) {
  const { data, error } = await supabase
    .from("pembelian")
    .select(`
      id, status, pembayaran, created_at,
      produk:id_produk ( nama_produk, harga, gambar )
    `)
    .eq("id_pembeli", idPembeli)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data.map((row) => ({
    ...row,
    nama_produk: row.produk?.nama_produk || null,
    harga: row.produk?.harga || null,
    gambar: row.produk?.gambar || null,
    produk: undefined,
  }));
}

// Total belanja pembeli yang sudah dibayar
async function sumBelanjaDibayarByPembeli(idPembeli) {
  const { data, error } = await supabase
    .from("pembelian")
    .select(`
      jumlah,
      pembayaran,
      produk:id_produk ( harga )
    `)
    .eq("id_pembeli", idPembeli);

  if (error) throw error;

  return data.reduce((sum, row) => {
    const bayar = (row.pembayaran || "").toLowerCase().trim();
    if (["sudah bayar", "dibayar", "lunas", "paid"].includes(bayar) || bayar.includes("sudah")) {
      const harga = row.produk?.harga || 0;
      const qty = row.jumlah || 1;
      return sum + harga * qty;
    }
    return sum;
  }, 0);
}

// Jumlah pesanan belum dibayar milik pembeli
async function countBelumBayarByPembeli(idPembeli) {
  const { count, error } = await supabase
    .from("pembelian")
    .select("*", { count: "exact", head: true })
    .eq("id_pembeli", idPembeli)
    .or("pembayaran.is.null,pembayaran.eq.,pembayaran.ilike.%belum%");

  if (error) throw error;
  return count || 0;
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