// Custom hooks yang dipakai berulang di berbagai halaman
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";
import { useAuth } from "./context/AuthContext";

// Ambil data dari satu endpoint, kembalikan { data, loading, error }
// deps dipakai supaya fetch ulang saat parameter (misal :id) berubah
export function useFetch(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(path)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

// Dipakai di halaman admin: kalau request kena 401/403 (token invalid/expired
// atau bukan admin), otomatis logout + redirect ke /login. Return { handleError }
// — panggil di .catch() tiap request; return true kalau errornya sudah ditangani
// (redirect), false kalau bukan error auth (biar caller tampilkan pesannya sendiri).
export function useAdminGuard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleError = useCallback(
    (err) => {
      if (err?.status === 401 || err?.status === 403) {
        logout();
        navigate("/login", { replace: true });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  return { handleError };
}

// Ambil daftar data dari salah satu method adminApi (mis. adminApi.getProduk).
// Kembalikan { rows, loading, error, reload } — reload dipanggil manual
// setelah create/update/delete supaya tabel refresh.
export function useAdminList(fetchFn) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    fetchFn()
      .then((res) => {
        if (alive) setRows(res.data || []);
      })
      .catch((err) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { rows, loading, error, reload };
}

// Catatan: useAuth() ada di src/context/AuthContext.jsx (butuh tahu
// role user dari token, bukan cuma status login), import dari sana.
