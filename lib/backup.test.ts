// Unit test untuk parsing & validasi file backup.
import { describe, it, expect } from "vitest";
import { buatBackup, parseBackup } from "./backup";
import { Stock } from "./types";

const saham: Stock = {
  id: "bbri",
  code: "BBRI",
  lots: 10,
  avgBuyPrice: 4500,
  currentPrice: 4700,
  color: "#f5c33b",
  dividends: [{ id: "d1", dps: 100, month: 4, label: "Final" }],
};

describe("buatBackup", () => {
  it("membungkus saham dengan metadata", () => {
    const b = buatBackup([saham]);
    expect(b.app).toBe("dividend-tracker");
    expect(b.stocks).toHaveLength(1);
    expect(typeof b.exportedAt).toBe("string");
  });
});

describe("parseBackup", () => {
  it("membaca objek backup lengkap { stocks: [...] }", () => {
    const teks = JSON.stringify(buatBackup([saham]));
    const hasil = parseBackup(teks);
    expect(hasil).toHaveLength(1);
    expect(hasil[0].code).toBe("BBRI");
  });

  it("juga menerima array saham langsung", () => {
    const hasil = parseBackup(JSON.stringify([saham]));
    expect(hasil[0].code).toBe("BBRI");
  });

  it("mengubah kode jadi huruf besar", () => {
    const hasil = parseBackup(JSON.stringify([{ ...saham, code: "tlkm" }]));
    expect(hasil[0].code).toBe("TLKM");
  });

  it("membatasi bulan dividen ke rentang 1..12", () => {
    const hasil = parseBackup(
      JSON.stringify([{ ...saham, dividends: [{ dps: 10, month: 99 }] }])
    );
    expect(hasil[0].dividends[0].month).toBe(12);
  });

  it("melempar error untuk JSON tidak valid", () => {
    expect(() => parseBackup("{bukan json")).toThrow();
  });

  it("melempar error bila bukan daftar saham", () => {
    expect(() => parseBackup(JSON.stringify({ foo: 1 }))).toThrow();
  });

  it("melempar error bila angka tidak valid", () => {
    expect(() =>
      parseBackup(JSON.stringify([{ code: "ABCD", lots: "xx" }]))
    ).toThrow();
  });
});
