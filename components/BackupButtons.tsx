"use client";

// =============================================================
// TOMBOL EKSPOR & IMPOR DATA (backup .json)
// - Ekspor: mengunduh seluruh portofolio sebagai file .json
// - Impor : membaca file .json lalu mengganti data (dengan konfirmasi)
// =============================================================

import { useRef } from "react";
import { Stock } from "@/lib/types";
import { buatBackup, parseBackup } from "@/lib/backup";

interface Props {
  stocks: Stock[];
  onImport: (stocks: Stock[]) => void;
}

export default function BackupButtons({ stocks, onImport }: Props) {
  // Ref ke <input type="file"> yang disembunyikan.
  const fileRef = useRef<HTMLInputElement>(null);

  // --- EKSPOR: buat file JSON lalu picu unduhan ---
  const handleEkspor = () => {
    const isi = JSON.stringify(buatBackup(stocks), null, 2);
    const blob = new Blob([isi], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const tanggal = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const link = document.createElement("a");
    link.href = url;
    link.download = `dividend-tracker-backup-${tanggal}.json`;
    link.click();

    URL.revokeObjectURL(url); // bersihkan memori
  };

  // --- IMPOR: baca file yang dipilih pengguna ---
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const teks = await file.text();
      const sahamBaru = parseBackup(teks); // validasi di dalam
      if (
        confirm(
          `Impor ${sahamBaru.length} saham dari file ini? Data saat ini akan diganti.`
        )
      ) {
        onImport(sahamBaru);
      }
    } catch (err) {
      alert("Gagal impor: " + (err as Error).message);
    } finally {
      // Reset nilai input supaya file yang sama bisa dipilih lagi nanti.
      e.target.value = "";
    }
  };

  const tombolClass =
    "rounded-lg bg-card-soft px-3 py-1.5 text-xs font-medium text-ink hover:bg-line/10";

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={handleEkspor} className={tombolClass}>
        ⬇ Ekspor JSON
      </button>
      <button onClick={() => fileRef.current?.click()} className={tombolClass}>
        ⬆ Impor JSON
      </button>
      {/* Input file tersembunyi, dipicu oleh tombol Impor di atas. */}
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
