// Unit test untuk fungsi perhitungan portofolio.
// Dijalankan dengan: npm test
import { describe, it, expect } from "vitest";
import {
  hitungLembar,
  hitungKasDisetor,
  hitungNilaiSekarang,
  hitungDividenTahunan,
  hitungRingkasan,
  hitungDividenPerBulan,
  hitungYieldOnCostSaham,
  hitungPorsi,
  urutkanSaham,
  hitungJadwalMendatang,
  hitungStatistik,
  hitungPerSektor,
  simulasiSnowball,
} from "./calculations";
import { Stock } from "./types";

// Satu saham contoh yang angkanya mudah dihitung di kepala.
const saham: Stock = {
  id: "x",
  code: "XXXX",
  lots: 10, // 10 lot = 1.000 lembar
  avgBuyPrice: 1000, // beli di 1.000/lembar
  currentPrice: 1200, // sekarang 1.200/lembar
  color: "#fff",
  dividends: [
    { id: "d1", dps: 50, month: 3 }, // Maret
    { id: "d2", dps: 30, month: 9 }, // September
  ],
};

describe("perhitungan per saham", () => {
  it("lembar = lot × 100", () => {
    expect(hitungLembar(saham)).toBe(1000);
  });
  it("kas disetor = harga beli × lembar", () => {
    expect(hitungKasDisetor(saham)).toBe(1_000_000);
  });
  it("nilai sekarang = harga sekarang × lembar", () => {
    expect(hitungNilaiSekarang(saham)).toBe(1_200_000);
  });
  it("dividen tahunan = Σ (DPS × lembar)", () => {
    // (50 + 30) × 1000 = 80.000
    expect(hitungDividenTahunan(saham)).toBe(80_000);
  });
});

describe("hitungRingkasan", () => {
  const r = hitungRingkasan([saham]);
  it("menjumlahkan kas disetor & nilai portofolio", () => {
    expect(r.kasDisetor).toBe(1_000_000);
    expect(r.nilaiPortofolio).toBe(1_200_000);
  });
  it("potensi gain = nilai − kas", () => {
    expect(r.potensiGain).toBe(200_000);
  });
  it("yield on cost = dividen ÷ kas × 100", () => {
    expect(r.yieldOnCost).toBeCloseTo(8); // 80.000 / 1.000.000 = 8%
  });
  it("gain persen = gain ÷ kas × 100", () => {
    expect(r.gainPersen).toBeCloseTo(20); // 200.000 / 1.000.000 = 20%
  });
  it("rata-rata per bulan = dividen ÷ 12", () => {
    expect(r.rataRataPerBulan).toBeCloseTo(80_000 / 12);
  });

  it("portofolio kosong tidak menghasilkan NaN", () => {
    const kosong = hitungRingkasan([]);
    expect(kosong.yieldOnCost).toBe(0);
    expect(kosong.gainPersen).toBe(0);
    expect(kosong.dividenTahunan).toBe(0);
  });
});

describe("hitungDividenPerBulan", () => {
  const baris = hitungDividenPerBulan([saham]);
  it("menghasilkan 12 baris (Jan–Des)", () => {
    expect(baris).toHaveLength(12);
  });
  it("menaruh dividen di bulan yang benar", () => {
    // Maret = index 2, 50 × 1000 = 50.000
    expect(baris[2].XXXX).toBe(50_000);
    expect(baris[2].total).toBe(50_000);
    // September = index 8, 30 × 1000 = 30.000
    expect(baris[8].XXXX).toBe(30_000);
  });
  it("bulan tanpa dividen bernilai total 0", () => {
    expect(baris[0].total).toBe(0); // Januari
  });
});

// Saham kedua untuk menguji pengurutan.
const saham2: Stock = {
  id: "y",
  code: "AAAA",
  lots: 5, // 500 lembar
  avgBuyPrice: 2000,
  currentPrice: 1800,
  color: "#000",
  dividends: [{ id: "e1", dps: 100, month: 6 }],
};

describe("insight per saham", () => {
  it("yield on cost per saham", () => {
    // 80.000 / 1.000.000 = 8%
    expect(hitungYieldOnCostSaham(saham)).toBeCloseTo(8);
  });
  it("porsi = nilai saham ÷ total nilai × 100", () => {
    // nilai saham = 1.200.000; jika total = 1.200.000 -> 100%
    expect(hitungPorsi(saham, 1_200_000)).toBeCloseTo(100);
  });
  it("porsi aman saat total 0", () => {
    expect(hitungPorsi(saham, 0)).toBe(0);
  });
});

describe("urutkanSaham", () => {
  it("urut berdasarkan nilai (besar ke kecil)", () => {
    // saham nilai 1.200.000 > saham2 nilai 900.000
    const hasil = urutkanSaham([saham2, saham], "nilai");
    expect(hasil[0].code).toBe("XXXX");
  });
  it("urut berdasarkan kode A–Z", () => {
    const hasil = urutkanSaham([saham, saham2], "kode");
    expect(hasil[0].code).toBe("AAAA");
  });
  it("tidak mengubah array asli", () => {
    const asli = [saham, saham2];
    urutkanSaham(asli, "kode");
    expect(asli[0].code).toBe("XXXX"); // urutan asli tetap
  });
});

describe("hitungJadwalMendatang", () => {
  it("menghitung 'bulan lagi' dan mengurutkan dari yang terdekat", () => {
    // Anggap sekarang Januari (1). Dividen saham di Maret(3) & September(9).
    const jadwal = hitungJadwalMendatang([saham], 1);
    expect(jadwal).toHaveLength(2);
    expect(jadwal[0].month).toBe(3); // Maret terdekat
    expect(jadwal[0].bulanLagi).toBe(2); // (3 - 1)
    expect(jadwal[1].bulanLagi).toBe(8); // (9 - 1)
  });
  it("memutar ke tahun depan bila bulan sudah lewat", () => {
    // Sekarang Desember (12). Dividen Maret -> 3 bulan lagi (bukan -9).
    const jadwal = hitungJadwalMendatang([saham], 12);
    expect(jadwal[0].bulanLagi).toBe(3);
  });
});

