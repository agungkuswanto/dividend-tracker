// =============================================================
// HELPER AMBIL HARGA (sisi browser)
// Memanggil API route kita sendiri: /api/harga?kode=BBRI,TLKM
// Komponen cukup memakai fungsi ini tanpa tahu detail jaringan.
// =============================================================

// Data satu saham dari API (harga terakhir + nama perusahaan bila ada).
export interface DataSaham {
  harga: number;
  nama?: string;
}

// Bentuk jawaban dari /api/harga (sama dengan di route.ts).
export interface HasilHarga {
  hasil: Record<string, DataSaham>; // { "BBRI": { harga: 3070, nama: "..." } }
  gagal: string[]; // kode yang tidak dapat harga
}

// Minta data untuk sekumpulan kode saham.
// Melempar error bila server tidak bisa dihubungi.
export async function ambilHarga(kode: string[]): Promise<HasilHarga> {
  const query = encodeURIComponent(kode.join(","));
  const res = await fetch(`/api/harga?kode=${query}`);
  if (!res.ok) throw new Error("Gagal menghubungi server harga");
  return res.json();
}
