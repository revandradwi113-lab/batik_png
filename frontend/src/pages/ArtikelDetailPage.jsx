import { useParams, Link } from "react-router-dom";
import PublicPage from "../components/layout/PublicPage";
import { useFetch } from "../hooks";
import { getImageUrl } from "../constants";

export default function ArtikelDetailPage() {
  const { id } = useParams();
  const { data: artikel, loading, error } = useFetch(`/users/artikel/${id}`, [id]);

  return (
    <PublicPage>
      {loading && <div className="container py-5 text-muted">Memuat artikel...</div>}
      {error && <div className="container py-5 text-danger">{error}</div>}

      {artikel && (
        <div className="container py-5" style={{ maxWidth: "760px" }}>
          <Link to="/artikel" className="small text-decoration-none">
            &larr; Kembali ke artikel
          </Link>

          {artikel.gambar && (
            <div className="fg-card-thumb mt-3" style={{ borderRadius: "14px", minHeight: "260px" }}>
              <img
                src={getImageUrl(artikel.gambar)}
                alt={artikel.judul}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          <h1 className="fg-display mt-4" style={{ fontSize: "2rem" }}>
            {artikel.judul}
          </h1>
          <p className="text-muted fst-italic">{artikel.ringkasan}</p>

          <div className="fg-article-body mt-4">{artikel.isi}</div>
        </div>
      )}
    </PublicPage>
  );
}
