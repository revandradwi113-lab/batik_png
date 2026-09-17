// Model untuk tabel artikel (Supabase)
const supabase = require("../config/db");

// Ambil semua artikel
async function findAllArtikel() {
  const { data, error } = await supabase
    .from("artikel")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Hitung total artikel
async function countArtikel() {
  const { count, error } = await supabase
    .from("artikel")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
}

// Ambil satu artikel by id
async function findArtikelById(id) {
  const { data, error } = await supabase
    .from("artikel")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // tidak ditemukan
    throw error;
  }
  return data;
}

// Tambah artikel baru, return id
async function insertArtikel(data) {
  const { judul, ringkasan, isi, gambar } = data;

  const { data: result, error } = await supabase
    .from("artikel")
    .insert([{ judul, ringkasan, isi, gambar }])
    .select("id")
    .single();

  if (error) throw error;
  return result.id;
}

// Update artikel by id, return true/false
async function updateArtikel(id, data) {
  const { judul, ringkasan, isi, gambar } = data;

  const { data: result, error } = await supabase
    .from("artikel")
    .update({ judul, ringkasan, isi, gambar })
    .eq("id", id)
    .select();

  if (error) throw error;
  return result.length > 0 ? 1 : 0;
}

// Hapus artikel by id, return true/false
async function deleteArtikel(id) {
  const { data, error } = await supabase
    .from("artikel")
    .delete()
    .eq("id", id)
    .select();

  if (error) throw error;
  return data.length > 0 ? 1 : 0;
}

module.exports = {
  findAllArtikel,
  countArtikel,
  findArtikelById,
  insertArtikel,
  updateArtikel,
  deleteArtikel,
};