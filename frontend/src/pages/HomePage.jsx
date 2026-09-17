import { Link } from "react-router-dom";
import PublicPage from "../components/layout/PublicPage";
import { SITE } from "../constants";
import { useFetch } from "../hooks";
import ProdukCard from "../components/home/ProdukCard";
import ArtikelTerbaruSection from "../components/home/ArtikelTerbaruSection";
import heroImg from "../assets/baground.jpg";

// Jumlah produk pilihan yang ditampilkan di beranda (katalog lengkap ada di /toko)
const JUMLAH_PILIHAN = 8;

export default function HomePage() {
  const { data: produk, loading, error } = useFetch("/users/produk");
  const produkPilihan = (produk || []).slice(0, JUMLAH_PILIHAN);

  return (
    <PublicPage overlayNavbar={false}>
      <div className="fg-hero container-fluid" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="container">
          <h1>Keindahan batik asli, dari perajin ke lemari Anda</h1>
          <p>{SITE.tentang}</p>
          <Link to="/toko" className="btn btn-fg-primary mt-4">
            Belanja Sekarang
          </Link>
        </div>
      </div>

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
          <h2 className="fs-3 mb-0">Produk Pilihan</h2>
          <Link to="/toko" className="fg-link-more">
            Lihat semua produk &rarr;
          </Link>
        </div>

        {loading && <p className="text-muted">Memuat produk...</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loading && !error && produkPilihan.length === 0 && (
          <p className="text-muted">Belum ada produk.</p>
        )}

        <div className="row g-4">
          {produkPilihan.map((p) => (
            <div className="col-6 col-md-4 col-lg-3" key={p.id_produk}>
              <ProdukCard produk={p} />
            </div>
          ))}
        </div>
      </div>

      <ArtikelTerbaruSection />
    </PublicPage>
  );
}
