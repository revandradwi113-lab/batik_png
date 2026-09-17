/**
 * AdminSidebar — menu panel admin; nama/logo dari SITE (constants.js).
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SITE } from '../../constants';
import { mediaUrl } from '../../utils';

const MENU = [
  { to: '/admin', end: true, label: 'Dashboard', icon: '◫' },
  { to: '/admin/produk', label: 'Produk', icon: '▣' },
  { to: '/admin/pembeli', label: 'Pembeli', icon: '◎' },
  { to: '/admin/pembelian', label: 'Pesanan', icon: '▤' },
  { to: '/admin/laporan', label: 'Laporan', icon: '▦' },
  { to: '/admin/artikel', label: 'Artikel', icon: '▥' },
  { to: '/admin/profil', label: 'Profil Admin', icon: '◉' },
];

export default function AdminSidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const namaToko = SITE.nama_toko?.trim() || 'Nama toko';

  const onLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      <div
        className={`admin-sidebar-backdrop ${open ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden
      />
      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          {SITE.logo_toko ? (
            <img
              src={mediaUrl(SITE.logo_toko)}
              alt=""
              className="admin-sidebar-logo-img"
              width={40}
              height={40}
            />
          ) : (
            <div className="admin-sidebar-logo-fallback" aria-hidden>
             BA
            </div>
          )}
          <div>
            <strong>Panel Admin</strong>
            <small>{namaToko}</small>
          </div>
        </div>

        <nav className="admin-nav">
          {MENU.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="admin-nav-icon" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <a href="/" className="admin-nav-link" target="_blank" rel="noreferrer">
            Lihat beranda
          </a>
          <button type="button" className="admin-nav-link admin-nav-logout" onClick={onLogout}>
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}