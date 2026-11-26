import { Stock } from "@/lib/types";
import {
  hitungNilaiSekarang,
  hitungKasDisetor,
  hitungYieldOnCostSaham,
  hitungPorsi,
} from "@/lib/calculations";
import { formatRupiah, formatPersen } from "@/lib/format";

interface Props {
  stocks: Stock[];
  totalNilai: number; // total nilai portofolio, untuk hitung % porsi
  duaKolom?: boolean; // true = 2 kolom di layar besar (desktop)
  onSelect?: (s: Stock) => void; // klik baris -> buka detail
  onEdit?: (s: Stock) => void;
  onDelete?: (id: string) => void;
}

// Daftar saham di portofolio. Tiap baris menampilkan:
// kode, lot, Yield on Cost, porsi (%), nilai sekarang, dan gain/loss %.
export default function HoldingsList({
  stocks,
  totalNilai,
  duaKolom = false,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  if (stocks.length === 0) {
    return (
      <p className="rounded-xl bg-card px-4 py-6 text-center text-sm text-muted shadow ring-1 ring-line/5">
        Belum ada saham. Tambahkan lewat tombol “+ Tambah Saham”.
      </p>
    );
  }

  return (
    <ul
      className={
        duaKolom
          ? "grid grid-cols-1 gap-2 lg:grid-cols-2"
          : "space-y-2"
      }
    >
      {stocks.map((s) => {
        const nilai = hitungNilaiSekarang(s);
        const kas = hitungKasDisetor(s);
        const gain = nilai - kas;
        const gainPersen = kas > 0 ? (gain / kas) * 100 : 0;
        const gainClass = gain >= 0 ? "text-gain" : "text-loss";
        const tanda = gain >= 0 ? "+" : "";
        const yoc = hitungYieldOnCostSaham(s);
        const porsi = hitungPorsi(s, totalNilai);

        return (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow ring-1 ring-line/5"
          >
            {/* Titik warna = warna saham di grafik */}
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />

            {/* Kode + info insight. Diklik -> buka detail (jika onSelect ada). */}
            <button
              type="button"
              onClick={() => onSelect?.(s)}
              disabled={!onSelect}
              className="min-w-0 flex-1 text-left enabled:hover:opacity-80"
              aria-label={onSelect ? `Lihat detail ${s.code}` : undefined}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">{s.code}</span>
                <span className="truncate text-xs text-muted">{s.name}</span>
              </div>
              <div className="nums text-[11px] text-muted">
                {s.lots} lot · YoC {formatPersen(yoc)} · porsi{" "}
                {formatPersen(porsi, 1)}
              </div>
            </button>

            {/* Nilai + gain */}
            <div className="text-right">
              <div className="nums text-sm font-medium">{formatRupiah(nilai)}</div>
              <div className={`nums text-xs ${gainClass}`}>
                {tanda}
                {formatPersen(gainPersen)}
              </div>
            </div>

            {/* Tombol edit/hapus hanya muncul jika handler diberikan */}
            {(onEdit || onDelete) && (
              <div className="flex shrink-0 flex-col gap-1">
                {onEdit && (
                  <button
                    onClick={() => onEdit(s)}
                    className="rounded-md bg-card-soft px-2 py-1 text-xs text-muted hover:text-ink"
                    aria-label={`Edit ${s.code}`}
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(s.id)}
                    className="rounded-md bg-card-soft px-2 py-1 text-xs text-loss hover:bg-loss/10"
                    aria-label={`Hapus ${s.code}`}
                  >
                    Hapus
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
