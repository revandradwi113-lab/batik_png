import PublicPage from "../components/layout/PublicPage";
import { useFetch } from "../hooks";
import ArtikelCard from "../components/home/ArtikelCard";

export default function ArtikelListPage() {
  const { data: artikel, loading, error } = useFetch("/users/artikel");
  const daftarArtikel = artikel || [];

  return (
    <PublicPage>
      <div className="container py-5">
        <h2 className="fs-3">Artikel</h2>

        {loading && <p className="text-muted">Memuat artikel...</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loading && !error && daftarArtikel.length === 0 && (
          <p className="text-muted">Belum ada artikel.</p>
        )}

        <div className="row g-4">
          {daftarArtikel.map((a) => (
            <div className="col-6 col-md-4 col-lg-3" key={a.id}>
              <ArtikelCard artikel={a} />
            </div>
          ))}
        </div>
      </div>
    </PublicPage>
  );
}
