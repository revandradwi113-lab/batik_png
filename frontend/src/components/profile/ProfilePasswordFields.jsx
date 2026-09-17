/**
 * ProfilePasswordFields — 3 input opsional untuk ganti password di form profil.
 * Props: values (form state berisi passwd_lama/passwd_baru/passwd_konfirmasi), onChange(key, value)
 */
export default function ProfilePasswordFields({ values, onChange }) {
  return (
    <div className="row g-3 mt-1">
      <div className="col-12">
        <label className="form-label">Ganti password (kosongkan jika tidak diubah)</label>
      </div>
      <div className="col-md-4">
        <input
          type="password"
          className="form-control"
          placeholder="Password lama"
          value={values.passwd_lama || ""}
          onChange={(e) => onChange("passwd_lama", e.target.value)}
        />
      </div>
      <div className="col-md-4">
        <input
          type="password"
          className="form-control"
          placeholder="Password baru"
          value={values.passwd_baru || ""}
          onChange={(e) => onChange("passwd_baru", e.target.value)}
        />
      </div>
      <div className="col-md-4">
        <input
          type="password"
          className="form-control"
          placeholder="Konfirmasi password baru"
          value={values.passwd_konfirmasi || ""}
          onChange={(e) => onChange("passwd_konfirmasi", e.target.value)}
        />
      </div>
    </div>
  );
}
