import { Link, NavLink, useNavigate } from "react-router-dom";
import { SITE, PUBLIC_NAV } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

// Navigasi utama untuk halaman publik.
// overlay=true -> navbar transparan, melayang di atas foto hero (khusus Home)
export default function Navbar({ overlay = false }) {
  const { isLoggedIn, role, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const akunHref = role === "admin" ? "/admin" : "/akun";

  return (
    <nav className={`navbar navbar-expand-md fg-navbar py-3 ${overlay ? "fg-navbar--overlay" : ""}`}>
      <div className="container">
        <Link className="navbar-brand" to="/">
           {SITE.nama_toko}
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#fgNavContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="fgNavContent">
          <ul className="navbar-nav mx-md-auto gap-md-2">
              {PUBLIC_NAV.map((item) => (
              <li className="nav-item" key={item.to}>
                <NavLink className="nav-link" to={item.to} end={item.end}>
                  {item.label}
                </NavLink>
              </li>
            ))}
            {/* Keranjang hanya tampil untuk pembeli yang sudah login */}
            {isLoggedIn && role === "pembeli" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/akun/keranjang">
                  Keranjang
                  {totalItems > 0 && (
                    <span className="badge rounded-pill bg-danger ms-1">
                      {totalItems}
                    </span>
                  )}
                </NavLink>
              </li>
            )}
          </ul>

          {isLoggedIn ? (
            <div className="d-flex gap-2">
              <Link className="btn btn-fg-outline btn-sm" to={akunHref}>
                {role === "admin" ? "Admin" : "Akun Saya"}
              </Link>
              <button className="btn btn-fg-primary btn-sm" onClick={handleLogout}>
                Keluar
              </button>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <Link className="btn btn-fg-outline btn-sm" to="/login">
                Masuk
              </Link>
              <Link className="btn btn-fg-primary btn-sm" to="/daftar">
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
