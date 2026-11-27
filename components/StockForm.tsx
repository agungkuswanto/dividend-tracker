"use client";

// =============================================================
// FORM TAMBAH / EDIT SAHAM
// Muncul sebagai dialog (overlay) di atas halaman.
// Mengisi: kode, nama, lot, harga beli, harga sekarang, warna,
// dan daftar jadwal dividen (DPS + bulan + label).
// =============================================================

import { useRef, useState } from "react";
import { Stock, DividendPayment } from "@/lib/types";
import { NAMA_BULAN } from "@/lib/calculations";
import { PALET, pilihWarnaBaru } from "@/lib/colors";
import { DAFTAR_SEKTOR } from "@/lib/sectors";
import { ambilHarga } from "@/lib/hargaApi";

// Versi "bisa diedit" dari pembayaran dividen: dps disimpan sebagai
// string supaya kolom input boleh kosong saat sedang diketik.
interface BarisDividen {
  id: string;
  dps: string;
  month: number;
  label: string;
}

interface Props {
  initial?: Stock | null; // jika ada -> mode EDIT; jika null -> mode TAMBAH
  usedColors?: string[]; // warna yang sudah dipakai saham lain (untuk auto-pilih)
  onSave: (s: Stock) => void;
  onCancel: () => void;
}

// Pilihan label dividen yang umum di IDX. Boleh kosong (bayar sekali setahun).
const LABEL_DIVIDEN = ["Interim", "Final", "Spesial"];

// Membuat id unik. crypto.randomUUID tersedia di browser modern.
function buatId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2); // cadangan
}

