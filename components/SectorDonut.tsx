"use client"; // Recharts menggambar di browser.

// =============================================================
// DONUT DIVERSIFIKASI SEKTOR
// Porsi tiap SEKTOR terhadap total nilai portofolio.
// Membantu melihat apakah portofolio terlalu menumpuk di 1 sektor.
// Warna sektor diambil dari palet (bukan warna saham).
// =============================================================

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Stock } from "@/lib/types";
import { hitungPerSektor } from "@/lib/calculations";
import { PALET } from "@/lib/colors";
import { formatRupiah, formatPersen } from "@/lib/format";

interface Props {
  stocks: Stock[];
}

const SURFACE = "rgba(0,0,0,0.35)"; // celah tipis antar irisan

export default function SectorDonut({ stocks }: Props) {
  // Kelompokkan per sektor, buang yang nilainya 0, beri warna dari palet.
  const data = hitungPerSektor(stocks)
    .filter((b) => b.nilai > 0)
    .map((b, i) => ({ ...b, color: PALET[i % PALET.length] }));

  const total = data.reduce((t, d) => t + d.nilai, 0);

  // Tooltip hover: nama sektor + nilai + persen + jumlah saham.
  const TooltipKustom = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const d = payload[0].payload;
    const persen = total > 0 ? (d.nilai / total) * 100 : 0;
    return (
      <div className="rounded-lg border border-line/10 bg-navy px-3 py-2 text-xs shadow-xl">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
          <span className="font-semibold text-ink">{d.sektor}</span>
          <span className="nums ml-auto text-muted">{formatPersen(persen, 1)}</span>
        </div>
        <div className="nums mt-0.5 text-right text-gold">{formatRupiah(d.nilai)}</div>
        <div className="mt-0.5 text-right text-[10px] text-muted">
          {d.jumlahSaham} saham
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl2 bg-card bg-gradient-to-br from-gold/5 via-card to-card p-4 shadow ring-1 ring-gold/10">
      <h2 className="mb-2 text-sm font-semibold">Diversifikasi Sektor</h2>

      {data.length === 0 ? (
        <p className="text-xs text-muted">Belum ada data sektor.</p>
      ) : (
        <>
          {/* Donut + jumlah sektor di tengah */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="nilai"
                  nameKey="sektor"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={1}
                  stroke={SURFACE}
                  strokeWidth={1.5}
                >
                  {data.map((d) => (
                    <Cell key={d.sektor} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipKustom />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="nums text-lg font-semibold text-ink">
                {data.length}
              </span>
              <span className="text-[10px] text-muted">sektor</span>
            </div>
          </div>

          {/* Legend: nama sektor + persen */}
          <ul className="mt-3 space-y-1">
            {data.map((d) => (
              <li key={d.sektor} className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="truncate text-ink">{d.sektor}</span>
                <span className="nums ml-auto text-muted">
                  {formatPersen(total > 0 ? (d.nilai / total) * 100 : 0, 1)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
