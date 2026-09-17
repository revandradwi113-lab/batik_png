import { SITE } from "../../../constants";

// Blok brand di footer — dipisah modular supaya Footer.jsx cukup menyusun blok-blok kecil.
export default function FooterBrand() {
  return (
    <div>
      <strong> {SITE.nama_toko}</strong>
      <p className="mt-2 mb-0 small">{SITE.tentang}</p>
    </div>
  );
}
