/**
 * [buatan] CRUD artikel blog.
 * URL: `/admin/artikel` — adminApi artikel + upload gambar.
 */
import { useState } from 'react';
import { adminApi } from '../../api';
import { useAdminList } from '../../hooks';
import { useAdminGuard } from '../../hooks';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import AdminModal from '../../components/admin/AdminModal';
import AdminDetailModal from '../../components/admin/AdminDetailModal';
import AdminRowActions from '../../components/admin/AdminRowActions';
import DetailDl from '../../components/admin/DetailDl';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { formatTanggal } from '../../utils';
import { mediaUrl } from '../../utils';

const empty = { judul: '', ringkasan: '', isi: '', gambar: '' };

export default function AdminArtikelPage() {
  const { handleError } = useAdminGuard();
  const { rows, loading, error, reload } = useAdminList(adminApi.getArtikel);
  const [modal, setModal] = useState(null); // null | 'create' | { type: 'edit', id }
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');

  // Filter berdasarkan judul atau ringkasan (case-insensitive)
  const filteredRows = rows.filter((row) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      row.judul?.toLowerCase().includes(q) ||
      row.ringkasan?.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setForm(empty);
    setModal('create');
  };

  const openDetail = async (row) => {
    try {
      const r = await adminApi.getArtikelById(row.id);
      setDetail(r.data);
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  const openEdit = async (row) => {
    setFormError('');
    try {
      const r = await adminApi.getArtikelById(row.id);
      const a = r.data;
      setForm({
        judul: a.judul ?? '',
        ringkasan: a.ringkasan ?? '',
        isi: a.isi ?? '',
        gambar: a.gambar || '',
      });
      setModal({ type: 'edit', id: row.id });
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') await adminApi.createArtikel(form);
      else await adminApi.updateArtikel(modal.id, form);
      setModal(null);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Hapus artikel ini?')) return;
    try {
      await adminApi.deleteArtikel(id);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader
        title="Artikel & blog"
        subtitle={search ? `${filteredRows.length} dari ${rows.length} artikel` : `${rows.length} artikel`}
        action={
          <button type="button" className="btn btn-dark rounded-0" onClick={openCreate}>
            + Artikel baru
          </button>
        }
      />
      {(error || formError) && <div className="alert alert-danger">{error || formError}</div>}

      <div className="admin-panel">
        <div className="mb-3" style={{ maxWidth: 320 }}>
          <input
            type="search"
            className="form-control"
            placeholder="Cari judul atau ringkasan artikel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="table-responsive">
          <table className="table admin-table mb-0">
            <thead>
              <tr>
                <th>Gambar</th>
                <th>Judul</th>
                <th>Tanggal</th>
                <th className="col-actions">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-secondary">
                    {search
                      ? `Tidak ada artikel yang cocok dengan "${search}".`
                      : 'Belum ada artikel. Klik "Artikel baru" untuk menambah.'}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <img src={mediaUrl(row.gambar)} alt="" width={56} height={40} className="admin-thumb" />
                    </td>
                    <td>
                      <strong>{row.judul}</strong>
                      <p className="small text-secondary mb-0 admin-desc-clamp">{row.ringkasan}</p>
                    </td>
                    <td>{formatTanggal(row.created_at)}</td>
                    <td className="col-actions">
                      <AdminRowActions
                        onDetail={() => openDetail(row)}
                        onEdit={() => openEdit(row)}
                        onDelete={() => onDelete(row.id)}
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
        title={detail ? `Detail: ${detail.judul}` : ''}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <>
            <img src={mediaUrl(detail.gambar)} alt="" className="admin-detail-img" />
            <DetailDl
              items={[
                ['ID', detail.id],
                ['Judul', detail.judul],
                ['Tanggal', formatTanggal(detail.created_at)],
                ['Ringkasan', detail.ringkasan],
                ['Isi', detail.isi],
              ]}
            />
          </>
        )}
      </AdminDetailModal>

      <AdminModal show={Boolean(modal)} title={modal === 'create' ? 'Tambah artikel' : 'Ubah artikel'} onClose={() => setModal(null)} wide>
        <form onSubmit={onSave}>
          <div className="mb-3">
            <label className="form-label">Judul</label>
            <input className="form-control" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Ringkasan</label>
            <textarea className="form-control" rows={2} value={form.ringkasan} onChange={(e) => setForm({ ...form, ringkasan: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Isi</label>
            <textarea className="form-control" rows={6} value={form.isi} onChange={(e) => setForm({ ...form, isi: e.target.value })} required />
          </div>
          <ImageUploadField
            label="Gambar"
            value={form.gambar}
            onChange={(v) => setForm({ ...form, gambar: v })}
            clearable
            required={modal === 'create'}
          />
          <button type="submit" className="btn btn-dark rounded-0 w-100 mt-2" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      </AdminModal>
    </div>
  );
}