"use client"; // Halaman ini interaktif (pakai hook, state, & localStorage).

import { useState, useRef } from "react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Stock } from "@/lib/types";
import {
  hitungRingkasan,
  urutkanSaham,
  KunciUrut,
} from "@/lib/calculations";
import { formatTanggalWaktu } from "@/lib/format";
import SummaryCard from "@/components/SummaryCard";
import TargetCard from "@/components/TargetCard";
import NextDividendCard from "@/components/NextDividendCard";
import SectorDonut from "@/components/SectorDonut";
import SnowballCard from "@/components/SnowballCard";
import DividendChart from "@/components/DividendChart";
import DividendCalendar from "@/components/DividendCalendar";
import CompositionDonut from "@/components/CompositionDonut";
import StatsCard from "@/components/StatsCard";
import HoldingsList from "@/components/HoldingsList";
import StockForm from "@/components/StockForm";
import StockDetail from "@/components/StockDetail";
import ShareButton from "@/components/ShareButton";
import BackupButtons from "@/components/BackupButtons";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import UpdateHargaButton from "@/components/UpdateHargaButton";

// Pilihan urutan untuk dropdown (nilai tampilan + kunci urut).
const OPSI_URUT: { kunci: KunciUrut; label: string }[] = [
  { kunci: "nilai", label: "Nilai" },
  { kunci: "yoc", label: "Yield on Cost" },
  { kunci: "gain", label: "Gain/Loss" },
  { kunci: "dividen", label: "Dividen/th" },
  { kunci: "kode", label: "Kode A–Z" },
];

// Daftar tab/menu dashboard. "id" dipakai di state, "label"+"icon" di tampilan.
const TABS = [
  { id: "ringkasan", label: "Ringkasan", icon: "📊" },
  { id: "analisis", label: "Analisis", icon: "🔍" },
  { id: "simulasi", label: "Simulasi", icon: "❄️" },
  { id: "kalender", label: "Kalender", icon: "🗓️" },
  { id: "portofolio", label: "Portofolio", icon: "💼" },
  { id: "pengaturan", label: "Pengaturan", icon: "⚙️" },
] as const;

// Tipe id tab diambil otomatis dari TABS (mis. "ringkasan" | "analisis" | ...).
type TabId = (typeof TABS)[number]["id"];

