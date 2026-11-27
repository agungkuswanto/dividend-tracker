// =============================================================
// PERHITUNGAN PORTOFOLIO & DIVIDEN
// Semua rumus angka ada di sini, terpisah dari tampilan (UI).
// Terpisah = mudah diuji (lihat calculations.test.ts) & dipakai ulang.
// =============================================================

import { LEMBAR_PER_LOT, Stock } from "./types";

// Nama bulan singkat untuk sumbu-X grafik.
export const NAMA_BULAN = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

// Nama bulan panjang untuk kalender dividen.
export const NAMA_BULAN_PANJANG = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// ---- Perhitungan per SATU saham ----

// Jumlah lembar = lot × 100.
export function hitungLembar(stock: Stock): number {
  return stock.lots * LEMBAR_PER_LOT;
}

// Kas disetor untuk 1 saham = harga beli rata-rata × lembar.
export function hitungKasDisetor(stock: Stock): number {
  return stock.avgBuyPrice * hitungLembar(stock);
}

// Nilai sekarang 1 saham = harga sekarang × lembar.
export function hitungNilaiSekarang(stock: Stock): number {
  return stock.currentPrice * hitungLembar(stock);
}

// Estimasi dividen setahun 1 saham = Σ (DPS × lembar) untuk semua pembayaran.
export function hitungDividenTahunan(stock: Stock): number {
  const lembar = hitungLembar(stock);
  return stock.dividends.reduce((total, bayar) => total + bayar.dps * lembar, 0);
}

// ---- Ringkasan SELURUH portofolio ----

// Bentuk hasil ringkasan (dipakai oleh kartu dashboard).
export interface RingkasanPortofolio {
  dividenTahunan: number; // Estimasi dividen setahun
  rataRataPerBulan: number; // dividen setahun ÷ 12
  yieldOnCost: number; // dividen setahun ÷ kas disetor × 100 (persen)
  nilaiPortofolio: number; // Σ nilai sekarang
  kasDisetor: number; // Σ kas disetor
  potensiGain: number; // nilai − kas disetor (belum direalisasi)
  gainPersen: number; // potensi gain ÷ kas disetor × 100 (persen)
}

// Menghitung semua metrik ringkasan dari daftar saham.
export function hitungRingkasan(stocks: Stock[]): RingkasanPortofolio {
  // Jumlahkan tiap komponen dengan reduce (perulangan yang menumpuk total).
  const kasDisetor = stocks.reduce((t, s) => t + hitungKasDisetor(s), 0);
  const nilaiPortofolio = stocks.reduce((t, s) => t + hitungNilaiSekarang(s), 0);
  const dividenTahunan = stocks.reduce((t, s) => t + hitungDividenTahunan(s), 0);

  const potensiGain = nilaiPortofolio - kasDisetor;

  // Hindari pembagian dengan 0 (kalau portofolio masih kosong).
  const yieldOnCost = kasDisetor > 0 ? (dividenTahunan / kasDisetor) * 100 : 0;
  const gainPersen = kasDisetor > 0 ? (potensiGain / kasDisetor) * 100 : 0;

  return {
    dividenTahunan,
    rataRataPerBulan: dividenTahunan / 12,
    yieldOnCost,
    nilaiPortofolio,
    kasDisetor,
    potensiGain,
    gainPersen,
  };
}

// ---- Data untuk grafik "Estimasi Dividen Tiap Bulan" ----

// Satu baris data per bulan untuk grafik batang bertumpuk (stacked bar).
// Contoh: { bulan: "Jan", total: 1250000, BBRI: 1000000, TLKM: 250000 }
// Setiap kode saham jadi satu "key" dengan nilai Rupiah di bulan itu.
export interface BarisBulan {
  bulan: string; // "Jan".."Des"
  total: number; // total semua saham pada bulan tsb (untuk label di atas batang)
  [kodeSaham: string]: number | string; // nilai per saham (dinamis)
}

