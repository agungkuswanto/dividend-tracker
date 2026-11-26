// Unit test untuk fungsi format angka.
// Dijalankan dengan: npm test
import { describe, it, expect } from "vitest";
import {
  formatRibuan,
  formatRupiah,
  formatPersen,
  formatSingkat,
} from "./format";

describe("formatRibuan", () => {
  it("memberi pemisah ribuan titik", () => {
    expect(formatRibuan(2266794)).toBe("2.266.794");
  });
  it("membulatkan desimal", () => {
    expect(formatRibuan(1500.7)).toBe("1.501");
  });
});

describe("formatRupiah", () => {
  it("menambahkan awalan 'Rp '", () => {
    expect(formatRupiah(2266794)).toBe("Rp 2.266.794");
  });
});

describe("formatPersen", () => {
  it("memakai koma sebagai desimal", () => {
    expect(formatPersen(10.15)).toBe("10,15%");
  });
  it("menghormati jumlah desimal", () => {
    expect(formatPersen(20, 0)).toBe("20%");
  });
  it("menangani angka negatif", () => {
    expect(formatPersen(-5.5)).toBe("-5,50%");
  });
});

describe("formatSingkat", () => {
  it("memakai 'jt' untuk jutaan", () => {
    expect(formatSingkat(6370000)).toBe("6,37 jt");
  });
  it("memakai 'rb' untuk ribuan", () => {
    expect(formatSingkat(12500)).toBe("12,50 rb");
  });
  it("menampilkan angka kecil apa adanya", () => {
    expect(formatSingkat(850)).toBe("850");
  });
});
