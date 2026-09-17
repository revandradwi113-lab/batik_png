import { Link } from "react-router-dom";
import { useFetch } from "../../hooks";
import ArtikelCard from "./ArtikelCard";

// Section modular untuk beranda publik: menampilkan artikel terbaru (minimal 3).
// Dipisah dari Home.jsx supaya bisa dipakai ulang di halaman lain tanpa duplikasi kode.
// Backend (/users/artikel) sudah mengurutkan dari yang terbaru (ORDER BY created_at DESC),
// jadi di sini tinggal ambil 3 teratas.
const JUMLAH_TAMPIL = 3;

export default function ArtikelTerbaruSection() {
  const { data: artikel, loading, error } = useFetch("/users/artikel");
  const daftarArtikel = artikel || [];
  const artikelTerbaru = daftarArtikel.slice(0, JUMLAH_TAMPIL);

  // Kalau data sudah selesai dimuat dan memang tidak ada artikel sama sekali,
  // section disembunyikan saja daripada menampilkan ruang kosong di beranda.
  if (!loading && !error && artikelTerbaru.length === 0) {
    return null;
  }

  return (
    <section className="fg-artikel-terbaru py-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
          <h2 className="fs-3 mb-0">Artikel Terbaru</h2>
          <Link to="/artikel" className="fg-link-more">
            Lihat semua artikel &rarr;
          </Link>
        </div>

        {loading && <p className="text-muted">Memuat artikel...</p>}
        {error && <p className="text-danger">{error}</p>}

        <div className="row g-4">
          {artikelTerbaru.map((a) => (
            <div className="col-6 col-md-4" key={a.id}>
              <ArtikelCard artikel={a} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