describe("hitungStatistik", () => {
  const stat = hitungStatistik([saham, saham2]);
  it("menemukan yield tertinggi & terendah", () => {
    // saham (XXXX) YoC 8% > saham2 (AAAA) YoC 5%
    expect(stat.yieldTertinggi?.code).toBe("XXXX");
    expect(stat.yieldTerendah?.code).toBe("AAAA");
  });
  it("rata-rata yield = yield on cost portofolio", () => {
    // (80.000 + 50.000) / (1.000.000 + 1.000.000) = 6,5%
    expect(stat.rataYield).toBeCloseTo(6.5);
  });
  it("menemukan bulan dividen terbesar", () => {
    // Maret 50.000 (saham) = Juni 50.000 (saham2); yang pertama menang -> Maret
    expect(stat.bulanTerbesar?.nama).toBe("Maret");
    expect(stat.bulanTerbesar?.jumlah).toBe(50_000);
  });
  it("menemukan penyumbang dividen teratas", () => {
    // saham 80.000 > saham2 50.000
    expect(stat.kontributorTeratas?.code).toBe("XXXX");
    expect(stat.kontributorTeratas?.persen).toBeCloseTo((80_000 / 130_000) * 100);
  });
  it("portofolio kosong tidak error", () => {
    const kosong = hitungStatistik([]);
    expect(kosong.rataYield).toBe(0);
    expect(kosong.yieldTertinggi).toBeUndefined();
  });
});

describe("hitungPerSektor", () => {
  // Dua saham sektor "Keuangan" (nilai 1.2jt masing-masing) + satu "Energi".
  const a = { ...saham, id: "a", code: "AAAA", sector: "Keuangan" };
  const b = { ...saham, id: "b", code: "BBBB", sector: "Keuangan" };
  const c = { ...saham2, id: "c", code: "CCCC", sector: "Energi" };
  const hasil = hitungPerSektor([a, b, c]);

  it("menggabungkan saham dengan sektor sama", () => {
    expect(hasil).toHaveLength(2); // Keuangan + Energi
  });
  it("menjumlahkan nilai & menghitung jumlah saham per sektor", () => {
    const keuangan = hasil.find((x) => x.sektor === "Keuangan")!;
    expect(keuangan.jumlahSaham).toBe(2);
    expect(keuangan.nilai).toBe(2_400_000); // 1.2jt + 1.2jt
  });
  it("mengurutkan dari nilai terbesar", () => {
    // Keuangan 2,4jt > Energi 0,9jt
    expect(hasil[0].sektor).toBe("Keuangan");
  });
  it("saham tanpa sektor masuk 'Lainnya'", () => {
    const tanpa = { ...saham, id: "z", code: "ZZZZ" };
    const h = hitungPerSektor([tanpa]);
    expect(h[0].sektor).toBe("Lainnya");
  });
});

describe("simulasiSnowball", () => {
  // Kasus sederhana: modal 1.000.000, yield 10%, tanpa pertumbuhan & setoran.
  const dasar = {
    nilaiAwal: 1_000_000,
    yieldPersen: 10,
    pertumbuhanPersen: 0,
    setoranBulanan: 0,
    tahun: 3,
  };

  it("menghasilkan satu baris per tahun", () => {
    expect(simulasiSnowball(dasar)).toHaveLength(3);
  });

  it("dividen tahun pertama = nilai awal × yield", () => {
    const h = simulasiSnowball(dasar);
    expect(h[0].dividenReinvest).toBe(100_000); // 1.000.000 × 10%
    expect(h[0].dividenTanpa).toBe(100_000); // tahun-1 sama persis
  });

  it("reinvest membuat modal & dividen membesar (bola salju)", () => {
    const h = simulasiSnowball(dasar);
    // Tahun 1: nilai jadi 1.1jt -> dividen tahun 2 = 110.000 (10% dari 1,1jt).
    expect(h[1].dividenReinvest).toBeCloseTo(110_000, 5);
    // Tanpa reinvest, modal tetap 1jt -> dividen tetap 100.000 tiap tahun.
    expect(h[1].dividenTanpa).toBe(100_000);
    // Skenario reinvest selalu >= tanpa reinvest.
    expect(h[2].nilaiReinvest).toBeGreaterThan(h[2].nilaiTanpa);
  });

  it("pertumbuhan dividen menaikkan yield efektif tiap tahun", () => {
    // yield 10% + tumbuh 20%/th. Tahun 2 yield efektif = 12%.
    const h = simulasiSnowball({ ...dasar, pertumbuhanPersen: 20 });
    // Nilai akhir tahun 1 = 1,1jt; dividen tahun 2 = 1,1jt × 12% = 132.000.
    expect(h[1].dividenReinvest).toBeCloseTo(132_000, 5);
  });

  it("setoran bulanan menambah modal walau tanpa reinvest", () => {
    const h = simulasiSnowball({
      nilaiAwal: 0,
      yieldPersen: 10,
      pertumbuhanPersen: 0,
      setoranBulanan: 100_000, // 1,2jt/tahun
      tahun: 2,
    });
    // Modal tanpa reinvest hanya dari setoran: 1,2jt lalu 2,4jt.
    expect(h[0].nilaiTanpa).toBe(1_200_000);
    expect(h[1].nilaiTanpa).toBe(2_400_000);
  });
});
