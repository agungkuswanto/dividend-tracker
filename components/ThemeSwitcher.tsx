"use client";

// =============================================================
// PEMILIH TEMA
// Mengganti atribut data-theme di <html>, yang membuat semua token
// warna CSS berganti (lihat globals.css). Pilihan disimpan di
// localStorage supaya tetap sama saat halaman dibuka lagi.
// =============================================================

import { useEffect, useState } from "react";

const STORAGE_KEY = "dividend-tracker:theme";

// Daftar tema: id (dipakai di data-theme) + nama + 2 warna contoh
// (bg & aksen) untuk ditampilkan sebagai titik pratinjau.
const THEMES = [
  { id: "midnight", nama: "Midnight", bg: "#0f1623", aksen: "#f5c33b" },
  { id: "emerald", nama: "Emerald", bg: "#0a1512", aksen: "#34d399" },
  { id: "indigo", nama: "Indigo", bg: "#0d1025", aksen: "#818cf8" },
  { id: "slate", nama: "Slate", bg: "#0f172a", aksen: "#38bdf8" },
  { id: "light", nama: "Light", bg: "#f8fafc", aksen: "#ca8a04" },
];

export default function ThemeSwitcher() {
  // Tema aktif. Awalnya "midnight"; nilai asli dibaca di useEffect
  // (menghindari ketidakcocokan server vs klien).
  const [theme, setTheme] = useState("midnight");

  // Saat mount: baca tema yang sedang terpasang / tersimpan.
  useEffect(() => {
    const saatIni =
      document.documentElement.getAttribute("data-theme") ||
      (() => {
        try {
          return localStorage.getItem(STORAGE_KEY);
        } catch {
          return null;
        }
      })() ||
      "midnight";
    setTheme(saatIni);
  }, []);

  // Ganti tema: pasang atribut, simpan, perbarui state.
  const pilih = (id: string) => {
    document.documentElement.setAttribute("data-theme", id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // abaikan bila localStorage diblokir
    }
    setTheme(id);
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-1 text-xs text-muted">Tema</span>
      {THEMES.map((t) => {
        const aktif = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => pilih(t.id)}
            title={t.nama}
            aria-label={`Tema ${t.nama}`}
            aria-pressed={aktif}
            className={`relative h-6 w-6 overflow-hidden rounded-full border transition ${
              aktif
                ? "border-ink ring-2 ring-gold/70"
                : "border-line/25 hover:border-line/50"
            }`}
            // Setengah lingkaran: warna background tema + warna aksen.
            style={{
              background: `linear-gradient(135deg, ${t.bg} 0 50%, ${t.aksen} 50% 100%)`,
            }}
          />
        );
      })}
    </div>
  );
}