// Membangun 12 baris (Jan–Des). Tiap pembayaran dividen dimasukkan
// ke bulan-nya, ditambahkan pada kolom kode sahamnya.
export function hitungDividenPerBulan(stocks: Stock[]): BarisBulan[] {
  // Mulai dari 12 baris kosong, total 0.
  const baris: BarisBulan[] = NAMA_BULAN.map((nama) => ({
    bulan: nama,
    total: 0,
  }));

  for (const stock of stocks) {
    const lembar = hitungLembar(stock);
    for (const bayar of stock.dividends) {
      // month 1..12 -> index 0..11
      const idx = bayar.month - 1;
      if (idx < 0 || idx > 11) continue; // abaikan bulan tidak valid

      const jumlah = bayar.dps * lembar;

      // Nilai sebelumnya untuk saham ini di bulan itu (0 jika belum ada).
      const sebelum = (baris[idx][stock.code] as number) || 0;
      baris[idx][stock.code] = sebelum + jumlah;
      baris[idx].total += jumlah;
    }
  }

  return baris;
}

// ---- Insight tambahan per saham ----

// Yield on Cost 1 saham = dividen setahun ÷ kas disetor × 100 (persen).
export function hitungYieldOnCostSaham(stock: Stock): number {
  const kas = hitungKasDisetor(stock);
  return kas > 0 ? (hitungDividenTahunan(stock) / kas) * 100 : 0;
}

// Porsi (bobot) 1 saham terhadap seluruh portofolio, dalam persen.
// Butuh total nilai portofolio sebagai pembanding.
export function hitungPorsi(stock: Stock, totalNilai: number): number {
  return totalNilai > 0 ? (hitungNilaiSekarang(stock) / totalNilai) * 100 : 0;
}

// ---- Urutkan portofolio ----

// Pilihan cara mengurutkan daftar saham.
export type KunciUrut = "nilai" | "yoc" | "gain" | "dividen" | "kode";

// Mengembalikan SALINAN daftar yang sudah terurut (tidak mengubah asli).
// Semua numerik diurutkan dari besar ke kecil; kode diurut A–Z.
export function urutkanSaham(stocks: Stock[], kunci: KunciUrut): Stock[] {
  const salinan = [...stocks];
  salinan.sort((a, b) => {
    switch (kunci) {
      case "kode":
        return a.code.localeCompare(b.code);
      case "yoc":
        return hitungYieldOnCostSaham(b) - hitungYieldOnCostSaham(a);
      case "dividen":
        return hitungDividenTahunan(b) - hitungDividenTahunan(a);
      case "gain": {
        const gainA = hitungNilaiSekarang(a) - hitungKasDisetor(a);
        const gainB = hitungNilaiSekarang(b) - hitungKasDisetor(b);
        return gainB - gainA;
      }
      case "nilai":
      default:
        return hitungNilaiSekarang(b) - hitungNilaiSekarang(a);
    }
  });
  return salinan;
}

// ---- Jadwal dividen yang akan datang (kalender) ----

// Satu baris jadwal dividen mendatang.
export interface JadwalMendatang {
  stockId: string;
  code: string;
  color: string;
  label?: string;
  month: number; // 1..12
  namaBulan: string; // "November"
  jumlah: number; // DPS × lembar (total Rupiah dividen ini)
  bulanLagi: number; // 0 = bulan ini, 1 = bulan depan, dst.
}

// Membuat daftar pembayaran dividen mendatang, diurutkan dari yang terdekat.
// Karena data hanya menyimpan BULAN (bukan tanggal), "terdekat" dihitung
// sebagai berapa bulan lagi dari bulan sekarang (memutar ke tahun depan).
export function hitungJadwalMendatang(
  stocks: Stock[],
  bulanSekarang: number = new Date().getMonth() + 1 // 1..12
): JadwalMendatang[] {
  const hasil: JadwalMendatang[] = [];

  for (const stock of stocks) {
    const lembar = hitungLembar(stock);
    for (const bayar of stock.dividends) {
      // Berapa bulan lagi: ((bulan - sekarang + 12) % 12).
      // Contoh: sekarang Nov(11), bayar Jan(1) -> (1-11+12)%12 = 2 bulan lagi.
      const bulanLagi = ((bayar.month - bulanSekarang + 12) % 12 + 12) % 12;
      hasil.push({
        stockId: stock.id,
        code: stock.code,
        color: stock.color,
        label: bayar.label,
        month: bayar.month,
        namaBulan: NAMA_BULAN_PANJANG[bayar.month - 1] ?? "",
        jumlah: bayar.dps * lembar,
        bulanLagi,
      });
    }
  }

  // Urutkan: yang paling dekat dulu; jika sama, nominal besar dulu.
  hasil.sort((a, b) => a.bulanLagi - b.bulanLagi || b.jumlah - a.jumlah);
  return hasil;
}

