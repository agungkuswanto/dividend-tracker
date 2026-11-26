"use client"; // Recharts menggambar di browser -> wajib client component.

// =============================================================
// GRAFIK "Estimasi Dividen Tiap Bulan"
// Stacked bar chart Jan–Des. Tiap warna = satu saham.
// - Total tertera di atas tiap batang (mis. "6,37 jt").
// - Tooltip (saat disentuh/hover) memperlihatkan rincian per saham.
// =============================================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { Stock } from "@/lib/types";
import { hitungDividenPerBulan } from "@/lib/calculations";
import { formatSingkat, formatRupiah } from "@/lib/format";

interface Props {
  stocks: Stock[];
}

// "Celah" tipis antar segmen batang. Memakai hitam transparan agar terlihat
// sebagai pemisah halus di SEMUA tema (tidak terikat satu warna kartu).
const SURFACE = "rgba(0,0,0,0.35)";

// ---- Tooltip kustom (kotak yang muncul saat hover) ----
// Menampilkan bulan, rincian tiap saham (yang nilainya > 0), dan total.
function TooltipKustom({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  // Jumlahkan semua segmen untuk total bulan tsb.
  const total = payload.reduce((t: number, p: any) => t + (p.value || 0), 0);

  return (
    <div className="rounded-lg border border-line/10 bg-navy px-3 py-2 text-xs shadow-xl">
      <div className="mb-1 font-semibold text-ink">{label}</div>
      {payload
        .filter((p: any) => p.value > 0)
        .map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-muted">{p.dataKey}</span>
            <span className="nums ml-auto text-ink">
              {formatRupiah(p.value)}
            </span>
          </div>
        ))}
      <div className="mt-1 border-t border-line/10 pt-1 text-right font-semibold text-gold">
        Total {formatRupiah(total)}
      </div>
    </div>
  );
}

// ---- Label total di atas batang ----
// Dipasang pada segmen teratas; posisinya pas di puncak tumpukan.
// Angka 0 tidak ditampilkan supaya tidak berantakan.
function renderTotalLabel(props: any) {
  const { x, y, width, value } = props;
  if (!value || value <= 0) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fontSize={10}
      fontWeight={600}
      className="fill-ink"
    >
      {formatSingkat(value)}
    </text>
  );
}

export default function DividendChart({ stocks }: Props) {
  // Data 12 bulan. Tiap baris punya "total" + nilai per kode saham.
  const data = hitungDividenPerBulan(stocks);

  // Saham yang benar-benar punya dividen (agar legend tidak penuh saham kosong).
  const stocksBerdividen = stocks.filter((s) => s.dividends.length > 0);

  return (
    <div className="rounded-xl2 bg-card bg-gradient-to-br from-gold/5 via-card to-card p-4 shadow ring-1 ring-gold/10">
      <h2 className="mb-3 text-sm font-semibold">Estimasi Dividen Tiap Bulan</h2>

      {/* ResponsiveContainer membuat grafik ikut lebar HP/desktop. */}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 20, right: 4, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="bulan"
            tick={{ className: "fill-muted", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          {/* Sumbu-Y disembunyikan: total sudah tampil di atas batang. */}
          <YAxis hide />

          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            content={<TooltipKustom />}
          />

          <Legend
            wrapperStyle={{ fontSize: 11 }}
            iconType="circle"
            iconSize={8}
            // Teks legend pakai warna token (titik warna tetap = warna saham).
            formatter={(value) => <span className="text-muted">{value}</span>}
          />

          {/* Satu <Bar> per saham, semuanya stackId sama = bertumpuk. */}
          {stocksBerdividen.map((s, i) => {
            const isTop = i === stocksBerdividen.length - 1; // segmen teratas
            return (
              <Bar
                key={s.id}
                dataKey={s.code}
                stackId="dividen"
                fill={s.color}
                stroke={SURFACE} // celah tipis antar warna
                strokeWidth={1.5}
                // Sudut sedikit membulat di batang paling atas.
                radius={isTop ? [4, 4, 0, 0] : undefined}
              >
                {/* Label total hanya dipasang sekali, di segmen teratas. */}
                {isTop && (
                  <LabelList dataKey="total" content={renderTotalLabel} />
                )}
              </Bar>
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
