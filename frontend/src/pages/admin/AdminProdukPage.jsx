/**
 * [buatan] CRUD produk toko.
 * URL: `/admin/produk` — adminApi produk, modal form, ImageUploadField.
 */
import { useState } from 'react';
import { adminApi } from '../../api';
import { useAdminList } from '../../hooks';
import { useAdminGuard } from '../../hooks';
import { KATEGORI_PRODUK } from '../../constants';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import AdminModal from '../../components/admin/AdminModal';
import AdminDetailModal from '../../components/admin/AdminDetailModal';
import AdminRowActions from '../../components/admin/AdminRowActions';
import DetailDl from '../../components/admin/DetailDl';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { formatRupiah } from '../../utils';
import { mediaUrl } from '../../utils';

const empty = { nama_produk: '', deskripsi: '', harga: '', gambar: '', kategori: KATEGORI_PRODUK[0] };

export default function AdminProdukPage() {
  const { handleError } = useAdminGuard();
  const { rows, loading, error, reload } = useAdminList(adminApi.getProduk);
  const [modal, setModal] = useState(null); // null | 'create' | { type: 'edit', id }
  const [detail, setDetail] = useState(null); // baris untuk AdminDetailModal
  const [form, setForm] = useState(empty); // isi form modal tambah/ubah
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');

  // Filter baris berdasarkan nama produk atau kategori (case-insensitive)
  const filteredRows = rows.filter((row) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      row.nama_produk?.toLowerCase().includes(q) ||
      row.kategori?.toLowerCase().includes(q)
    );
  });

  // Buka modal kosong untuk produk baru
  const openCreate = () => {
    setForm(empty);
    setModal('create');
  };

  // Muat detail lengkap lalu tampilkan modal read-only
  const openDetail = async (row) => {
    try {
      const r = await adminApi.getProdukById(row.id_produk);
      setDetail(r.data);
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  // Muat data ke form lalu buka modal edit
  const openEdit = async (row) => {
    setFormError('');
    try {
      const r = await adminApi.getProdukById(row.id_produk);
      const p = r.data;
      setForm({
        nama_produk: p.nama_produk ?? '',
        deskripsi: p.deskripsi ?? '',
        harga: String(p.harga ?? ''),
        gambar: p.gambar || '',
        kategori: p.kategori ?? KATEGORI_PRODUK[0],
      });
      setModal({ type: 'edit', id: row.id_produk });
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  // POST create atau PUT update → tutup modal → reload tabel
  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const payload = { ...form, harga: parseInt(form.harga, 10), gambar: form.gambar || null };
    try {
      if (modal === 'create') await adminApi.createProduk(payload);
      else await adminApi.updateProduk(modal.id, payload);
      setModal(null);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // DELETE setelah konfirmasi browser
  const onDelete = async (id) => {
    if (!window.confirm('Hapus produk ini?')) return;
    try {
      await adminApi.deleteProduk(id);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader
        title="Daftar produk"
        subtitle={search ? `${filteredRows.length} dari ${rows.length} produk` : `${rows.length} produk`}
        action={
          <button type="button" className="btn btn-dark rounded-0" onClick={openCreate}>
            + Produk baru
          </button>
        }
      />
      {(error || formError) && <div className="alert alert-danger">{error || formError}</div>}

      <div className="admin-panel">
        <div className="mb-3" style={{ maxWidth: 320 }}>
          <input
            type="search"
            className="form-control"
            placeholder="Cari nama produk atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="table-responsive">
          <table className="table admin-table mb-0">
            <thead>
              <tr>
                <th>Gambar</th>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th className="col-actions">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-secondary">
                    {search
                      ? `Tidak ada produk yang cocok dengan "${search}".`
                      : 'Belum ada produk. Klik "Produk baru" untuk menambah.'}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id_produk}>
                    <td>
                      <img src={mediaUrl(row.gambar)} alt="" width={48} height={48} className="admin-thumb" />
                    </td>
                    <td>
                      <strong>{row.nama_produk}</strong>
                    </td>
                    <td>{row.kategori}</td>
                    <td>{formatRupiah(row.harga)}</td>
                    <td className="col-actions">
                      <AdminRowActions
                        onDetail={() => openDetail(row)}
                        onEdit={() => openEdit(row)}
                        onDelete={() => onDelete(row.id_produk)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminDetailModal
        show={Boolean(detail)}
        title={detail ? `Detail: ${detail.nama_produk}` : ''}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <>
            <img src={mediaUrl(detail.gambar)} alt="" className="admin-detail-img" />
            <DetailDl
              items={[
                ['ID', detail.id_produk],
                ['Nama', detail.nama_produk],
                ['Kategori', detail.kategori],
                ['Harga', formatRupiah(detail.harga)],
                ['Deskripsi', detail.deskripsi],
              ]}
            />
          </>
        )}
      </AdminDetailModal>

      <AdminModal show={Boolean(modal)} title={modal === 'create' ? 'Tambah produk' : 'Ubah produk'} onClose={() => setModal(null)} wide>
        <form onSubmit={onSave}>
          <div className="mb-3">
            <label className="form-label">Nama produk</label>
            <input className="form-control" value={form.nama_produk} onChange={(e) => setForm({ ...form, nama_produk: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Deskripsi</label>
            <textarea className="form-control" rows={3} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} required />
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Harga (Rp)</label>
              <input type="number" min={0} className="form-control" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Kategori</label>
              <select className="form-select" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
                {KATEGORI_PRODUK.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ImageUploadField
            label="Gambar"
            value={form.gambar}
            onChange={(v) => setForm({ ...form, gambar: v })}
            clearable
          />
          <button type="submit" className="btn btn-dark rounded-0 w-100 mt-2" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      </AdminModal>
    </div>
  );
}