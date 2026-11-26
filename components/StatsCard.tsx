// =============================================================
// KARTU STATISTIK
// Angka-angka menarik: yield tertinggi/terendah, rata-rata yield,
// bulan dividen terbesar, dan penyumbang dividen teratas.
// =============================================================

import { Stock } from "@/lib/types";
import { hitungStatistik } from "@/lib/calculations";
import { formatPersen, formatSingkat } from "@/lib/format";

interface Props {
  stocks: Stock[];
}

// Satu kotak statistik kecil.
function Item({
  label,
  utama,
  sub,
  utamaClass,
}: {
  label: string;
  utama: string;
  sub?: string;
  utamaClass?: string;
}) {
  return (
    <div className="rounded-xl bg-card-soft px-3 py-2.5">
      <div className="text-[11px] text-muted">{label}</div>
      <div className={`nums mt-0.5 text-sm font-semibold ${utamaClass ?? "text-ink"}`}>
        {utama}
      </div>
      {sub ? <div className="text-[10px] text-muted">{sub}</div> : null}
    </div>
  );
}

export default function StatsCard({ stocks }: Props) {
  const s = hitungStatistik(stocks);

  return (
    <div className="rounded-xl2 bg-card bg-gradient-to-br from-gold/5 via-card to-card p-4 shadow ring-1 ring-gold/10">
      <h2 className="mb-3 text-sm font-semibold">Statistik</h2>
      <div className="grid grid-cols-2 gap-2">
        <Item
          label="Yield tertinggi"
          utama={s.yieldTertinggi ? s.yieldTertinggi.code : "–"}
          sub={s.yieldTertinggi ? formatPersen(s.yieldTertinggi.nilai) : undefined}
          utamaClass="text-gain"
        />
        <Item
          label="Yield terendah"
          utama={s.yieldTerendah ? s.yieldTerendah.code : "–"}
          sub={s.yieldTerendah ? formatPersen(s.yieldTerendah.nilai) : undefined}
          utamaClass="text-loss"
        />
        <Item
          label="Rata-rata yield"
          utama={formatPersen(s.rataYield)}
          sub="yield on cost portofolio"
          utamaClass="text-gold"
        />
        <Item
          label="Bulan terbesar"
          utama={s.bulanTerbesar ? s.bulanTerbesar.nama : "–"}
          sub={s.bulanTerbesar ? formatSingkat(s.bulanTerbesar.jumlah) : undefined}
        />
        <Item
          label="Penyumbang dividen teratas"
          utama={s.kontributorTeratas ? s.kontributorTeratas.code : "–"}
          sub={
            s.kontributorTeratas
              ? `${formatPersen(s.kontributorTeratas.persen, 0)} dari total`
              : undefined
          }
        />
        <Item label="Jumlah saham" utama={String(stocks.length)} sub="di portofolio" />
      </div>
    </div>
  );
}
