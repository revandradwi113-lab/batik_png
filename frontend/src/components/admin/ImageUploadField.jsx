/**
 * [buatan] Input teks path gambar + tombol unggah file.
 *
 * Default adminApi.uploadGambar; bisa diganti uploadFn (pembeli). Dipakai form admin/produk/artikel.
 */
import { useState } from 'react';
import { adminApi } from '../../api';
import { mediaUrl } from '../../utils';

/** Props: label, value (path), onChange, uploadFn (default adminApi), clearable. */
export default function ImageUploadField({ label, value, onChange, required, uploadFn, clearable }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Proses file pilihan → upload API → set path
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const upload = uploadFn || adminApi.uploadGambar.bind(adminApi);
      const res = await upload(file);
      onChange(res.path);
    } catch (err) {
      setError(err.message || 'Upload gagal');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="admin-upload-row">
        <input
          type="text"
          className="form-control"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/images/..."
          required={required}
        />
        <label className="btn btn-outline-dark btn-sm rounded-0 mb-0">
          {uploading ? '…' : 'Unggah'}
          <input type="file" accept="image/*" hidden onChange={onFile} disabled={uploading} />
        </label>
        {clearable && value && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-0"
            onClick={() => onChange('')}
          >
            Hapus
          </button>
        )}
      </div>
      {value && (
        <img src={mediaUrl(value)} alt="" className="admin-upload-preview mt-2" width={80} height={80} />
      )}
      {error && <p className="text-danger small mt-1 mb-0">{error}</p>}
    </div>
  );
}
