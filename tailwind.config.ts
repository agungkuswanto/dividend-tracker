import type { Config } from "tailwindcss";

// Konfigurasi Tailwind.
// "content" memberitahu Tailwind file mana saja yang perlu dipindai
// supaya class yang tidak dipakai dibuang (bundle jadi kecil).
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Font utama memakai variable dari next/font (lihat app/layout.tsx).
      // Cadangan ke font sistem bila font gagal dimuat.
      fontFamily: {
        sans: [
          "var(--font-jakarta)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      // Warna kustom menunjuk ke CSS variable tema (lihat globals.css).
      // Pola rgb(var(--x) / <alpha-value>) membuat opacity tetap bisa dipakai,
      // mis. bg-gold/10. Nilai variabel berganti saat tema diganti.
      colors: {
        navy: "rgb(var(--c-bg) / <alpha-value>)", // background utama
        card: "rgb(var(--c-card) / <alpha-value>)", // kartu
        "card-soft": "rgb(var(--c-soft) / <alpha-value>)", // kartu-dalam
        gold: "rgb(var(--c-gold) / <alpha-value>)", // aksen utama
        gain: "rgb(var(--c-gain) / <alpha-value>)", // hijau untung
        loss: "rgb(var(--c-loss) / <alpha-value>)", // merah rugi
        muted: "rgb(var(--c-muted) / <alpha-value>)", // teks sekunder
        ink: "rgb(var(--c-text) / <alpha-value>)", // teks utama (ganti text-white)
        line: "rgb(var(--c-line) / <alpha-value>)", // garis & overlay halus
        onaccent: "rgb(var(--c-on-accent) / <alpha-value>)", // teks di atas tombol aksen
      },
      borderRadius: {
        xl2: "1.25rem", // sudut membulat besar untuk kartu
      },
    },
  },
  plugins: [],
};

export default config;
