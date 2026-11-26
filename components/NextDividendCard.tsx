"use client";

// =============================================================
// KARTU "DIVIDEN BERIKUTNYA" (HITUNG MUNDUR)
// Menonjolkan pembayaran dividen TERDEKAT:
// - hitung mundur (perkiraan hari / "bulan ini")
// - total perkiraan yang diterima di bulan itu
// - daftar saham yang membayar
//
// Catatan: data hanya menyimpan BULAN (bukan tanggal pasti), jadi
// hari ditampilkan sebagai perkiraan menuju awal bulan target.
// =============================================================

import { Stock } from "@/lib/types";
import { hitungJadwalMendatang } from "@/lib/calculations";
import { formatRupiah } from "@/lib/format";

interface Props {
  stocks: Stock[];
}

export default function NextDividendCard({ stocks }: Props) {
  const jadwal = hitungJadwalMendatang(stocks);

  // Belum ada jadwal dividen sama sekali.
  if (jadwal.length === 0) {
    return (
      <div className="rounded-xl2 bg-card p-4 shadow ring-1 ring-line/5">
        <h2 className="text-sm font-semibold">⏳ Dividen Berikutnya</h2>
        <p className="mt-2 text-xs text-muted">
          Belum ada jadwal dividen. Tambahkan lewat form saham.
        </p>
      </div>
    );
  }

  // jadwal sudah diurutkan dari yang terdekat. Ambil semua pembayaran
  // di bulan terdekat yang sama (bisa lebih dari 1 saham).
  const terdekat = jadwal[0].bulanLagi;
  const grup = jadwal.filter((j) => j.bulanLagi === terdekat);
  const total = grup.reduce((jumlah, j) => jumlah + j.jumlah, 0);
  const namaBulan = grup[0].namaBulan;

  // Perkiraan jumlah hari menuju AWAL bulan target.
  // (new Date menangani luapan bulan ke tahun depan secara otomatis.)
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + terdekat, 1);
  const hariLagi = Math.max(
    0,
    Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Angka besar hitung mundur + keterangan di bawahnya.
  const labelBesar = terdekat === 0 ? "Bulan ini" : `± ${hariLagi} hari`;
  const subLabel =
    terdekat === 0
      ? "Jadwal pembayaran bulan ini 🎉"
      : terdekat === 1
      ? `Bulan depan · ${namaBulan}`
      : `${terdekat} bulan lagi · ${namaBulan}`;

  return (
    <div className="relative overflow-hidden rounded-xl2 bg-card bg-gradient-to-br from-gold/5 via-card to-card p-4 shadow-lg ring-1 ring-gold/10">
      <h2 className="text-sm font-semibold">⏳ Dividen Berikutnya</h2>

      {/* Hitung mundur */}
      <div className="nums mt-2 text-3xl font-extrabold tracking-tight text-gold">
        {labelBesar}
      </div>
      <div className="mt-1 text-xs text-muted">{subLabel}</div>

      {/* Total + daftar saham yang membayar */}
      <div className="mt-3 rounded-xl bg-card-soft px-3 py-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Perkiraan diterima</span>
          <span className="nums font-semibold text-gold">
            {formatRupiah(total)}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {grup.map((j, i) => (
            <span
              key={`${j.stockId}-${i}`}
              className="flex items-center gap-1 rounded-full bg-line/10 px-2 py-0.5 text-[10px]"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: j.color }}
              />
              {j.code}
              {j.label ? <span className="text-muted">· {j.label}</span> : null}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-2 text-[10px] text-muted">
        Perkiraan berdasarkan bulan pembayaran (tanggal pasti belum dicatat).
      </p>
    </div>
  );
}
