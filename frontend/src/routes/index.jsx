/**
 * routes/index.jsx — daftar Route aplikasi (dipisah dari App.jsx).
 */
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "../components/RequireAuth";
import AdminLayout from "../layouts/AdminLayout";
import PembeliLayout from "../layouts/PembeliLayout";

import HomePage from "../pages/HomePage";
import TokoPage from "../pages/TokoPage";
import ArtikelListPage from "../pages/ArtikelListPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import ArtikelDetailPage from "../pages/ArtikelDetailPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import CartPage from "../pages/CartPage";

import PembeliOverviewPage from "../pages/pembeli/PembeliOverviewPage";
import PembeliBelanjaPage from "../pages/pembeli/PembeliBelanjaPage";
import PembeliPesananPage from "../pages/pembeli/PembeliPesananPage";
import PembeliProfilPage from "../pages/pembeli/PembeliProfilPage";

import AdminOverviewPage from "../pages/admin/AdminOverviewPage";
import AdminProdukPage from "../pages/admin/AdminProdukPage";
import AdminPembeliPage from "../pages/admin/AdminPembeliPage";
import AdminPembelianPage from "../pages/admin/AdminPembelianPage";
import AdminLaporanPage from "../pages/admin/AdminLaporanPage";
import AdminArtikelPage from "../pages/admin/AdminArtikelPage";
import AdminProfilPage from "../pages/admin/AdminProfilPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/toko" element={<TokoPage />} />
      <Route path="/artikel" element={<ArtikelListPage />} />
      <Route path="/produk/:id" element={<ProductDetailPage />} />
      <Route path="/artikel/:id" element={<ArtikelDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/daftar" element={<RegisterPage />} />

      <Route
        path="/admin"
        element={
          <RequireAuth role="admin">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="produk" element={<AdminProdukPage />} />
        <Route path="pembeli" element={<AdminPembeliPage />} />
        <Route path="pembelian" element={<AdminPembelianPage />} />
        <Route path="laporan" element={<AdminLaporanPage />} />
        <Route path="artikel" element={<AdminArtikelPage />} />
        <Route path="profil" element={<AdminProfilPage />} />
      </Route>

      <Route
        path="/akun"
        element={
          <RequireAuth role="pembeli">
            <PembeliLayout />
          </RequireAuth>
        }
      >
        <Route index element={<PembeliOverviewPage />} />
        <Route path="belanja" element={<PembeliBelanjaPage />} />
        <Route path="keranjang" element={<CartPage />} />
        <Route path="pesanan" element={<PembeliPesananPage />} />
        <Route path="profil" element={<PembeliProfilPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
