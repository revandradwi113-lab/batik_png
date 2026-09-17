import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicPage from "../components/layout/PublicPage";
import { api } from "../api";
import { KELAMIN } from "../constants";

const initialForm = {
  nama_d: "",
  nama_b: "",
  kelamin: "",
  lahir: "",
  alamat: "",
  phone: "",
  email: "",
  uname: "",
  passwd: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.nama_d?.trim() || !form.nama_b?.trim()) {
      setError("Nama depan dan belakang wajib diisi");
      return;
    }
    if (!form.email?.includes("@")) {
      setError("Email tidak valid");
      return;
    }
    const phone = String(form.phone || "").replace(/\D/g, "");
    if (phone.length < 10) {
      setError("Nomor telepon minimal 10 digit");
      return;
    }
    if (!form.uname || form.uname.length < 4) {
      setError("Username minimal 4 karakter");
      return;
    }
    if (!form.passwd || form.passwd.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    try {
      await api.post("/users/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicPage>
      <div className="container py-5" style={{ maxWidth: "560px" }}>
        <h2 className="fs-3 text-center">Daftar Akun</h2>

        <div className="fg-form-card">
          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nama Depan</label>
                <input
                  type="text"
                  name="nama_d"
                  className="form-control"
                  value={form.nama_d}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Nama Belakang</label>
                <input
                  type="text"
                  name="nama_b"
                  className="form-control"
                  value={form.nama_b}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Jenis Kelamin</label>
                <select
                  name="kelamin"
                  className="form-select"
                  value={form.kelamin}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Pilih...
                  </option>
                  {KELAMIN.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Tanggal Lahir</label>
                <input
                  type="date"
                  name="lahir"
                  className="form-control"
                  value={form.lahir}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Alamat</label>
                <textarea
                  name="alamat"
                  className="form-control"
                  rows="2"
                  value={form.alamat}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">No. HP</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="uname"
                  className="form-control"
                  value={form.uname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="passwd"
                  className="form-control"
                  value={form.passwd}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-fg-primary w-100 mt-4" disabled={loading}>
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>

          <p className="text-center small mt-3 mb-0">
            Sudah punya akun? <Link to="/login">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </PublicPage>
  );
}
