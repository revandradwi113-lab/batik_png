import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { SITE } from "../constants";
import { mediaUrl } from "../utils";

const MENU_PEMBELI = [
  { to: "/akun", label: "Dashboard", end: true, icon: "bi-grid" },
  { to: "/akun/belanja", label: "Belanja", icon: "bi-bag" },
  { to: "/akun/keranjang", label: "Keranjang", icon: "bi-cart3" },
  { to: "/akun/pesanan", label: "Pesanan Saya", icon: "bi-receipt" },
  { to: "/akun/profil", label: "Profil Saya", icon: "bi-person-circle" },
];

export default function PembeliLayout() {
  const { logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="pb-shell">
      <aside className="pb-sidebar">
        <div className="pb-sidebar-brand">
          {SITE.logo_toko ? (
            <img
              src={mediaUrl(SITE.logo_toko)}
              alt=""
              className="pb-sidebar-logo"
              width={40}
              height={40}
            />
          ) : (
            <div className="pb-sidebar-logo-fallback" aria-hidden>
              BA
            </div>
          )}
          <div>
            <strong>Area Pembeli</strong>
            <small>{SITE.nama_toko || "Toko Batik"}</small>
          </div>
        </div>

        <nav className="pb-nav">
          {MENU_PEMBELI.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.end}
              className={({ isActive }) =>
                `pb-nav-link${isActive ? " active" : ""}`
              }
            >
              <i className={`bi ${m.icon}`} aria-hidden="true"></i>
              {m.label}
              {m.to === "/akun/keranjang" && totalItems > 0 && (
                <span className="pb-nav-badge">{totalItems}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="pb-sidebar-foot">
          <a href="/" className="pb-nav-link pb-nav-muted">
            Lihat beranda toko
          </a>
          <button type="button" className="pb-nav-logout" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </aside>

      <main className="pb-main">
        <Outlet />
      </main>
    </div>
  );
}
