// =============================================================
// FORMAT ANGKA GAYA INDONESIA
// - Rupiah: "Rp 2.266.794" (pemisah ribuan = titik)
// - Persen: "10,15%"       (pemisah desimal = koma)
// - Singkat: "6,37 jt" (juta), "12,50 rb" (ribu)
//
// Kita pakai Intl.NumberFormat dengan locale "id-ID" supaya
// aturan titik/koma otomatis mengikuti kaidah Indonesia.
// =============================================================

// Memformat bilangan bulat dengan pemisah ribuan titik.
// Contoh: 2266794 -> "2.266.794"
export function formatRibuan(nilai: number): string {
  // Math.round membulatkan ke bilangan bulat terdekat (harga saham utuh).
  const bulat = Math.round(nilai);
  return new Intl.NumberFormat("id-ID").format(bulat);
}

// Memformat ke Rupiah. Contoh: 2266794 -> "Rp 2.266.794"
export function formatRupiah(nilai: number): string {
  return "Rp " + formatRibuan(nilai);
}

// Memformat persen dengan koma desimal.
// Contoh: formatPersen(10.15) -> "10,15%"
// Parameter "desimal" mengatur jumlah angka di belakang koma (default 2).
export function formatPersen(nilai: number, desimal = 2): string {
  const teks = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: desimal,
    maximumFractionDigits: desimal,
  }).format(nilai);
  return teks + "%";
}

// Memformat angka besar jadi singkatan "jt" (juta) / "rb" (ribu).
// Dipakai untuk label total di atas batang grafik.
// Contoh:
//   6370000 -> "6,37 jt"
//   12500   -> "12,50 rb"
//   850     -> "850"
export function formatSingkat(nilai: number, desimal = 2): string {
  const absolut = Math.abs(nilai);

  // Fungsi bantu: bagi angka lalu format dengan koma desimal id-ID.
  const bagiDanFormat = (pembagi: number): string =>
    new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: desimal,
      maximumFractionDigits: desimal,
    }).format(nilai / pembagi);

  if (absolut >= 1_000_000) {
    return bagiDanFormat(1_000_000) + " jt";
  }
  if (absolut >= 1_000) {
    return bagiDanFormat(1_000) + " rb";
  }
  // Angka kecil ditampilkan apa adanya (dibulatkan).
  return formatRibuan(nilai);
}

// Memformat tanggal Indonesia untuk footer gambar.
// Contoh: "18 November 2026"
export function formatTanggal(tanggal: Date = new Date()): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(tanggal);
}
