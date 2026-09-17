import { SITE } from "../../../constants";

// Blok alamat & kontak teks di footer.
export default function FooterKontak() {
  return (
    <div>
      <p className="mb-1 small">{SITE.alamat_toko}</p>
      <p className="mb-1 small">
        <a href={`tel:${SITE.tlp_toko}`}>+{SITE.tlp_toko}</a>
      </p>
      <p className="mb-0 small">
        <a href={`mailto:${SITE.email_toko}`}>{SITE.email_toko}</a>
      </p>
    </div>
  );
}
