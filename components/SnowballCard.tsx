"use client"; // Interaktif: ada slider, state, & grafik Recharts (gambar di browser).

// =============================================================
// KARTU SIMULASI "SNOWBALL" (BOLA SALJU DIVIDEN)
// Proyeksi pertumbuhan dividen bertahun-tahun bila dividen
// direinvestasi. Pengguna mengatur 4 asumsi lewat slider/input:
//   - lama proyeksi (tahun)
//   - yield (% dividen per tahun, dianggap tetap)
//   - pertumbuhan harga saham / apresiasi (% per tahun)
//   - setoran rutin (Rp per bulan)
// Grafik membandingkan 2 skenario: DENGAN vs TANPA reinvest.
// =============================================================

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { simulasiSnowball } from "@/lib/calculations";
import { formatRupiah, formatSingkat, formatRibuan } from "@/lib/format";

interface Props {
  nilaiAwal: number; // nilai portofolio saat ini (modal awal simulasi)
  dividenTahunan: number; // dividen setahun saat ini (untuk menebak yield awal)
}

// Pilihan lama proyeksi (tahun).
const OPSI_TAHUN = [5, 10, 15, 20];

// Komponen kecil: satu baris slider dengan label + nilai yang tampil.
function Slider({
  label,
  nilai,
  setNilai,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  nilai: number;
  setNilai: (n: number) => void;
  min: number;
  max: number;
  step: number;
  suffix: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="nums font-semibold text-gold">
          {nilai}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={nilai}
        onChange={(e) => setNilai(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-card-soft accent-gold"
      />
    </label>
  );
}

export default function SnowballCard({ nilaiAwal, dividenTahunan }: Props) {
  // Tebak yield awal dari portofolio (dividen ÷ nilai). Kalau portofolio
  // masih kosong, pakai 5% sebagai angka awal yang masuk akal.
  const yieldDefault =
    nilaiAwal > 0
      ? Number(((dividenTahunan / nilaiAwal) * 100).toFixed(1))
      : 5;

  // --- Asumsi yang bisa diubah pengguna ---
  const [tahun, setTahun] = useState(5);
  const [yieldPersen, setYieldPersen] = useState(yieldDefault);
  const [pertumbuhan, setPertumbuhan] = useState(5);
  const [setoran, setSetoran] = useState(""); // string digit (Rp/bln), kosong = 0

  // Jalankan simulasi. useMemo = hitung ulang HANYA bila ada asumsi berubah.
  const data = useMemo(
    () =>
      simulasiSnowball({
        nilaiAwal,
        yieldPersen,
        pertumbuhanPersen: pertumbuhan,
        setoranBulanan: Number(setoran) || 0,
        tahun,
      }),
    [nilaiAwal, yieldPersen, pertumbuhan, setoran, tahun]
  );

  // Baris terakhir = kondisi di akhir proyeksi.
  const akhir = data[data.length - 1];

  // "Income panen": bila setelah periode snowball kita BERHENTI reinvest lalu
  // menarik yield dari seluruh aset yang sudah terkumpul. Dihitung dari NILAI
  // ASET AKHIR (bukan awal tahun) supaya sesuai cara umum: yield% × total aset.
  const asetAkhir = akhir ? akhir.nilaiReinvest : 0;
  const incomeTahunan = asetAkhir * (yieldPersen / 100);
  const incomeBulanan = incomeTahunan / 12;

  // Total dividen yang diterima selama periode (untuk tiap skenario).
  const totalReinvest = data.reduce((t, d) => t + d.dividenReinvest, 0);
  const totalTanpa = data.reduce((t, d) => t + d.dividenTanpa, 0);
  const ekstra = totalReinvest - totalTanpa; // "bonus" dari reinvest

  const inputClass =
    "w-full rounded-lg bg-navy border border-line/10 px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none";

  // Tooltip grafik: tahun + dividen kedua skenario.
  const TooltipKustom = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div className="rounded-lg border border-line/10 bg-navy px-3 py-2 text-xs shadow-xl">
        <div className="mb-1 font-semibold text-ink">Tahun ke-{label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-muted">{p.name}</span>
            <span className="nums ml-auto text-ink">{formatRupiah(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-xl2 bg-card bg-gradient-to-br from-gold/10 via-card to-card p-5 shadow-lg ring-1 ring-gold/10">
      {/* Glow lembut di pojok (aksen premium). */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl" />

      <h2 className="text-sm font-semibold">❄️ Simulasi Snowball</h2>
      <p className="mt-1 text-[11px] text-muted">
        Proyeksi bila dividen diputar kembali jadi modal. Atur asumsinya di bawah.
      </p>

      {/* ---------- SOROTAN HASIL ---------- */}
      {/* Mencerminkan cara umum berpikir: setelah N tahun, nilai aset jadi
          sekian, lalu income/bulan = yield% × nilai aset akhir ÷ 12. */}
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] text-muted">
            Income per bulan di tahun ke-{tahun} (yield {yieldPersen}%)
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-semibold text-gold/70">Rp</span>
            <span className="nums text-3xl font-extrabold tracking-tight text-gold md:text-4xl">
              {formatRibuan(incomeBulanan)}
            </span>
          </div>
          <div className="text-[11px] text-muted">
            dari nilai aset akhir {formatSingkat(asetAkhir)}
          </div>
        </div>
      </div>

      {/* Garis aksen emas sebagai pemisah halus. */}
      <div className="my-4 h-px bg-gradient-to-r from-gold/25 via-line/10 to-transparent" />

      {/* ---------- GRAFIK 2 SKENARIO ---------- */}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-line/10" vertical={false} />
          <XAxis
            dataKey="tahun"
            tick={{ className: "fill-muted", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(t) => `Th ${t}`}
          />
          <YAxis
            tick={{ className: "fill-muted", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v) => formatSingkat(v, 0)}
          />
          <Tooltip content={<TooltipKustom />} />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            iconType="plainline"
            formatter={(value) => <span className="text-muted">{value}</span>}
          />
          {/* Skenario reinvest: garis emas tebal (yang membentuk bola salju). */}
          <Line
            type="monotone"
            dataKey="dividenReinvest"
            name="Dengan reinvest"
            stroke="rgb(var(--c-gold))"
            strokeWidth={2.5}
            dot={false}
          />
          {/* Skenario tanpa reinvest: garis abu putus-putus (pembanding). */}
          <Line
            type="monotone"
            dataKey="dividenTanpa"
            name="Tanpa reinvest"
            stroke="rgb(var(--c-muted))"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Ringkasan selisih (bonus bola salju). */}
      <div className="mt-2 rounded-lg bg-card-soft px-3 py-2 text-[11px] text-muted">
        Total dividen {tahun} tahun:{" "}
        <span className="nums font-semibold text-ink">
          {formatRupiah(totalReinvest)}
        </span>{" "}
        — reinvest menambah{" "}
        <span className="nums font-semibold text-gain">{formatRupiah(ekstra)}</span>{" "}
        dibanding diambil tunai. 🌱
      </div>

      {/* ---------- PENGATURAN ASUMSI ---------- */}
      <div className="mt-4 space-y-3">
        {/* Lama proyeksi: chip pilihan tahun. */}
        <div>
          <div className="mb-1 text-xs text-muted">Lama proyeksi</div>
          <div className="flex gap-2">
            {OPSI_TAHUN.map((th) => (
              <button
                key={th}
                type="button"
                onClick={() => setTahun(th)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                  tahun === th
                    ? "bg-gold text-onaccent"
                    : "bg-card-soft text-muted hover:text-ink"
                }`}
              >
                {th} th
              </button>
            ))}
          </div>
        </div>

        <Slider
          label="Yield (dividen per tahun)"
          nilai={yieldPersen}
          setNilai={setYieldPersen}
          min={0}
          max={15}
          step={0.1}
          suffix="%"
        />

        <Slider
          label="Pertumbuhan harga saham / tahun"
          nilai={pertumbuhan}
          setNilai={setPertumbuhan}
          min={0}
          max={20}
          step={1}
          suffix="%"
        />

        {/* Setoran rutin: input teks dengan titik ribuan + awalan "Rp". */}
        <label className="block">
          <span className="text-xs text-muted">Setoran rutin per bulan (opsional)</span>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              Rp
            </span>
            <input
              className={inputClass + " nums pl-9"}
              type="text"
              inputMode="numeric"
              value={setoran ? formatRibuan(Number(setoran)) : ""}
              onChange={(e) => setSetoran(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
            />
          </div>
        </label>
      </div>
    </div>
  );
}
