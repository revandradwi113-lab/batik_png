/**
 * CartContext — keranjang belanja berbasis localStorage.
 * Satu item = satu produk + qty. Checkout membuat 1 pembelian per item
 * (sesuai skema tabel pembelian yang hanya punya 1 id_produk per baris).
 */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "toko_batik_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(produk, qty = 1) {
    if (!produk?.id_produk) return;
    const amount = Math.max(1, Number(qty) || 1);
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id_produk === produk.id_produk);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + amount };
        return next;
      }
      return [
        ...prev,
        {
          id_produk: produk.id_produk,
          nama_produk: produk.nama_produk,
          harga: Number(produk.harga) || 0,
          gambar: produk.gambar || "",
          kategori: produk.kategori || "",
          qty: amount,
        },
      ];
    });
  }

  function updateQty(id_produk, qty) {
    const amount = Math.max(1, Number(qty) || 1);
    setItems((prev) =>
      prev.map((i) => (i.id_produk === id_produk ? { ...i, qty: amount } : i))
    );
  }

  function removeItem(id_produk) {
    setItems((prev) => prev.filter((i) => i.id_produk !== id_produk));
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );

  const totalHarga = useMemo(
    () => items.reduce((sum, i) => sum + i.harga * i.qty, 0),
    [items]
  );

  const value = {
    items,
    totalItems,
    totalHarga,
    addItem,
    updateQty,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus dipakai di dalam CartProvider");
  return ctx;
}
