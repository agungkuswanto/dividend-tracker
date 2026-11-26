"use client";

import { forwardRef } from "react";
import { Stock } from "@/lib/types";
import { hitungRingkasan } from "@/lib/calculations";
import {
  formatRupiah,
  formatRibuan,
  formatPersen,
  formatSingkat,
  formatTanggal,
} from "@/lib/format";
import { useCountUp } from "@/hooks/useCountUp";
import MetricTile from "./MetricTile";

interface Props {
  stocks: Stock[];
  showFooter?: boolean; // footer "Dibuat ... · IDR" (ditampilkan saat ekspor gambar)
}

// forwardRef: meneruskan "ref" ke elemen <div> terluar.
// Diperlukan agar Tahap 6 (ekspor PNG) bisa memotret kartu ini.
const SummaryCard = forwardRef<HTMLDivElement, Props>(function SummaryCard(
  { stocks, showFooter = false },
  ref
) {
  // Hitung semua metrik dari daftar saham.
  const r = hitungRingkasan(stocks);

  // Angka utama "naik" mulus dari 0 saat muncul. Dibulatkan ke rupiah penuh.
  // Saat kartu dipakai untuk EKSPOR gambar (showFooter), pakai nilai langsung
  // supaya hasil foto tidak tertangkap di tengah animasi.
  const dividenAnim = useCountUp(r.dividenTahunan);
  const dividenTampil = showFooter ? r.dividenTahunan : Math.round(dividenAnim);

  // Warna gain: hijau kalau untung, merah kalau rugi.
  const gainClass = r.potensiGain >= 0 ? "text-gain" : "text-loss";
  // Tanda "+" untuk nilai positif supaya jelas.
  const tanda = r.potensiGain >= 0 ? "+" : "";

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-xl2 bg-card bg-gradient-to-br from-gold/10 via-card to-card p-5 shadow-lg ring-1 ring-gold/10"
    >
      {/* Cahaya emas halus di pojok (kesan 'premium'). Disembunyikan saat
          ekspor gambar karena efek blur kadang tidak rapi di hasil PNG. */}
      {!showFooter && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl"
        />
      )}

      {/* ---- Bagian atas: angka utama (estimasi dividen SETAHUN) ---- */}
      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
          <span className="h-2 w-2 rounded-sm bg-gold" />
          Estimasi Dividen Setahun
        </div>
        {/* "Rp" dibuat lebih kecil & lembut, angka dibuat besar & tegas. */}
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-gold/70">Rp</span>
          <span className="nums text-4xl font-extrabold tracking-tight text-gold md:text-5xl">
            {formatRibuan(dividenTampil)}
          </span>
        </div>
        <div className="mt-1 text-xs text-muted">
          ≈ {formatSingkat(r.dividenTahunan)} / tahun · {stocks.length} saham
        </div>
      </div>

      {/* Garis pemisah tipis dengan aksen emas yang memudar. */}
      <div className="my-4 h-px bg-gradient-to-r from-gold/25 via-line/10 to-transparent" />

      {/* ---- Grid 3 kolom berisi 6 metrik ringkasan ---- */}
      <div className="relative grid grid-cols-3 gap-2">
        <MetricTile
          label="Rata-rata / bulan"
          value={formatRupiah(r.rataRataPerBulan)}
          valueClass="text-gold"
        />
        <MetricTile
          label="Yield on Cost"
          value={formatPersen(r.yieldOnCost)}
          valueClass="text-gold"
        />
        <MetricTile
          label="Nilai Portofolio"
          value={formatRupiah(r.nilaiPortofolio)}
        />
        <MetricTile label="Kas Disetor" value={formatRupiah(r.kasDisetor)} />
        <MetricTile
          label="Potensi Gain/Loss"
          value={tanda + formatRupiah(r.potensiGain)}
          sub="Belum direalisasi"
          valueClass={gainClass}
        />
        <MetricTile
          label="Gain/Loss (%)"
          value={tanda + formatPersen(r.gainPersen)}
          valueClass={gainClass}
        />
      </div>

      {/* ---- Footer: hanya tampil saat kartu diekspor jadi gambar ---- */}
      {showFooter ? (
        <div className="mt-4 border-t border-line/10 pt-3 text-[11px] text-muted">
          Dibuat {formatTanggal()} · IDR
        </div>
      ) : null}
    </div>
  );
});

export default SummaryCard;
