import Navbar from "./Navbar";
import Footer from "./Footer";

// Pembungkus modular untuk halaman publik (Navbar + konten + Footer).
// Dipakai di dalam tiap page (bukan di App.jsx) karena route publik di App.jsx
// tidak dibungkus layout route — jadi tiap page yang mengurus chrome-nya sendiri.
export default function PublicPage({ overlayNavbar = false, children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar overlay={overlayNavbar} />
      <main className="flex-grow-1">{children}</main>
      <Footer />
    </div>
  );
}
