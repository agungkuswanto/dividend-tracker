"use client";

// =============================================================
// KARTU TARGET PASSIVE INCOME
// Menampilkan progress menuju target dividen tahunan:
// - progress bar + persentase
// - sisa menuju target (atau selamat bila tercapai)
// - mode edit dengan preset cepat (per bulan)
// =============================================================

import { useState } from "react";
import { useTarget } from "@/hooks/useTarget";
import { formatRupiah, formatSingkat, formatPersen, formatRibuan } from "@/lib/format";

interface Props {
  dividenTahunan: number; // estimasi dividen setahun saat ini (dari portofolio)
}

// Preset target yang umum, ditulis sebagai "per bulan" karena investor
// dividen biasanya berpikir dalam target bulanan. Nilai disimpan per TAHUN.
const PRESET = [
  { label: "500rb/bln", nilai: 6_000_000 },
  { label: "1jt/bln", nilai: 12_000_000 },
  { label: "2jt/bln", nilai: 24_000_000 },
  { label: "5jt/bln", nilai: 60_000_000 },
];

export default function TargetCard({ dividenTahunan }: Props) {
  const { target, setTarget, loaded } = useTarget();

  // State mode edit + nilai sementara yang sedang diketik.
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  // Jangan tampilkan apa pun sebelum target dibaca (hindari kedip).
  if (!loaded) return null;

  // Hitung progres.
  const persen = target > 0 ? (dividenTahunan / target) * 100 : 0;
  const persenBar = Math.min(persen, 100); // lebar bar maksimal 100%
  const tercapai = target > 0 && dividenTahunan >= target;
  const sisa = Math.max(target - dividenTahunan, 0);
  const lebih = Math.max(dividenTahunan - target, 0);

  // Buka mode edit dengan nilai target saat ini sebagai awal.
  const mulaiEdit = () => {
    setDraft(target ? String(target) : "");
    setEditing(true);
  };

  // Simpan target dari input.
  const simpan = () => {
    const nilai = Number(draft);
    if (nilai >= 0) setTarget(nilai);
    setEditing(false);
  };

  const inputClass =
    "w-full rounded-lg bg-navy border border-line/10 px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none";

  return (
    <div className="relative overflow-hidden rounded-xl2 bg-card bg-gradient-to-br from-gold/5 via-card to-card p-5 shadow-lg ring-1 ring-gold/10">
      {/* Judul + tombol ubah */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">🎯 Target Passive Income</h2>
        {!editing && target > 0 && (
          <button
            onClick={mulaiEdit}
            className="rounded-md bg-card-soft px-2 py-1 text-xs text-muted hover:text-ink"
          >
            Ubah
          </button>
        )}
      </div>

      {/* ---------- MODE EDIT ---------- */}
      {editing ? (
        <div className="mt-3">
          <label className="block">
            <span className="text-xs text-muted">
              Target dividen per tahun
            </span>
            {/* Input teks (bukan number) supaya bisa menampilkan titik ribuan.
                - draft menyimpan ANGKA saja (mis. "12000000")
                - yang ditampilkan diberi titik + awalan "Rp" (mis. "Rp 12.000.000")
                - saat diketik, semua karakter non-angka dibuang. */}
            <div className="relative mt-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                Rp
              </span>
              <input
                className={inputClass + " nums pl-9"}
                type="text"
                inputMode="numeric"
                value={draft ? formatRibuan(Number(draft)) : ""}
                onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
                placeholder="12.000.000"
                autoFocus
              />
            </div>
          </label>

          {/* Preset cepat */}
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESET.map((p) => (
              <button
                key={p.nilai}
                type="button"
                onClick={() => setDraft(String(p.nilai))}
                className="rounded-full bg-card-soft px-3 py-1 text-xs text-muted hover:text-gold"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 rounded-lg bg-card-soft py-2 text-sm font-medium text-ink"
            >
              Batal
            </button>
            <button
              onClick={simpan}
              className="flex-1 rounded-lg bg-gold py-2 text-sm font-bold text-onaccent"
            >
              Simpan
            </button>
          </div>
        </div>
      ) : target === 0 ? (
        /* ---------- BELUM ADA TARGET ---------- */
        <div className="mt-3">
          <p className="text-xs text-muted">
            Tentukan target dividen tahunanmu untuk melihat progres dan tetap
            semangat menabung saham. 🌱
          </p>
          <button
            onClick={mulaiEdit}
            className="mt-3 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-onaccent"
          >
            Atur Target
          </button>
        </div>
      ) : (
        /* ---------- TAMPILAN PROGRES ---------- */
        <div className="mt-3">
          {/* Angka: pencapaian / target */}
          <div className="flex items-end justify-between">
            <div className="nums text-3xl font-extrabold tracking-tight text-gold">
              {formatPersen(persen, 0)}
            </div>
            <div className="nums text-right text-xs text-muted">
              {formatRupiah(dividenTahunan)}{" "}
              <span className="text-muted">/ {formatRupiah(target)}</span>
              <div>per tahun</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-card-soft">
            <div
              className="h-full rounded-full bg-gold transition-all duration-700 ease-out"
              style={{ width: `${persenBar}%` }}
            />
          </div>

          {/* Status: tercapai atau sisa */}
          <div className="mt-2 text-xs">
            {tercapai ? (
              <span className="text-gain">
                🎉 Target tercapai! Lampaui {formatRupiah(lebih)}/tahun
              </span>
            ) : (
              <span className="text-muted">
                Kurang <span className="font-semibold text-ink">{formatRupiah(sisa)}</span>{" "}
                lagi · setara ± {formatSingkat(sisa / 12)}/bln
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
