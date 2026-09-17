require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // pakai service_role di backend

const supabase = createClient(supabaseUrl, supabaseKey);

// Tes koneksi sederhana
(async () => {
  try {
    const { data, error } = await supabase.from("users").select("count", { count: "exact", head: true });
    
    if (error) {
      console.log("Supabase connected (tapi tabel belum ada / error):", error.message);
    } else {
      console.log("Supabase connected successfully");
    }
  } catch (err) {
    console.error("Supabase gagal konek:", err.message);
  }
})();

module.exports = supabase;