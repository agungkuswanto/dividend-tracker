"use client"; // Recharts menggambar di browser.

// =============================================================
// DONUT KOMPOSISI PORTOFOLIO
// Porsi tiap saham terhadap total NILAI portofolio.
// Setiap irisan berwarna sesuai warna saham + legend kecil di bawah.
// =============================================================

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Stock } from "@/lib/types";
import { hitungNilaiSekarang } from "@/lib/calculations";
import { formatRupiah, formatPersen, formatSingkat } from "@/lib/format";

interface Props {
  stocks: Stock[];
}

const SURFACE = "rgba(0,0,0,0.35)"; // celah tipis antar irisan (netral di semua tema)

export default function CompositionDonut({ stocks }: Props) {
  // Siapkan data: kode, nilai, warna. Abaikan yang nilainya 0.
  const data = stocks
    .map((s) => ({ code: s.code, value: hitungNilaiSekarang(s), color: s.color }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value); // besar ke kecil

  const total = data.reduce((t, d) => t + d.value, 0);

  // Tooltip saat hover: kode, nilai, dan persentasenya.
  const TooltipKustom = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const d = payload[0].payload;
    const persen = total > 0 ? (d.value / total) * 100 : 0;
    return (
      <div className="rounded-lg border border-line/10 bg-navy px-3 py-2 text-xs shadow-xl">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
          <span className="font-semibold text-ink">{d.code}</span>
          <span className="nums ml-auto text-muted">{formatPersen(persen, 1)}</span>
        </div>
        <div className="nums mt-0.5 text-right text-gold">{formatRupiah(d.value)}</div>
      </div>
    );
  };

  return (
    <div className="rounded-xl2 bg-card bg-gradient-to-br from-gold/5 via-card to-card p-4 shadow ring-1 ring-gold/10">
      <h2 className="mb-2 text-sm font-semibold">Komposisi Portofolio</h2>

      {data.length === 0 ? (
        <p className="text-xs text-muted">Belum ada nilai portofolio.</p>
      ) : (
        <>
          {/* Donut + angka total di tengah */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="code"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={1}
                  stroke={SURFACE}
                  strokeWidth={1.5}
                >
                  {data.map((d) => (
                    <Cell key={d.code} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipKustom />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Label tengah (pointer-events-none agar tidak menghalangi hover) */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-muted">Total</span>
              <span className="nums text-sm font-semibold text-ink">
                {formatSingkat(total)}
              </span>
            </div>
          </div>

          {/* Legend: kode + persen tiap saham */}
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
            {data.map((d) => (
              <li key={d.code} className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-ink">{d.code}</span>
                <span className="nums ml-auto text-muted">
                  {formatPersen(total > 0 ? (d.value / total) * 100 : 0, 1)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
