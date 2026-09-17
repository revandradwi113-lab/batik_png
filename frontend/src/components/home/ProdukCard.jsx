import { Link } from "react-router-dom";
import { formatHarga } from "../../utils";
import { getImageUrl } from "../../constants";

export default function ProdukCard({ produk }) {
  return (
    <Link to={`/produk/${produk.id_produk}`} className="text-decoration-none">
      <div className="fg-card">
        <div className="fg-card-thumb">
          {produk.gambar ? (
            <img
              src={getImageUrl(produk.gambar)}
              alt={produk.nama_produk}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span>{produk.nama_produk}</span>
          )}
        </div>
        <div className="fg-card-body">
          <span className="fg-card-kategori">{produk.kategori}</span>
          <div className="fg-card-title">{produk.nama_produk}</div>
          <div className="fg-card-harga">{formatHarga(produk.harga)}</div>
        </div>
      </div>
    </Link>
  );
}
