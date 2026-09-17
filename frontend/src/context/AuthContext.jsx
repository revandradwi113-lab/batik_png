import { createContext, useCallback, useContext, useState } from "react";

const AuthContext = createContext(null);

// Token JWT dari backend isinya { id, role, iat, exp } (lihat controllers/usersController.js).
// Di-decode di frontend (tanpa library tambahan) supaya tahu role user tanpa fetch /me dulu.
function decodeToken(token) {
  try {
    const payloadB64 = token.split(".")[1];
    const normalized = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [payload, setPayload] = useState(() => {
    const saved = localStorage.getItem("token");
    return saved ? decodeToken(saved) : null;
  });

  // Simpan token baru (dipanggil setelah login berhasil). Return payload yang sudah
  // di-decode supaya pemanggil (LoginPage) bisa langsung tahu role untuk redirect.
  const login = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    const decoded = decodeToken(newToken);
    setToken(newToken);
    setPayload(decoded);
    return decoded;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setPayload(null);
  }, []);

  const value = {
    token,
    role: payload?.role || null,
    userId: payload?.id || null,
    isLoggedIn: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Dipakai di komponen mana pun untuk baca status login/role atau login()/logout()
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  }
  return ctx;
}