export default function StockForm({
  initial,
  usedColors = [],
  onSave,
  onCancel,
}: Props) {
  const mode = initial ? "Edit" : "Tambah";

  // --- State untuk tiap kolom (disimpan string agar mudah diketik) ---
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [lots, setLots] = useState(initial ? String(initial.lots) : "");
  const [avgBuyPrice, setAvgBuyPrice] = useState(
    initial ? String(initial.avgBuyPrice) : ""
  );
  const [currentPrice, setCurrentPrice] = useState(
    initial ? String(initial.currentPrice) : ""
  );
  // Sektor saham (opsional). "" = belum dipilih.
  const [sector, setSector] = useState(initial?.sector ?? "");
  // Mode tambah: pakai warna pertama yang belum terpakai. Mode edit: warna asli.
  const [color, setColor] = useState(
    initial?.color ?? pilihWarnaBaru(usedColors)
  );
  const [dividends, setDividends] = useState<BarisDividen[]>(
    initial
      ? initial.dividends.map((d) => ({
          id: d.id,
          dps: String(d.dps),
          month: d.month,
          label: d.label ?? "",
        }))
      : []
  );
  const [error, setError] = useState("");

  // State untuk tombol "Ambil harga" dari Yahoo Finance.
  const [ambilLoading, setAmbilLoading] = useState(false);
  const [ambilPesan, setAmbilPesan] = useState("");
  // Mengingat kode yang sudah dicoba auto-ambil, agar tidak mengambil
  // berulang-ulang untuk kode yang sama setiap kali keluar dari kolom.
  const kodeAutoTerakhir = useRef("");

  // Ambil harga terakhir untuk kode yang sedang diketik, lalu isi "Harga sekarang".
  const ambilHargaSekarang = async () => {
    const kode = code.trim().toUpperCase();
    if (!kode) {
      setAmbilPesan("Isi kode saham dulu.");
      return;
    }
    setAmbilLoading(true);
    setAmbilPesan("");
    try {
      const { hasil } = await ambilHarga([kode]);
      const data = hasil[kode];
      if (data) {
        setCurrentPrice(String(data.harga));

        // Isi nama hanya bila kolom nama masih kosong (jangan timpa ketikan user).
        if (data.nama && !name.trim()) setName(data.nama);

        setAmbilPesan(
          `${kode} terisi: ${data.harga.toLocaleString("id-ID")}` +
            (data.nama ? ` · ${data.nama}` : "")
        );
      } else {
        setAmbilPesan(`Data ${kode} tidak ditemukan.`);
      }
    } catch {
      setAmbilPesan("Gagal mengambil data. Coba lagi.");
    } finally {
      setAmbilLoading(false);
    }
  };

  // Dipanggil saat kolom kode kehilangan fokus (user selesai mengetik kode).
  // Otomatis mengisi harga, TAPI hanya bila: kode terisi, harga masih kosong
  // (jangan timpa nilai yang sudah ada / mode edit), dan belum pernah dicoba.
  const onBlurKode = () => {
    const kode = code.trim().toUpperCase();
    if (!kode) return;
    if (currentPrice.trim() !== "") return; // sudah ada harga -> biarkan
    if (kodeAutoTerakhir.current === kode) return; // sudah dicoba utk kode ini
    kodeAutoTerakhir.current = kode;
    ambilHargaSekarang();
  };

  // --- Fungsi untuk mengelola baris dividen ---
  const tambahDividen = () =>
    setDividends((prev) => [
      ...prev,
      { id: buatId(), dps: "", month: 1, label: "" },
    ]);

  const ubahDividen = (
    index: number,
    field: keyof BarisDividen,
    value: string | number
  ) =>
    setDividends((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );

  const hapusDividen = (index: number) =>
    setDividends((prev) => prev.filter((_, i) => i !== index));

  // --- Saat form disimpan ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // cegah reload halaman

    // Validasi sederhana.
    if (!code.trim()) {
      setError("Kode saham wajib diisi.");
      return;
    }
    const nLots = Number(lots);
    const nBuy = Number(avgBuyPrice);
    const nNow = Number(currentPrice);
    if (!(nLots > 0) || !(nBuy >= 0) || !(nNow >= 0)) {
      setError("Lot, harga beli, dan harga sekarang harus angka yang valid.");
      return;
    }

    // Ubah baris dividen jadi bentuk final (dps = angka). Baris tanpa dps
    // yang valid diabaikan.
    const finalDividends: DividendPayment[] = dividends
      .filter((d) => Number(d.dps) > 0)
      .map((d) => ({
        id: d.id,
        dps: Number(d.dps),
        month: d.month,
        label: d.label.trim() || undefined,
      }));

    // Bangun objek saham lengkap.
    const stock: Stock = {
      id: initial?.id ?? buatId(),
      code: code.trim().toUpperCase(),
      name: name.trim() || undefined,
      lots: nLots,
      avgBuyPrice: nBuy,
      currentPrice: nNow,
      color,
      sector: sector || undefined, // kosong = tidak diisi
      dividends: finalDividends,
    };

    onSave(stock);
  };

  // Kelas style yang dipakai berulang untuk input.
  const inputClass =
    "w-full rounded-lg bg-navy border border-line/10 px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none";

  return (
    // Lapisan gelap menutupi layar; klik di luar kartu = batal.
    <div
      className="anim-overlay fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onCancel}
    >
      {/* Kartu form. stopPropagation agar klik di dalam tidak menutup. */}
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="anim-panel max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-xl2 bg-card p-5 sm:rounded-xl2"
      >
        <h2 className="text-lg font-bold">{mode} Saham</h2>

        {/* Kode & Nama */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-muted">Kode saham</span>
            <input
              className={inputClass + " uppercase"}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onBlur={onBlurKode}
              placeholder="BBRI"
              maxLength={6}
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted">Nama (opsional)</span>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bank BRI"
            />
          </label>
        </div>

        {/* Lot */}
        <label className="mt-3 block">
          <span className="text-xs text-muted">Jumlah lot (1 lot = 100 lembar)</span>
          <input
            className={inputClass}
            type="number"
            min={0}
            value={lots}
            onChange={(e) => setLots(e.target.value)}
            placeholder="50"
          />
        </label>

        {/* Harga beli & sekarang */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-muted">Harga beli rata-rata</span>
            <input
              className={inputClass}
              type="number"
              min={0}
              value={avgBuyPrice}
              onChange={(e) => setAvgBuyPrice(e.target.value)}
              placeholder="4500"
            />
          </label>
          <label className="block">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Harga sekarang</span>
              {/* Ambil harga terakhir dari Yahoo untuk kode yang diketik. */}
              <button
                type="button"
                onClick={ambilHargaSekarang}
                disabled={ambilLoading}
                className="text-[10px] font-medium text-gold hover:underline disabled:opacity-60"
              >
                {ambilLoading ? "Mengambil…" : "🔄 Ambil"}
              </button>
            </div>
            <input
              className={inputClass}
              type="number"
              min={0}
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="4700"
            />
          </label>
        </div>
        {/* Umpan balik tombol Ambil harga. */}
        {ambilPesan && (
          <p className="mt-1 text-[11px] text-muted">{ambilPesan}</p>
        )}

        {/* Sektor (opsional) */}
        <label className="mt-3 block">
          <span className="text-xs text-muted">Sektor (opsional)</span>
          <select
            className={inputClass + " mt-1"}
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          >
            <option value="">— Pilih sektor —</option>
            {DAFTAR_SEKTOR.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {/* Pilihan warna */}
        <div className="mt-3">
          <span className="text-xs text-muted">Warna di grafik</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {PALET.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full ${
                  color === c ? "ring-2 ring-ink" : ""
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Pilih warna ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Jadwal dividen */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Jadwal Dividen</span>
            <button
              type="button"
              onClick={tambahDividen}
              className="rounded-md bg-card-soft px-2 py-1 text-xs text-gold"
            >
              + Baris
            </button>
          </div>
          <p className="mt-1 text-[11px] text-muted">
            DPS = dividen per lembar. Bisa lebih dari 1 (mis. interim + final).
          </p>

          {dividends.length === 0 && (
            <p className="mt-2 text-xs text-muted">Belum ada jadwal dividen.</p>
          )}

          {dividends.map((d, i) => (
            <div key={d.id} className="mt-2 flex items-end gap-2">
              <label className="flex-1">
                <span className="text-[10px] text-muted">DPS (Rp/lembar)</span>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  value={d.dps}
                  onChange={(e) => ubahDividen(i, "dps", e.target.value)}
                  placeholder="84"
                />
              </label>
              <label className="w-24">
                <span className="text-[10px] text-muted">Bulan</span>
                <select
                  className={inputClass}
                  value={d.month}
                  onChange={(e) => ubahDividen(i, "month", Number(e.target.value))}
                >
                  {NAMA_BULAN.map((nama, idx) => (
                    <option key={nama} value={idx + 1}>
                      {nama}
                    </option>
                  ))}
                </select>
              </label>
              <label className="w-24">
                <span className="text-[10px] text-muted">Label</span>
                <select
                  className={inputClass}
                  value={d.label}
                  onChange={(e) => ubahDividen(i, "label", e.target.value)}
                >
                  <option value="">—</option>
                  {/* Pertahankan label lama yang tidak ada di daftar baku
                      (mis. hasil impor), supaya tidak hilang saat diedit. */}
                  {d.label && !LABEL_DIVIDEN.includes(d.label) && (
                    <option value={d.label}>{d.label}</option>
                  )}
                  {LABEL_DIVIDEN.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => hapusDividen(i)}
                className="mb-1 px-1 text-loss"
                aria-label="Hapus baris dividen"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Pesan error */}
        {error && <p className="mt-3 text-xs text-loss">{error}</p>}

        {/* Tombol aksi */}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg bg-card-soft py-2.5 text-sm font-medium text-ink"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 rounded-lg bg-gold py-2.5 text-sm font-bold text-onaccent"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
