"use client"; // Hook ini memakai localStorage -> hanya jalan di browser.

// =============================================================
// usePortfolio: satu "sumber kebenaran" untuk daftar saham.
// - Memuat data dari localStorage saat dibuka.
// - Kalau belum ada, memakai DATA_CONTOH.
// - Menyimpan otomatis setiap ada perubahan.
// - Menyediakan fungsi tambah/edit/hapus/reset.
//
// Nanti, untuk pindah ke Supabase, cukup ganti isi fungsi-fungsi
// di sini (load & save) tanpa mengubah komponen UI.
// =============================================================

import { useEffect, useState } from "react";
import { Stock } from "@/lib/types";
import { DATA_CONTOH } from "@/lib/sampleData";
import { DataSaham } from "@/lib/hargaApi";

// Kunci penyimpanan di localStorage.
const STORAGE_KEY = "dividend-tracker:portfolio";
// Kunci terpisah untuk waktu harga terakhir diperbarui (disimpan sbg angka ms).
const WAKTU_KEY = "dividend-tracker:harga-updated";

export function usePortfolio() {
  // Awali dengan array kosong supaya hasil render server & client sama
  // (mencegah "hydration mismatch"). Data asli dimuat di useEffect.
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Waktu (ms epoch) harga terakhir diperbarui dari API; null = belum pernah.
  const [hargaUpdatedAt, setHargaUpdatedAt] = useState<number | null>(null);

  // 1) Muat data sekali saat komponen pertama tampil di browser.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Kalau ada data tersimpan -> pakai itu. Kalau tidak -> data contoh.
      setStocks(raw ? (JSON.parse(raw) as Stock[]) : DATA_CONTOH);

      // Muat juga waktu terakhir perbarui harga (bila ada).
      const rawWaktu = localStorage.getItem(WAKTU_KEY);
      if (rawWaktu) setHargaUpdatedAt(Number(rawWaktu) || null);
    } catch {
      // Kalau localStorage error (mis. mode privat), tetap tampilkan contoh.
      setStocks(DATA_CONTOH);
    }
    setLoaded(true);
  }, []);

  // 2) Simpan otomatis setiap "stocks" berubah (tapi hanya setelah termuat).
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stocks));
    } catch {
      // Abaikan jika gagal menyimpan (mis. storage penuh / diblokir).
    }
  }, [stocks, loaded]);

  // --- Fungsi untuk mengubah portofolio ---

  // Tambah saham baru ke akhir daftar.
  const addStock = (s: Stock) => setStocks((prev) => [...prev, s]);

  // Ganti saham yang id-nya cocok dengan versi baru.
  const updateStock = (s: Stock) =>
    setStocks((prev) => prev.map((x) => (x.id === s.id ? s : x)));

  // Hapus saham berdasarkan id.
  const removeStock = (id: string) =>
    setStocks((prev) => prev.filter((x) => x.id !== id));

  // Kembalikan ke data contoh.
  const resetSample = () => setStocks(DATA_CONTOH);

  // Ganti SELURUH portofolio sekaligus (dipakai saat impor backup).
  const gantiSemua = (baru: Stock[]) => setStocks(baru);

  // Perbarui harga sekarang (currentPrice) + nama untuk saham yang kodenya cocok.
  // "data" = { "BBRI": { harga: 3070, nama: "..." } }. Kode dibandingkan tanpa
  // peduli huruf besar/kecil. Saham yang tidak ada di data dibiarkan apa adanya.
  // Nama hanya diisi bila kolom nama MASIH KOSONG (jangan timpa nama custom).
  const perbaruiHarga = (data: Record<string, DataSaham>) => {
    setStocks((prev) =>
      prev.map((s) => {
        const d = data[s.code.toUpperCase()];
        if (!d) return s;
        return {
          ...s,
          currentPrice: d.harga,
          name: s.name && s.name.trim() ? s.name : d.nama ?? s.name,
        };
      })
    );

    // Catat waktu HANYA bila ada minimal satu saham yang berhasil diperbarui.
    if (Object.keys(data).length > 0) {
      const sekarang = Date.now();
      setHargaUpdatedAt(sekarang);
      try {
        localStorage.setItem(WAKTU_KEY, String(sekarang));
      } catch {
        // Abaikan bila gagal menyimpan.
      }
    }
  };

  return {
    stocks,
    loaded,
    hargaUpdatedAt,
    addStock,
    updateStock,
    removeStock,
    resetSample,
    gantiSemua,
    perbaruiHarga,
  };
}
