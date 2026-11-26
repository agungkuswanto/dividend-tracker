// =============================================================
// BACKUP: ekspor & impor portofolio sebagai file JSON
// Bagian ini hanya logika data (parse + validasi) tanpa menyentuh
// DOM, supaya mudah diuji. Proses unduh/baca file ada di komponen.
// =============================================================

import { Stock, DividendPayment } from "./types";

// Bentuk isi file backup.
export interface BackupFile {
  app: "dividend-tracker";
  version: number;
  exportedAt: string; // waktu ekspor (ISO)
  stocks: Stock[];
}

// Membungkus daftar saham menjadi objek backup lengkap (dengan metadata).
export function buatBackup(stocks: Stock[]): BackupFile {
  return {
    app: "dividend-tracker",
    version: 1,
    exportedAt: new Date().toISOString(),
    stocks,
  };
}

// Mengubah angka dengan aman; melempar error yang jelas bila bukan angka.
function keAngka(nilai: unknown, namaField: string, kodeSaham: string): number {
  const n = Number(nilai);
  if (!Number.isFinite(n)) {
    throw new Error(`Saham ${kodeSaham}: "${namaField}" bukan angka yang valid.`);
  }
  return n;
}

// Membersihkan & memvalidasi satu entri saham dari data mentah.
function normalisasiSaham(raw: any, indeks: number): Stock {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Saham ke-${indeks + 1} bukan objek yang valid.`);
  }

  const code = String(raw.code ?? "").trim().toUpperCase();
  if (!code) throw new Error(`Saham ke-${indeks + 1}: kode saham kosong.`);

  // Validasi daftar dividen (boleh kosong).
  const dividends: DividendPayment[] = Array.isArray(raw.dividends)
    ? raw.dividends.map((d: any, j: number) => ({
        id: String(d?.id ?? `${code}-${j}`),
        dps: keAngka(d?.dps, "dps", code),
        // Pastikan bulan di rentang 1..12.
        month: Math.min(12, Math.max(1, Math.round(keAngka(d?.month, "month", code)))),
        label: d?.label ? String(d.label) : undefined,
      }))
    : [];

  return {
    id: String(raw.id ?? code.toLowerCase()),
    code,
    name: raw.name ? String(raw.name) : undefined,
    lots: keAngka(raw.lots, "lots", code),
    avgBuyPrice: keAngka(raw.avgBuyPrice, "avgBuyPrice", code),
    currentPrice: keAngka(raw.currentPrice, "currentPrice", code),
    color: raw.color ? String(raw.color) : "#f5c33b",
    sector: raw.sector ? String(raw.sector) : undefined,
    dividends,
  };
}

// Mengubah teks file JSON menjadi daftar Stock yang valid.
// Menerima dua bentuk: array saham langsung, atau objek { stocks: [...] }.
// Melempar Error dengan pesan jelas bila file tidak valid.
export function parseBackup(teks: string): Stock[] {
  let data: unknown;
  try {
    data = JSON.parse(teks);
  } catch {
    throw new Error("File bukan JSON yang valid.");
  }

  const arr = Array.isArray(data)
    ? data
    : (data as { stocks?: unknown })?.stocks;

  if (!Array.isArray(arr)) {
    throw new Error("Struktur file tidak dikenali (daftar saham tidak ditemukan).");
  }

  return arr.map((raw, i) => normalisasiSaham(raw, i));
}
