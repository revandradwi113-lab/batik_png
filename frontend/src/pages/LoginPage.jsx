import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicPage from "../components/layout/PublicPage";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState({ credential: "", passwd: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/users/login", form);
      const decoded = login(res.token);
      navigate(decoded?.role === "admin" ? "/admin" : "/akun");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicPage>
      <div className="container py-5" style={{ maxWidth: "440px" }}>
        <h2 className=" text-center">Masuk</h2>

        <div className="fg-form-card">
          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username / Email</label>
              <input
                type="text"
                name="credential"
                className="form-control"
                value={form.credential}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>
            <div className="mb-3">
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

            <button type="submit" className="btn btn-fg-primary w-100" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="text-center small mt-3 mb-0">
            Belum punya akun? <Link to="/daftar">Daftar di sini</Link>
          </p>
        </div>
      </div>
    </PublicPage>
  );
}
