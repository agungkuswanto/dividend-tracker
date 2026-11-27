"use client"; // Interaktif: ada klik, state loading, & panggilan jaringan.

// =============================================================
// TOMBOL "PERBARUI HARGA"
// Mengambil harga terakhir semua saham dari /api/harga (Yahoo Finance),
// lalu mengirim hasilnya ke induk lewat callback onHarga.
// Menampilkan status: sedang memuat, berapa berhasil, berapa gagal.
// =============================================================

import { useState } from "react";
import { Stock } from "@/lib/types";
import { ambilHarga, DataSaham } from "@/lib/hargaApi";

interface Props {
  stocks: Stock[];
  // Dipanggil dengan data { KODE: { harga, nama } } setelah berhasil ambil.
  onHarga: (data: Record<string, DataSaham>) => void;
}

export default function UpdateHargaButton({ stocks, onHarga }: Props) {
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);

  const klik = async () => {
    // Kumpulkan kode unik dari portofolio.
    const kode = Array.from(
      new Set(stocks.map((s) => s.code.toUpperCase()).filter(Boolean))
    );
    if (kode.length === 0) {
      setPesan("Belum ada saham untuk diperbarui.");
      return;
    }

    setLoading(true);
    setPesan(null);
    try {
      const { hasil, gagal } = await ambilHarga(kode);
      // Kirim data lengkap (harga + nama). Hook akan mengisi nama hanya bila
      // kolom nama saham masih kosong (nama custom tidak tertimpa).
      onHarga(hasil);

      const jml = Object.keys(hasil).length;
      setPesan(
        `${jml} saham diperbarui (harga & nama)` +
          (gagal.length ? ` · ${gagal.length} gagal: ${gagal.join(", ")}` : "")
      );
    } catch {
      setPesan("Gagal mengambil harga. Coba lagi sebentar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={klik}
        disabled={loading}
        className="rounded-lg border border-line/10 bg-card px-3 py-1.5 text-xs font-medium text-ink transition hover:border-gold disabled:opacity-60"
      >
        {loading ? "Memperbarui…" : "🔄 Perbarui harga"}
      </button>
      {pesan && <span className="text-[11px] text-muted">{pesan}</span>}
    </div>
  );
}
