import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Font Plus Jakarta Sans dari Google Fonts.
// next/font mengunduh & mengoptimasi otomatis (tanpa install manual).
// "variable" membuat font tersedia sebagai CSS variable --font-jakarta,
// yang lalu dipakai di globals.css sebagai font utama.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"], // tebal biasa s/d sangat tebal
  variable: "--font-jakarta",
  display: "swap", // tampilkan teks dulu, font menyusul (tanpa teks hilang)
});

// Metadata = info yang muncul di tab browser & saat dibagikan.
export const metadata: Metadata = {
  title: "Dividend Tracker",
  description: "Pelacak dividen saham IDX sederhana",
};

// RootLayout membungkus SEMUA halaman. Apa pun yang ada di sini
// (mis. <html>, <body>) berlaku untuk seluruh aplikasi.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: atribut data-theme diubah skrip di bawah
    // SEBELUM React hydrate, jadi perbedaan server/klien di sini wajar.
    <html lang="id" suppressHydrationWarning className={jakarta.variable}>
      <body>
        {/* Skrip kecil ini membaca tema tersimpan & memasangnya sebelum
            konten digambar, supaya tidak ada kedipan warna default. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('dividend-tracker:theme');if(t){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
