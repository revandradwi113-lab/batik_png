import { SITE } from "../../../constants";

// Daftar sosial dibuat sebagai data, bukan JSX berulang, supaya menambah/menghapus
// ikon cukup edit array ini (teknik modular: tinggal tambah 1 baris, tidak perlu
// sentuh markup lain). Ikon pakai Bootstrap Icons (sudah dimuat lewat CDN di index.html).
const DAFTAR_SOSIAL = [
  {
    key: "instagram",
    label: "Instagram",
    icon: "bi-instagram",
    href: SITE.link_ig,
    external: true,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: "bi-whatsapp",
    href: SITE.link_wa,
    external: true,
  },
  {
    key: "email",
    label: "Email",
    icon: "bi-envelope-fill",
    href: `mailto:${SITE.email_toko}`,
    external: false,
  },
  {
    key: "telepon",
    label: "Telepon",
    icon: "bi-telephone-fill",
    href: `tel:${SITE.tlp_toko}`,
    external: false,
  },
].filter((s) => s.href && s.href !== "mailto:" && s.href !== "tel:");

export default function FooterSocial() {
  return (
    <div className="fg-footer-social">
      {DAFTAR_SOSIAL.map((s) => (
        <a
          key={s.key}
          href={s.href}
          target={s.external ? "_blank" : undefined}
          rel={s.external ? "noopener noreferrer" : undefined}
          className="fg-footer-social-icon"
          aria-label={s.label}
          title={s.label}
        >
          <i className={`bi ${s.icon}`} aria-hidden="true"></i>
        </a>
      ))}
    </div>
  );
}