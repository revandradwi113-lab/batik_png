/**
 * [buatan] Kelola akun pembeli.
 * URL: `/admin/pembeli` — adminApi users role pembeli.
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
import { KELAMIN } from '../../constants';
import { formatTanggal, toDateInputValue } from '../../utils';
import { normalizeKelamin } from '../../utils';
import { mediaUrl } from '../../utils';
import ImageUploadField from '../../components/admin/ImageUploadField';

const empty = {
  nama_d: '',
  nama_b: '',
  kelamin: 'Laki-laki',
  lahir: '',
  alamat: '',
  phone: '',
  email: '',
  uname: '',
  passwd: '',
  foto: '',
};

export default function AdminPembeliPage() {
  const { handleError } = useAdminGuard();
  const { rows, loading, error, reload } = useAdminList(adminApi.getPembeli);
  const [modal, setModal] = useState(null); // null | 'create' | { type: 'edit', id }
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openCreate = () => {
    setForm(empty);
    setModal('create');
  };

  const openDetail = async (row) => {
    try {
      const r = await adminApi.getUser(row.id);
      setDetail(r.data);
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  const openEdit = async (row) => {
    setFormError('');
    try {
      const r = await adminApi.getUser(row.id);
      const p = r.data;
      setForm({
        nama_d: p.nama_d,
        nama_b: p.nama_b,
        kelamin: normalizeKelamin(p.kelamin),
        lahir: toDateInputValue(p.lahir),
        alamat: p.alamat,
        phone: String(p.phone),
        email: p.email,
        uname: p.uname,
        passwd: '',
        foto: p.foto || '',
      });
      setModal({ type: 'edit', id: row.id });
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const payload = { ...form, phone: parseInt(String(form.phone).replace(/\D/g, ''), 10) };
    if (modal !== 'create' && !payload.passwd) delete payload.passwd;
    try {
      if (modal === 'create') {
        await adminApi.createUser(payload);
      } else {
        await adminApi.updateUser(modal.id, payload);
      }
      setModal(null);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Hapus pembeli ini? Pesanan terkait harus dihapus dulu.')) return;
    try {
      await adminApi.deleteUser(id);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader
        title="Daftar pembeli"
        subtitle={`${rows.length} akun pembeli`}
        action={
          <button type="button" className="btn btn-dark rounded-0" onClick={openCreate}>
            + Pembeli baru
          </button>
        }
      />
      {(error || formError) && <div className="alert alert-danger">{error || formError}</div>}

      <div className="admin-panel">
        <div className="table-responsive">
          <table className="table admin-table mb-0">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Username</th>
                <th>Telepon</th>
                <th>Daftar</th>
                <th className="col-actions">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-secondary">
                    Belum ada akun pembeli. Klik &quot;Pembeli baru&quot; untuk menambah.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <img
                        src={mediaUrl(row.foto)}
                        alt=""
                        width={48}
                        height={48}
                        className="admin-thumb admin-thumb--avatar"
                      />
                    </td>
                    <td>
                      {row.nama_d} {row.nama_b}
                    </td>
                    <td>{row.email}</td>
                    <td>{row.uname}</td>
                    <td>{row.phone}</td>
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
        title={detail ? `Detail: ${detail.nama_d} ${detail.nama_b}` : ''}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <>
            {detail.foto && (
              <img src={mediaUrl(detail.foto)} alt="" width={80} height={80} className="admin-thumb admin-thumb--avatar mb-3" />
            )}
            <DetailDl
            items={[
              ['ID', detail.id],
              ['Nama', `${detail.nama_d} ${detail.nama_b}`],
              ['Email', detail.email],
              ['Username', detail.uname],
              ['Telepon', detail.phone],
              ['Kelamin', detail.kelamin],
              ['Tanggal lahir', formatTanggal(detail.lahir)],
              ['Alamat', detail.alamat],
              ['Terdaftar', formatTanggal(detail.created_at)],
            ]}
          />
          </>
        )}
      </AdminDetailModal>

      <AdminModal show={Boolean(modal)} title={modal === 'create' ? 'Tambah pembeli' : 'Ubah pembeli'} onClose={() => setModal(null)} wide>
        <form onSubmit={onSave}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nama depan</label>
              <input className="form-control" value={form.nama_d} onChange={(e) => setForm({ ...form, nama_d: e.target.value })} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Nama belakang</label>
              <input className="form-control" value={form.nama_b} onChange={(e) => setForm({ ...form, nama_b: e.target.value })} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Jenis kelamin</label>
              <select className="form-select" value={form.kelamin} onChange={(e) => setForm({ ...form, kelamin: e.target.value })}>
                {KELAMIN.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Tanggal lahir</label>
              <input type="date" className="form-control" value={form.lahir} onChange={(e) => setForm({ ...form, lahir: e.target.value })} required />
            </div>
            <div className="col-12">
              <label className="form-label">Alamat</label>
              <textarea className="form-control" rows={2} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Telepon</label>
              <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Username</label>
              <input className="form-control" value={form.uname} onChange={(e) => setForm({ ...form, uname: e.target.value })} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Password {modal !== 'create' && '(kosongkan jika tidak diubah)'}</label>
              <input type="password" className="form-control" value={form.passwd} onChange={(e) => setForm({ ...form, passwd: e.target.value })} required={modal === 'create'} />
            </div>
            <div className="col-12">
              <ImageUploadField
                label="Foto profil"
                value={form.foto}
                onChange={(v) => setForm({ ...form, foto: v })}
                clearable
              />
            </div>
          </div>
          <button type="submit" className="btn btn-dark rounded-0 w-100 mt-3" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      </AdminModal>
    </div>
  );
}
