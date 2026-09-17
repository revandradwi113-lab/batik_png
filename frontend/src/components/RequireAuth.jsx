import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Bungkus route yang wajib login. Kalau prop `role` diisi, halaman hanya bisa
// diakses oleh user dengan role tsb — role lain dilempar ke beranda.
export default function RequireAuth({ role, children }) {
  const { isLoggedIn, role: userRole } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}