// ---- Pengelompokan per SEKTOR (diversifikasi) ----

// Satu baris ringkasan untuk sebuah sektor.
export interface BarisSektor {
  sektor: string; // nama sektor ("Keuangan", "Energi", ...)
  nilai: number; // Σ nilai sekarang saham di sektor ini
  dividen: number; // Σ dividen tahunan sektor ini
  jumlahSaham: number; // berapa saham di sektor ini
}

// Menggabungkan saham berdasarkan sektornya. Saham tanpa sektor
// dimasukkan ke "Lainnya". Hasil diurutkan dari nilai terbesar.
export function hitungPerSektor(stocks: Stock[]): BarisSektor[] {
  // Map menjaga 1 entri per nama sektor.
  const peta = new Map<string, BarisSektor>();

  for (const s of stocks) {
    const sektor = (s.sector && s.sector.trim()) || "Lainnya";
    const nilai = hitungNilaiSekarang(s);
    const dividen = hitungDividenTahunan(s);

    const ada = peta.get(sektor);
    if (ada) {
      ada.nilai += nilai;
      ada.dividen += dividen;
      ada.jumlahSaham += 1;
    } else {
      peta.set(sektor, { sektor, nilai, dividen, jumlahSaham: 1 });
    }
  }

  return Array.from(peta.values()).sort((a, b) => b.nilai - a.nilai);
}

// ---- Statistik ringkas portofolio ----

export interface Statistik {
  yieldTertinggi?: { code: string; nilai: number }; // saham dgn YoC tertinggi
  yieldTerendah?: { code: string; nilai: number }; // saham dgn YoC terendah
  rataYield: number; // yield on cost portofolio (rata-rata tertimbang)
  bulanTerbesar?: { nama: string; jumlah: number }; // bulan "gajian" terbesar
  kontributorTeratas?: { code: string; jumlah: number; persen: number }; // penyumbang dividen terbesar
}

// Menghitung beberapa angka menarik untuk kartu statistik.
export function hitungStatistik(stocks: Stock[]): Statistik {
  const ringkasan = hitungRingkasan(stocks);
  if (stocks.length === 0) return { rataYield: 0 };

  // Cari saham dengan yield tertinggi & terendah.
  let tertinggi = stocks[0];
  let terendah = stocks[0];
  for (const s of stocks) {
    if (hitungYieldOnCostSaham(s) > hitungYieldOnCostSaham(tertinggi)) tertinggi = s;
    if (hitungYieldOnCostSaham(s) < hitungYieldOnCostSaham(terendah)) terendah = s;
  }

  // Bulan dengan total dividen terbesar.
  const perBulan = hitungDividenPerBulan(stocks);
  let idxMax = 0;
  perBulan.forEach((b, i) => {
    if (b.total > perBulan[idxMax].total) idxMax = i;
  });
  const bulanTerbesar =
    perBulan[idxMax].total > 0
      ? { nama: NAMA_BULAN_PANJANG[idxMax], jumlah: perBulan[idxMax].total }
      : undefined;

  // Saham penyumbang dividen tahunan terbesar.
  let top = stocks[0];
  for (const s of stocks) {
    if (hitungDividenTahunan(s) > hitungDividenTahunan(top)) top = s;
  }
  const dividenTop = hitungDividenTahunan(top);
  const kontributorTeratas =
    dividenTop > 0
      ? {
          code: top.code,
          jumlah: dividenTop,
          persen:
            ringkasan.dividenTahunan > 0
              ? (dividenTop / ringkasan.dividenTahunan) * 100
              : 0,
        }
      : undefined;

  return {
    yieldTertinggi: { code: tertinggi.code, nilai: hitungYieldOnCostSaham(tertinggi) },
    yieldTerendah: { code: terendah.code, nilai: hitungYieldOnCostSaham(terendah) },
    rataYield: ringkasan.yieldOnCost,
    bulanTerbesar,
    kontributorTeratas,
  };
}

