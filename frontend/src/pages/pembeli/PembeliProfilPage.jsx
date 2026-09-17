import { useEffect, useState } from "react";
import { useFetch } from "../../hooks";
import { api } from "../../api";
import { KELAMIN } from "../../constants";

const kosong = {
  nama_d: "",
  nama_b: "",
  kelamin: "",
  lahir: "",
  alamat: "",
  phone: "",
  email: "",
  uname: "",
  passwd_lama: "",
  passwd_baru: "",
};

export default function PembeliProfilPage() {
  const { data: profil, loading, error: loadError } = useFetch("/users/me");
  const [form, setForm] = useState(kosong);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Isi form begitu data profil selesai diambil
  useEffect(() => {
    if (profil) {
      setForm({
        nama_d: profil.nama_d || "",
        nama_b: profil.nama_b || "",
        kelamin: profil.kelamin || "",
        lahir: profil.lahir ? profil.lahir.slice(0, 10) : "",
        alamat: profil.alamat || "",
        phone: profil.phone || "",
        email: profil.email || "",
        uname: profil.uname || "",
        passwd_lama: "",
        passwd_baru: "",
      });
    }
  }, [profil]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSukses("");
    setSubmitting(true);
    try {
      await api.put("/users/me", form);
      setSukses("Profil berhasil diperbarui.");
      setForm({ ...form, passwd_lama: "", passwd_baru: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-muted">Memuat profil...</p>;
  if (loadError) return <p className="text-danger">{loadError}</p>;

  return (
    <div className="container-fluid ms-5" style={{ maxWidth: "560px" }}>
      <h2 className="fs-3">Profil Saya</h2>

      <div className="fg-form-card">
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {sukses && <div className="alert alert-success py-2">{sukses}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nama Depan</label>
              <input type="text" name="nama_d" className="form-control" value={form.nama_d} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Nama Belakang</label>
              <input type="text" name="nama_b" className="form-control" value={form.nama_b} onChange={handleChange} required />
            </div>

            <div className="col-md-6">
              <label className="form-label">Jenis Kelamin</label>
              <select name="kelamin" className="form-select" value={form.kelamin} onChange={handleChange} required>
                {KELAMIN.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Tanggal Lahir</label>
              <input type="date" name="lahir" className="form-control" value={form.lahir} onChange={handleChange} required />
            </div>

            <div className="col-12">
              <label className="form-label">Alamat</label>
              <textarea name="alamat" className="form-control" rows="2" value={form.alamat} onChange={handleChange} required />
            </div>

            <div className="col-md-6">
              <label className="form-label">No. HP</label>
              <input type="tel" name="phone" className="form-control" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
            </div>

            <div className="col-12">
              <label className="form-label">Username</label>
              <input type="text" name="uname" className="form-control" value={form.uname} onChange={handleChange} required />
            </div>
          </div>

          <hr className="my-4" />
          <p className="small text-muted mb-3">Ganti password (opsional, isi keduanya kalau ingin ganti)</p>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Password Lama</label>
              <input type="password" name="passwd_lama" className="form-control" value={form.passwd_lama} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Password Baru</label>
              <input type="password" name="passwd_baru" className="form-control" value={form.passwd_baru} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-fg-primary w-100 mt-4" disabled={submitting}>
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
}
