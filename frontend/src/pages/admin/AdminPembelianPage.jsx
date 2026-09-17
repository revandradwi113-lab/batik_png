/**
 * [buatan] Kelola pesanan/pembelian.
 * URL: `/admin/pembelian` — ubah status proses & pembayaran.
 */
import { useState } from 'react';
import { adminApi } from '../../api';
import { useAdminList } from '../../hooks';
import { useAdminGuard } from '../../hooks';
import { METODE_BAYAR, SHIPPING, STATUS_BAYAR, STATUS_PROSES } from '../../constants';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import AdminModal from '../../components/admin/AdminModal';
import AdminDetailModal from '../../components/admin/AdminDetailModal';
import AdminRowActions from '../../components/admin/AdminRowActions';
import DetailDl from '../../components/admin/DetailDl';
import { formatRupiah, formatTanggal } from '../../utils';
import { mediaUrl } from '../../utils';

export default function AdminPembelianPage() {
  const { handleError } = useAdminGuard();
  const { rows, loading, error, reload } = useAdminList(adminApi.getPembelian);
  const [modal, setModal] = useState(null); // edit status pesanan
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({}); // status proses & pembayaran
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openDetail = async (row) => {
    try {
      const r = await adminApi.getPembelianById(row.id);
      setDetail(r.data);
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  const openEdit = async (row) => {
    setFormError('');
    try {
      const r = await adminApi.getPembelianById(row.id);
      const p = r.data;
      setForm({
        metode_pembayaran: p.metode_pembayaran ?? METODE_BAYAR[0],
        pembayaran: p.pembayaran ?? STATUS_BAYAR[0],
        pengiriman: p.pengiriman ?? SHIPPING[0],
        status: p.status ?? STATUS_PROSES[0],
        catatan: p.catatan || '',
      });
      setModal({ id: row.id, row: p });
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updatePembelian(modal.id, form);
      setModal(null);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Hapus pesanan ini?')) return;
    try {
      await adminApi.deletePembelian(id);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader title="Daftar pesanan" subtitle={`${rows.length} transaksi`} />
      {(error || formError) && <div className="alert alert-danger">{error || formError}</div>}

      <div className="admin-panel">
        <div className="table-responsive">
          <table className="table admin-table mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pembeli</th>
                <th>Gambar</th>
                <th>Produk</th>
                <th>Jumlah</th>
                <th>Total</th>
                <th>Status</th>
                <th>Bayar</th>
                <th className="col-actions">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-secondary">
                    Belum ada pesanan.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                <tr key={row.id}>
                  <td>#{row.id}</td>
                  <td>
                    <div>{row.nama_pembeli}</div>
                    <small className="text-secondary">{row.email_pembeli || row.uname_pembeli}</small>
                  </td>
                  <td>
                    <img
                      src={mediaUrl(row.gambar_produk)}
                      alt={row.nama_produk}
                      width={48}
                      height={48}
                      className="admin-thumb"
                    />
                  </td>
                  <td>
                    {row.nama_produk}
                    {(Number(row.jumlah) || 1) > 1 && (
                      <div className="small text-secondary">{formatRupiah(row.harga)} / pcs</div>
                    )}
                  </td>
                  <td>{Number(row.jumlah) || 1}</td>
                  <td>{formatRupiah((Number(row.harga) || 0) * (Number(row.jumlah) || 1))}</td>
                  <td>
                    <span className="admin-badge">{row.status}</span>
                  </td>
                  <td>{row.pembayaran}</td>
                  <td className="col-actions">
                    <AdminRowActions
                      onDetail={() => openDetail(row)}
                      onEdit={() => openEdit(row)}
                      onDelete={() => onDelete(row.id)}
                    />
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminDetailModal
        show={Boolean(detail)}
        title={detail ? `Detail pesanan #${detail.id}` : ''}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <>
            <div className="row g-3 mb-4">
              <div className="col-sm-5">
                <p className="small text-secondary mb-1">Produk</p>
                <img
                  src={mediaUrl(detail.gambar_produk)}
                  alt={detail.nama_produk}
                  className="admin-detail-img w-100"
                />
              </div>
              {detail.foto_bukti && (
                <div className="col-sm-7">
                  <p className="small text-secondary mb-1">Bukti bayar</p>
                  <img src={mediaUrl(detail.foto_bukti)} alt="Bukti bayar" className="admin-detail-img w-100" />
                </div>
              )}
            </div>
            <DetailDl
              items={[
                ['ID pesanan', detail.id],
                ['Pembeli', detail.nama_pembeli],
                ['Email', detail.email_pembeli],
                ['Produk', detail.nama_produk],
                ['Jumlah', `${Number(detail.jumlah) || 1} pcs`],
                ['Harga satuan', formatRupiah(detail.harga)],
                ['Total', formatRupiah((Number(detail.harga) || 0) * (Number(detail.jumlah) || 1))],
                ['Alamat kirim', detail.alamat_pembeli],
                ['Telepon', detail.phone_pembeli],
                ['Metode bayar', detail.metode_pembayaran],
                ['Status bayar', detail.pembayaran],
                ['Kurir', detail.pengiriman],
                ['Status pesanan', detail.status],
                ['Catatan', detail.catatan || '—'],
                ['Tanggal', formatTanggal(detail.created_at)],
              ]}
            />
          </>
        )}
      </AdminDetailModal>

      <AdminModal show={Boolean(modal)} title={`Ubah pesanan #${modal?.id}`} onClose={() => setModal(null)} wide>
        {modal?.row && (
          <div className="mb-3 small text-secondary">
            <p className="mb-2">
              {modal.row.nama_pembeli} · {modal.row.nama_produk} · {formatTanggal(modal.row.created_at)}
            </p>
            <div className="d-flex flex-wrap gap-3 align-items-start">
              <img
                src={mediaUrl(modal.row.gambar_produk)}
                alt={modal.row.nama_produk}
                width={72}
                height={72}
                className="admin-thumb"
              />
              {modal.row.foto_bukti && (
                <img src={mediaUrl(modal.row.foto_bukti)} alt="Bukti" className="admin-upload-preview" width={120} />
              )}
            </div>
          </div>
        )}
        <form onSubmit={onSave}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Metode bayar</label>
              <select className="form-select" value={form.metode_pembayaran} onChange={(e) => setForm({ ...form, metode_pembayaran: e.target.value })}>
                {METODE_BAYAR.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Status pembayaran</label>
              <select className="form-select" value={form.pembayaran} onChange={(e) => setForm({ ...form, pembayaran: e.target.value })}>
                {STATUS_BAYAR.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Kurir</label>
              <select className="form-select" value={form.pengiriman} onChange={(e) => setForm({ ...form, pengiriman: e.target.value })}>
                {SHIPPING.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Status pesanan</label>
              <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_PROSES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Catatan</label>
              <textarea className="form-control" rows={2} value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-dark rounded-0 w-100 mt-2" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan perubahan'}
          </button>
        </form>
      </AdminModal>
    </div>
  );
}
