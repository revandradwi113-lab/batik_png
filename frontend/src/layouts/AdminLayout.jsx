/**
 * AdminLayout — sidebar + topbar + Outlet untuk /admin/*.
 */
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import { adminApi } from '../api';
import { useAdminGuard } from '../hooks';
import { mediaUrl } from '../utils';

const TITLES = {
  '/admin': 'Dashboard',
  '/admin/produk': 'Kelola Produk',
  '/admin/pembeli': 'Kelola Pembeli',
  '/admin/pembelian': 'Kelola Pesanan',
  '/admin/artikel': 'Kelola Artikel',
  '/admin/profil': 'Profil Admin',
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminFoto, setAdminFoto] = useState('');
  const location = useLocation();
  const { handleError } = useAdminGuard();
  const title = TITLES[location.pathname] || 'Panel Admin';

  useEffect(() => {
    let alive = true;
    adminApi
      .getMe()
      .then((r) => {
        if (!alive) return;
        const p = r.data;
        setAdminName(`${p.nama_d || ''} ${p.nama_b || ''}`.trim() || p.uname);
        setAdminFoto(p.foto || '');
      })
      .catch((err) => {
        if (alive) handleError(err);
      });
    return () => {
      alive = false;
    };
  }, [handleError, location.pathname]);

  return (
    <div className="admin-shell">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-btn"
            aria-label="Menu"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <h1 className="admin-page-title">{title}</h1>
          <div className="admin-topbar-user">
            {adminFoto ? (
              <img
                src={mediaUrl(adminFoto)}
                alt=""
                width={32}
                height={32}
                className="admin-thumb admin-thumb--avatar admin-topbar-avatar"
              />
            ) : (
              <div className="admin-thumb admin-thumb--avatar admin-topbar-avatar admin-avatar-fallback" aria-hidden>
                👤
              </div>
            )}
            <span className="admin-topbar-name text-secondary small">{adminName}</span>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}