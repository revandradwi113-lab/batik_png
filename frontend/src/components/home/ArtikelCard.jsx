import { Link } from "react-router-dom";
import { getImageUrl } from "../../constants";

export default function ArtikelCard({ artikel }) {
  return (
    <Link to={`/artikel/${artikel.id}`} className="text-decoration-none">
      <div className="fg-card">
        <div className="fg-card-thumb">
          {artikel.gambar ? (
            <img
              src={getImageUrl(artikel.gambar)}
              alt={artikel.judul}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span>{artikel.judul}</span>
          )}
        </div>
        <div className="fg-card-body">
          <div className="fg-card-title">{artikel.judul}</div>
          <p className="small text-muted mb-0">{artikel.ringkasan}</p>
        </div>
      </div>
    </Link>
  );
}
