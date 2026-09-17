// Model untuk tabel users (Supabase)
const supabase = require("../config/db");

// Simpan user baru, return id
async function createUser(data) {
  const {
    nama_d, nama_b, kelamin, lahir, alamat, phone, email, role, uname, passwd, foto,
  } = data;

  const { data: result, error } = await supabase
    .from("users")
    .insert([{
      nama_d, nama_b, kelamin, lahir, alamat, phone,
      email, role, uname, passwd, foto: foto || "",
    }])
    .select("id")
    .single();

  if (error) throw error;
  return result.id;
}

// Cari user berdasarkan email
async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Cari user berdasarkan email ATAU uname (untuk login)
async function findUserByCredential(credential) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .or(`email.eq.${credential},uname.eq.${credential}`)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Ambil profil user by id (tanpa passwd)
async function findUserById(id) {
  const { data, error } = await supabase
    .from("users")
    .select("id, nama_d, nama_b, kelamin, lahir, alamat, phone, email, role, uname, foto, created_at, updated_at")
    .eq("id", id)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Ambil hash passwd by id
async function findPasswdHashById(id) {
  const { data, error } = await supabase
    .from("users")
    .select("passwd")
    .eq("id", id)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? data.passwd : null;
}

// Update profil user
async function updateUserProfile(id, data) {
  const {
    nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname, foto,
  } = data;

  const { data: result, error } = await supabase
    .from("users")
    .update({
      nama_d, nama_b, kelamin, lahir, alamat,
      phone, email, uname, foto,
    })
    .eq("id", id)
    .select();

  if (error) throw error;
  return result.length > 0 ? 1 : 0;
}

// Ambil semua user berdasarkan role
async function findAllUsersByRole(role) {
  const { data, error } = await supabase
    .from("users")
    .select("id, nama_d, nama_b, kelamin, lahir, alamat, phone, email, role, uname, foto, created_at, updated_at")
    .eq("role", role)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Hapus user by id
async function deleteUserById(id) {
  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
    .select();

  if (error) throw error;
  return data.length > 0 ? 1 : 0;
}

// Hitung jumlah user berdasarkan role
async function countByRole(role) {
  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", role);

  if (error) throw error;
  return count || 0;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserByCredential,
  findUserById,
  findPasswdHashById,
  updateUserProfile,
  findAllUsersByRole,
  deleteUserById,
  countByRole,
};