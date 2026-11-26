// =============================================================
// PALET WARNA SAHAM
// 16 warna cerah yang tersebar merata di roda warna supaya
// antar saham mudah dibedakan di atas background navy gelap.
// Dipakai di: form (pilihan warna) & data contoh.
// =============================================================

export const PALET: string[] = [
  "#f5c33b", // emas
  "#fb923c", // oranye
  "#f87171", // merah
  "#fb7185", // rose
  "#f472b6", // pink
  "#c084fc", // ungu muda
  "#a78bfa", // violet
  "#818cf8", // indigo
  "#60a5fa", // biru
  "#38bdf8", // biru langit
  "#22d3ee", // cyan
  "#2dd4bf", // teal
  "#34d399", // emerald
  "#4ade80", // hijau
  "#a3e635", // lime
  "#facc15", // kuning
];

// Memilih warna pertama yang BELUM dipakai saham lain.
// Berguna saat menambah saham baru supaya warnanya otomatis beda.
// Jika semua warna sudah terpakai, kembali ke warna pertama.
export function pilihWarnaBaru(terpakai: string[]): string {
  const belumDipakai = PALET.find((c) => !terpakai.includes(c));
  return belumDipakai ?? PALET[0];
}