export default function Home() {
  // Data & fungsi dari hook portofolio.
  const {
    stocks,
    loaded,
    hargaUpdatedAt,
    addStock,
    updateStock,
    removeStock,
    resetSample,
    gantiSemua,
    perbaruiHarga,
  } = usePortfolio();

  // Tab yang sedang aktif.
  const [tab, setTab] = useState<TabId>("ringkasan");

  // State UI untuk form:
  // - formOpen: apakah dialog form tampil
  // - editing: saham yang sedang diedit (null = mode tambah)
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Stock | null>(null);

  // Urutan daftar portofolio yang dipilih pengguna.
  const [sortBy, setSortBy] = useState<KunciUrut>("nilai");

  // Saham yang sedang dilihat detailnya (null = modal detail tertutup).
  const [detail, setDetail] = useState<Stock | null>(null);

  // Ref ke kartu "tersembunyi" yang dipotret jadi gambar saat Bagikan.
  const exportRef = useRef<HTMLDivElement>(null);

  // Ringkasan dipakai untuk total nilai & total dividen (kontribusi %).
  const ringkasan = hitungRingkasan(stocks);
  const totalNilai = ringkasan.nilaiPortofolio;
  const totalDividen = ringkasan.dividenTahunan;

  // Daftar saham yang sudah diurutkan sesuai pilihan.
  const sahamTerurut = urutkanSaham(stocks, sortBy);

  // Buka form dalam mode "tambah".
  const bukaTambah = () => {
    setEditing(null);
    setFormOpen(true);
  };

  // Buka form dalam mode "edit".
  const bukaEdit = (s: Stock) => {
    setEditing(s);
    setFormOpen(true);
  };

  // Simpan hasil form: update kalau sedang edit, tambah kalau baru.
  const handleSave = (s: Stock) => {
    if (editing) updateStock(s);
    else addStock(s);
    setFormOpen(false);
    setEditing(null);
  };

  // Hapus dengan konfirmasi.
  const handleDelete = (id: string) => {
    if (confirm("Hapus saham ini dari portofolio?")) removeStock(id);
  };

  if (!loaded) {
    return (
      <main className="mx-auto max-w-md px-4 py-10 text-center text-muted">
        Memuat…
      </main>
    );
  }

  return (
    // Lebar dibatasi di HP (max-w-md); melebar & diberi padding lebih di desktop.
    <main className="mx-auto w-full max-w-md px-4 py-6 md:max-w-5xl md:px-6 md:py-8">
      {/* Judul + tombol bagikan & ganti tema */}
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Dividend Tracker</h1>
          <p className="text-xs text-muted">Pelacak dividen saham IDX</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ShareButton targetRef={exportRef} />
          <ThemeSwitcher />
        </div>
      </header>

      {/* ---------------------------------------------------------------
          TAB BAR (menu). Menempel di atas (sticky) saat halaman di-scroll.
          Di HP bisa digeser ke samping bila tidak muat (overflow-x-auto).
          Margin negatif + padding menyamakan latar sticky selebar layar.
      ---------------------------------------------------------------- */}
      <nav className="sticky top-0 z-10 -mx-4 mb-4 overflow-x-auto border-b border-line/10 bg-navy/90 px-4 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex gap-1 whitespace-nowrap py-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-gold text-onaccent"
                  : "text-muted hover:text-ink"
              }`}
              aria-current={tab === t.id ? "page" : undefined}
            >
              <span className="mr-1">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ===================== TAB: RINGKASAN ===================== */}
      {tab === "ringkasan" && (
        <div className="space-y-4">
          <SummaryCard stocks={stocks} />
          <div className="grid gap-4 md:grid-cols-2">
            <TargetCard dividenTahunan={totalDividen} />
            <NextDividendCard stocks={stocks} />
          </div>
          <DividendChart stocks={stocks} />
        </div>
      )}

      {/* ===================== TAB: ANALISIS ===================== */}
      {tab === "analisis" && (
        <div className="space-y-4">
          <StatsCard stocks={stocks} />
          <div className="grid gap-4 md:grid-cols-2">
            <CompositionDonut stocks={stocks} />
            <SectorDonut stocks={stocks} />
          </div>
        </div>
      )}

      {/* ===================== TAB: SIMULASI ===================== */}
      {tab === "simulasi" && (
        <div className="space-y-4">
          <SnowballCard nilaiAwal={totalNilai} dividenTahunan={totalDividen} />
        </div>
      )}

      {/* ===================== TAB: KALENDER ===================== */}
      {tab === "kalender" && (
        <div className="space-y-4">
          <NextDividendCard stocks={stocks} />
          <DividendCalendar stocks={stocks} />
        </div>
      )}

      {/* ===================== TAB: PORTOFOLIO ===================== */}
      {tab === "portofolio" && (
        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-muted">
              Daftar Saham ({stocks.length})
            </h2>
            <div className="flex items-center gap-2">
              {/* Dropdown urutan */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as KunciUrut)}
                className="rounded-lg border border-line/10 bg-card px-2 py-1.5 text-xs text-ink focus:border-gold focus:outline-none"
                aria-label="Urutkan portofolio"
              >
                {OPSI_URUT.map((o) => (
                  <option key={o.kunci} value={o.kunci}>
                    Urut: {o.label}
                  </option>
                ))}
              </select>
              <button
                onClick={bukaTambah}
                className="rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-onaccent"
              >
                + Tambah
              </button>
            </div>
          </div>
          {/* Ambil harga terakhir dari Yahoo Finance (delay ±15 menit). */}
          <div className="mb-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <UpdateHargaButton stocks={stocks} onHarga={perbaruiHarga} />
              {hargaUpdatedAt && (
                <span className="text-[11px] text-muted">
                  Diperbarui {formatTanggalWaktu(new Date(hargaUpdatedAt))}
                </span>
              )}
            </div>
            <p className="mt-1 text-[10px] leading-snug text-muted">
              Memperbarui harga terakhir &amp; nama perusahaan semua saham dari
              Yahoo Finance (delay ±15 menit). Jadwal dividen tidak diubah.
            </p>
          </div>
          <HoldingsList
            stocks={sahamTerurut}
            totalNilai={totalNilai}
            onSelect={(s) => setDetail(s)}
            onEdit={bukaEdit}
            onDelete={handleDelete}
            duaKolom
          />
        </section>
      )}

      {/* ===================== TAB: PENGATURAN ===================== */}
      {tab === "pengaturan" && (
        <section className="rounded-xl2 bg-card p-4 shadow ring-1 ring-line/5">
          <h2 className="text-sm font-semibold">Cadangan Data</h2>
          <p className="mb-3 mt-1 text-[11px] text-muted">
            Data tersimpan di browser ini. Ekspor untuk membuat file cadangan,
            lalu impor untuk memulihkan / memindahkannya ke perangkat lain.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <BackupButtons stocks={stocks} onImport={gantiSemua} />
            <button
              onClick={() => {
                if (
                  confirm("Kembalikan ke data contoh? Data Anda akan ditimpa.")
                )
                  resetSample();
              }}
              className="rounded-lg px-3 py-1.5 text-xs text-muted hover:text-ink"
            >
              Reset contoh
            </button>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------
          Kartu EKSPOR (tersembunyi di luar layar).
          Sama seperti kartu ringkasan tapi DENGAN footer tanggal.
          Inilah yang dipotret jadi gambar PNG oleh tombol Bagikan.
          Selalu dirender (lepas dari tab aktif) agar Bagikan selalu siap.
      ------------------------------------------------------------ */}
      <div
        aria-hidden
        style={{ position: "fixed", left: -10000, top: 0, width: 420 }}
      >
        <div ref={exportRef} className="bg-navy p-4">
          <SummaryCard stocks={stocks} showFooter />
        </div>
      </div>

      {/* Modal detail saham (muncul saat sebuah baris diklik) */}
      {detail && (
        <StockDetail
          stock={detail}
          totalNilai={totalNilai}
          totalDividen={totalDividen}
          onClose={() => setDetail(null)}
          onEdit={(s) => {
            setDetail(null);
            bukaEdit(s);
          }}
        />
      )}

      {/* Dialog form (muncul hanya saat formOpen = true) */}
      {formOpen && (
        <StockForm
          initial={editing}
          usedColors={stocks.map((s) => s.color)}
          onSave={handleSave}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}
    </main>
  );
}
