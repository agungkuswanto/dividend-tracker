"use client";

// =============================================================
// MODAL DETAIL SAHAM
// Muncul saat sebuah saham di daftar diklik. Menampilkan:
// posisi, arus kas (kas/nilai/gain), dividen, jadwal/riwayat
// pembayaran, dan kontribusi saham ke portofolio.
// =============================================================

import { Stock } from "@/lib/types";
import {
  hitungLembar,
  hitungKasDisetor,
  hitungNilaiSekarang,
  hitungDividenTahunan,
  hitungYieldOnCostSaham,
  hitungPorsi,
  NAMA_BULAN_PANJANG,
} from "@/lib/calculations";
import { formatRupiah, formatPersen } from "@/lib/format";

interface Props {
  stock: Stock;
  totalNilai: number; // total nilai portofolio (untuk % porsi)
  totalDividen: number; // total dividen tahunan portofolio (untuk % kontribusi)
  onClose: () => void;
  onEdit?: (s: Stock) => void;
}

// Baris "label ... nilai" yang dipakai berulang.
function Baris({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted">{label}</span>
      <span className={`nums font-medium ${valueClass ?? "text-ink"}`}>{value}</span>
    </div>
  );
}

export default function StockDetail({
  stock,
  totalNilai,
  totalDividen,
  onClose,
  onEdit,
}: Props) {
  const lembar = hitungLembar(stock);
  const kas = hitungKasDisetor(stock);
  const nilai = hitungNilaiSekarang(stock);
  const gain = nilai - kas;
  const gainPersen = kas > 0 ? (gain / kas) * 100 : 0;
  const gainClass = gain >= 0 ? "text-gain" : "text-loss";
  const tanda = gain >= 0 ? "+" : "";
  const dividenTahunan = hitungDividenTahunan(stock);
  const yoc = hitungYieldOnCostSaham(stock);
  const porsi = hitungPorsi(stock, totalNilai);
  const kontribusiDiv =
    totalDividen > 0 ? (dividenTahunan / totalDividen) * 100 : 0;

  return (
    <div
      className="anim-overlay fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="anim-panel max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-xl2 bg-card p-5 shadow-lg ring-1 ring-line/5 sm:rounded-xl2"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <span
            className="h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: stock.color }}
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold leading-tight">{stock.code}</h2>
            {stock.name ? (
              <p className="truncate text-xs text-muted">{stock.name}</p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="px-2 text-muted hover:text-ink"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Posisi */}
        <div className="mt-4 rounded-xl bg-card-soft px-3 py-2">
          <div className="mb-1 text-xs font-semibold text-muted">Posisi</div>
          <Baris label="Jumlah lot" value={`${stock.lots} lot`} />
          <Baris label="Jumlah lembar" value={`${lembar.toLocaleString("id-ID")} lembar`} />
          <Baris label="Harga beli rata-rata" value={formatRupiah(stock.avgBuyPrice)} />
          <Baris label="Harga sekarang" value={formatRupiah(stock.currentPrice)} />
        </div>

        {/* Arus kas */}
        <div className="mt-3 rounded-xl bg-card-soft px-3 py-2">
          <div className="mb-1 text-xs font-semibold text-muted">Arus Kas</div>
          <Baris label="Kas disetor" value={formatRupiah(kas)} />
          <Baris label="Nilai sekarang" value={formatRupiah(nilai)} />
          <Baris
            label="Potensi gain/loss"
            value={tanda + formatRupiah(gain)}
            valueClass={gainClass}
          />
          <Baris
            label="Gain/loss (%)"
            value={tanda + formatPersen(gainPersen)}
            valueClass={gainClass}
          />
        </div>

        {/* Dividen */}
        <div className="mt-3 rounded-xl bg-card-soft px-3 py-2">
          <div className="mb-1 text-xs font-semibold text-muted">Dividen</div>
          <Baris
            label="Dividen / tahun"
            value={formatRupiah(dividenTahunan)}
            valueClass="text-gold"
          />
          <Baris label="Yield on Cost" value={formatPersen(yoc)} valueClass="text-gold" />
          <Baris label="Rata-rata / bulan" value={formatRupiah(dividenTahunan / 12)} />
        </div>

        {/* Jadwal / riwayat pembayaran */}
        <div className="mt-3">
          <div className="mb-1 text-xs font-semibold text-muted">
            Jadwal Pembayaran
          </div>
          {stock.dividends.length === 0 ? (
            <p className="text-xs text-muted">Belum ada jadwal dividen.</p>
          ) : (
            <ul className="space-y-1">
              {stock.dividends.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center gap-2 rounded-lg bg-card-soft px-3 py-2 text-sm"
                >
                  <span className="text-muted">{NAMA_BULAN_PANJANG[d.month - 1]}</span>
                  {d.label ? (
                    <span className="rounded bg-line/10 px-1.5 py-0.5 text-[10px] text-muted">
                      {d.label}
                    </span>
                  ) : null}
                  <span className="nums ml-auto text-muted">
                    DPS {formatRupiah(d.dps)}
                  </span>
                  <span className="nums w-24 text-right font-medium text-gold">
                    {formatRupiah(d.dps * lembar)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Kontribusi ke portofolio */}
        <div className="mt-3 rounded-xl bg-card-soft px-3 py-2">
          <div className="mb-1 text-xs font-semibold text-muted">
            Kontribusi ke Portofolio
          </div>
          <Baris label="Porsi nilai" value={formatPersen(porsi, 1)} />
          <Baris label="Porsi dividen" value={formatPersen(kontribusiDiv, 1)} />
        </div>

        {/* Tombol aksi */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-card-soft py-2.5 text-sm font-medium text-ink"
          >
            Tutup
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(stock)}
              className="flex-1 rounded-lg bg-gold py-2.5 text-sm font-bold text-onaccent"
            >
              Edit Saham
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
