// =============================================================
// KALENDER DIVIDEN
// Daftar pembayaran dividen yang akan datang, diurutkan dari
// yang paling dekat. Karena data hanya menyimpan BULAN (bukan
// tanggal pasti), hitung mundur ditampilkan dalam satuan bulan.
// =============================================================

import { Stock } from "@/lib/types";
import { hitungJadwalMendatang } from "@/lib/calculations";
import { formatRupiah } from "@/lib/format";

interface Props {
  stocks: Stock[];
}

// Ubah "berapa bulan lagi" jadi teks badge yang ramah dibaca.
function labelWaktu(bulanLagi: number): string {
  if (bulanLagi === 0) return "Bulan ini";
  if (bulanLagi === 1) return "Bulan depan";
  return `${bulanLagi} bln lagi`;
}

export default function DividendCalendar({ stocks }: Props) {
  const jadwal = hitungJadwalMendatang(stocks);

  return (
    <div className="rounded-xl2 bg-card bg-gradient-to-br from-gold/5 via-card to-card p-4 shadow ring-1 ring-gold/10">
      <h2 className="mb-1 text-sm font-semibold">Kalender Dividen</h2>
      <p className="mb-3 text-[11px] text-muted">
        Pembayaran terdekat lebih dulu (perkiraan, berdasarkan bulan).
      </p>

      {jadwal.length === 0 ? (
        <p className="text-xs text-muted">
          Belum ada jadwal dividen. Tambahkan lewat form saham.
        </p>
      ) : (
        <ul className="space-y-2">
          {jadwal.map((j, i) => (
            <li
              key={`${j.stockId}-${j.month}-${i}`}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                j.bulanLagi === 0 ? "bg-gold/10 ring-1 ring-gold/30" : "bg-card-soft"
              }`}
            >
              {/* Titik warna saham */}
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: j.color }}
              />

              {/* Kode + label + bulan */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{j.code}</span>
                  {j.label ? (
                    <span className="rounded bg-line/10 px-1.5 py-0.5 text-[10px] text-muted">
                      {j.label}
                    </span>
                  ) : null}
                </div>
                <div className="text-[11px] text-muted">{j.namaBulan}</div>
              </div>

              {/* Nominal + hitung mundur */}
              <div className="text-right">
                <div className="nums text-sm font-medium text-gold">
                  {formatRupiah(j.jumlah)}
                </div>
                <div className="text-[10px] text-muted">
                  {labelWaktu(j.bulanLagi)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