// ---- Simulasi "Snowball" (efek bola salju dividen) ----
//
// Ide: tiap tahun kita terima dividen. Kalau dividen itu DIBELIKAN saham lagi
// (reinvest), nilai portofolio tahun depan lebih besar -> dividen tahun depan
// ikut lebih besar -> makin lama makin cepat membesar. Itulah "bola salju".
//
// MODEL (dibuat jujur & realistis):
//   - "yield" = dividend yield, dianggap TETAP tiap tahun (mis. 8%). Saat harga
//     saham naik, DPS biasanya ikut naik, jadi yield-nya relatif stabil.
//   - "apresiasi" = kenaikan HARGA saham per tahun (%), menambah nilai aset.
//   Jadi total imbal hasil bila reinvest = apresiasi + yield.
//
//   PENTING: yield TIDAK dibuat "meledak". Model lama mengalikan yield dengan
//   (1+g)^tahun sehingga di tahun ke-15 yield bisa jadi 20%+ (tidak masuk akal).
//   Sekarang yield tetap, dan pertumbuhan diwujudkan sebagai apresiasi harga.
//
// Simulasi membandingkan 2 skenario:
//   - DENGAN reinvest : dividen diputar kembali jadi modal (bola salju).
//   - TANPA reinvest  : dividen diambil tunai; aset tetap naik dari apresiasi
//                       harga + setoran, tapi tanpa tambahan dari dividen.

// Asumsi yang bisa diatur pengguna.
export interface ParamSnowball {
  nilaiAwal: number; // nilai portofolio saat ini (Rp)
  yieldPersen: number; // dividend yield per tahun (% dari nilai), dianggap tetap
  pertumbuhanPersen: number; // apresiasi HARGA saham per tahun (%), menambah nilai aset
  setoranBulanan: number; // tambahan modal rutin tiap bulan (Rp)
  tahun: number; // lama proyeksi (tahun)
}

// Satu baris hasil = kondisi di AKHIR tahun ke-"tahun".
export interface BarisSnowball {
  tahun: number; // tahun ke- (1..N)
  dividenReinvest: number; // dividen diterima tahun itu (skenario reinvest)
  nilaiReinvest: number; // nilai portofolio akhir tahun (skenario reinvest)
  dividenTanpa: number; // dividen diterima tahun itu (skenario tanpa reinvest)
  nilaiTanpa: number; // nilai portofolio akhir tahun (tanpa reinvest)
}

// Menjalankan proyeksi tahun demi tahun.
export function simulasiSnowball(p: ParamSnowball): BarisSnowball[] {
  const hasil: BarisSnowball[] = [];

  // Ubah persen -> pecahan (mis. 5% -> 0,05).
  const y = p.yieldPersen / 100; // yield dividen (tetap)
  const g = p.pertumbuhanPersen / 100; // apresiasi harga saham
  const setoranTahunan = p.setoranBulanan * 12;

  // Dua "dompet" terpisah supaya skenario tidak saling memengaruhi.
  let nilaiR = p.nilaiAwal; // reinvest
  let nilaiT = p.nilaiAwal; // tanpa reinvest

  for (let t = 1; t <= p.tahun; t++) {
    // Dividen tahun ini = yield TETAP × nilai di AWAL tahun.
    const dividenR = nilaiR * y;
    const dividenT = nilaiT * y;

    // DENGAN reinvest: nilai naik dari apresiasi harga (×(1+g)) + dividen
    // yang diputar balik jadi modal + setoran rutin.
    nilaiR = nilaiR * (1 + g) + dividenR + setoranTahunan;

    // TANPA reinvest: dividen diambil tunai. Nilai tetap naik dari apresiasi
    // harga + setoran, tapi tidak mendapat tambahan dari dividen.
    nilaiT = nilaiT * (1 + g) + setoranTahunan;

    hasil.push({
      tahun: t,
      dividenReinvest: dividenR,
      nilaiReinvest: nilaiR,
      dividenTanpa: dividenT,
      nilaiTanpa: nilaiT,
    });
  }

  return hasil;
}
