// Kotak kecil berisi satu metrik: label di atas, nilai di bawah.
// Dipakai berulang di grid ringkasan (6 metrik).

interface Props {
  label: string; // judul kecil, mis. "Kas Disetor"
  value: string; // nilai yang sudah diformat, mis. "Rp 1.000.000"
  sub?: string; // baris kecil tambahan (opsional), mis. "Belum direalisasi"
  valueClass?: string; // kelas warna untuk nilai (opsional), mis. "text-gain"
}

export default function MetricTile({ label, value, sub, valueClass }: Props) {
  return (
    <div className="rounded-xl bg-card-soft px-3 py-2.5">
      <div className="text-[11px] leading-tight text-muted">{label}</div>
      <div className={`nums mt-1 text-sm font-semibold ${valueClass ?? "text-ink"}`}>
        {value}
      </div>
      {sub ? <div className="text-[10px] text-muted">{sub}</div> : null}
    </div>
  );
}
