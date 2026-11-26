// =============================================================
// DATA CONTOH
// 7 saham IDX populer supaya dashboard langsung terisi saat
// aplikasi pertama kali dibuka (sebelum pengguna mengisi sendiri).
//
// CATATAN: angka harga & dividen di sini hanya ILUSTRASI, bukan
// data real-time. Pengguna bisa mengubah/menghapusnya lewat form.
// (Ingat: harga & DPS = per LEMBAR, 1 lot = 100 lembar.)
// =============================================================

import { Stock } from "./types";

export const DATA_CONTOH: Stock[] = [
  {
    id: "bbri",
    code: "BBRI",
    name: "Bank Rakyat Indonesia",
    lots: 50, // 5.000 lembar
    avgBuyPrice: 4500,
    currentPrice: 4700,
    color: "#f5c33b",
    sector: "Keuangan",
    dividends: [
      { id: "bbri-1", dps: 84, month: 1, label: "Interim" },
      { id: "bbri-2", dps: 235, month: 4, label: "Final" },
    ],
  },
  {
    id: "bbca",
    code: "BBCA",
    name: "Bank Central Asia",
    lots: 20, // 2.000 lembar
    avgBuyPrice: 9000,
    currentPrice: 10200,
    color: "#60a5fa",
    sector: "Keuangan",
    dividends: [
      { id: "bbca-1", dps: 50, month: 12, label: "Interim" },
      { id: "bbca-2", dps: 220, month: 4, label: "Final" },
    ],
  },
  {
    id: "bmri",
    code: "BMRI",
    name: "Bank Mandiri",
    lots: 30, // 3.000 lembar
    avgBuyPrice: 5800,
    currentPrice: 6400,
    color: "#34d399",
    sector: "Keuangan",
    dividends: [{ id: "bmri-1", dps: 353, month: 4, label: "Final" }],
  },
  {
    id: "tlkm",
    code: "TLKM",
    name: "Telkom Indonesia",
    lots: 40, // 4.000 lembar
    avgBuyPrice: 3100,
    currentPrice: 2850, // sedang rugi (di bawah harga beli)
    color: "#a78bfa",
    sector: "Infrastruktur",
    dividends: [{ id: "tlkm-1", dps: 186, month: 5, label: "Final" }],
  },
  {
    id: "asii",
    code: "ASII",
    name: "Astra International",
    lots: 25, // 2.500 lembar
    avgBuyPrice: 4800,
    currentPrice: 5050,
    color: "#fb923c",
    sector: "Perindustrian",
    dividends: [
      { id: "asii-1", dps: 206, month: 10, label: "Interim" },
      { id: "asii-2", dps: 318, month: 4, label: "Final" },
    ],
  },
  {
    id: "ptba",
    code: "PTBA",
    name: "Bukit Asam",
    lots: 60, // 6.000 lembar
    avgBuyPrice: 2600,
    currentPrice: 2780,
    color: "#2dd4bf",
    sector: "Energi",
    dividends: [{ id: "ptba-1", dps: 461, month: 6, label: "Final" }],
  },
  {
    id: "unvr",
    code: "UNVR",
    name: "Unilever Indonesia",
    lots: 30, // 3.000 lembar
    avgBuyPrice: 2500,
    currentPrice: 2000, // sedang rugi
    color: "#f472b6",
    sector: "Barang Konsumen Primer",
    dividends: [
      { id: "unvr-1", dps: 50, month: 6, label: "Interim" },
      { id: "unvr-2", dps: 54, month: 12, label: "Final" },
    ],
  },
];
