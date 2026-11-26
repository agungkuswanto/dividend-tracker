"use client";

// =============================================================
// TOMBOL "BAGIKAN"
// Memotret sebuah elemen DOM (kartu ringkasan) menjadi gambar PNG
// memakai pustaka html-to-image, lalu mengunduhnya.
// =============================================================

import { useState } from "react";
import { toPng } from "html-to-image";

interface Props {
  // Ref ke elemen yang akan dipotret (lihat page.tsx: kartu ekspor).
  targetRef: React.RefObject<HTMLElement>;
  filename?: string;
}

export default function ShareButton({
  targetRef,
  filename = "dividend-tracker.png",
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    const node = targetRef.current;
    if (!node) return;

    setLoading(true);
    try {
      // toPng mengubah elemen + style-nya menjadi data URL gambar PNG.
      // pixelRatio: 2 -> gambar lebih tajam (cocok untuk layar HD).
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: "#0f1623",
        cacheBust: true,
      });

      // Coba pakai Web Share API (berbagi langsung di HP) bila tersedia.
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Dividend Tracker" });
      } else {
        // Jika tidak bisa berbagi langsung -> unduh file gambar.
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        link.click();
      }
    } catch (err) {
      // AbortError = pengguna menutup dialog berbagi; itu bukan masalah.
      if ((err as Error)?.name !== "AbortError") {
        console.error("Gagal membuat gambar:", err);
        alert("Maaf, gagal membuat gambar. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg bg-card-soft px-3 py-1.5 text-xs font-medium text-ink hover:bg-line/10 disabled:opacity-60"
    >
      {/* Ikon "bagikan" sederhana (SVG inline) */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M12 15V3m0 0L8 7m4-4l4 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {loading ? "Memproses…" : "Bagikan"}
    </button>
  );
}
