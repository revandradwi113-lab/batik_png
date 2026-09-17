import { SITE } from "../../constants";
import FooterBrand from "./footer/FooterBrand";
import FooterKontak from "./footer/FooterKontak";
import FooterSocial from "./footer/FooterSocial";

// Footer publik — disusun dari blok-blok modular (brand, kontak, sosial)
// supaya tiap bagian bisa dikembangkan/diganti sendiri-sendiri.
export default function Footer() {
  return (
    <footer className="fg-footer">
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-5">
            <FooterBrand />
          </div>
          <div className="col-md-4">
            <FooterKontak />
          </div>
          <div className="col-md-3">
            <FooterSocial />
          </div>
        </div>
        <hr className="border-secondary my-4" />
        <p className="small mb-0">
          &copy; {new Date().getFullYear()} {SITE.nama_toko}. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
}
