// =============================================================
// TIPE DATA (bentuk data aplikasi)
// File ini hanya mendefinisikan "bentuk" data, bukan logika.
// Dengan TypeScript, tipe membantu mencegah salah ketik & salah isi.
// =============================================================

// Satu kali pembayaran dividen untuk sebuah saham.
// Sebuah saham bisa punya >1 pembayaran per tahun (mis. interim + final).
export interface DividendPayment {
  id: string; // id unik (untuk key React & edit/hapus)
  dps: number; // Dividen Per lembar Saham (DPS), dalam Rupiah per lembar
  month: number; // bulan pembayaran: 1 = Januari ... 12 = Desember
  label?: string; // opsional, mis. "Interim" atau "Final"
}

// Satu baris saham di portofolio.
export interface Stock {
  id: string; // id unik
  code: string; // kode saham IDX, mis. "BBRI"
  name?: string; // nama perusahaan (opsional), mis. "Bank BRI"
  lots: number; // jumlah lot. INGAT: 1 lot = 100 lembar
  avgBuyPrice: number; // harga beli rata-rata per LEMBAR (Rupiah)
  currentPrice: number; // harga sekarang per LEMBAR (Rupiah)
  color: string; // warna saham di grafik (hex, mis. "#f5c33b")
  sector?: string; // sektor/industri (opsional), mis. "Keuangan", "Energi"
  dividends: DividendPayment[]; // jadwal dividen saham ini
}

// 1 lot di Bursa Efek Indonesia (IDX) = 100 lembar.
// Dibuat konstanta supaya tidak ada "angka ajaib" yang tersebar di kode.
export const LEMBAR_PER_LOT = 100;
