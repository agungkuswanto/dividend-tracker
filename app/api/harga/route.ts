// =============================================================
// API ROUTE: /api/harga?kode=BBRI,TLKM
// -------------------------------------------------------------
// Ini berjalan di SERVER (bukan browser). Tugasnya mengambil harga
// terakhir saham IDX dari Yahoo Finance, lalu mengembalikannya ke app.
//
// Kenapa lewat server, bukan langsung dari browser?
//  1) CORS: Yahoo menolak dipanggil langsung dari halaman web.
//  2) Rapi: browser cukup memanggil /api/harga milik kita sendiri.
//
// Catatan: Yahoo Finance adalah sumber TIDAK RESMI. Harga biasanya
// delay ~15 menit dan formatnya bisa berubah sewaktu-waktu. Cukup
// untuk pelacakan dividen, tapi jangan dijadikan satu-satunya acuan.
// =============================================================

import { NextRequest, NextResponse } from "next/server";

// Jangan cache hasilnya — kita ingin harga terbaru tiap dipanggil.
export const dynamic = "force-dynamic";

// Data satu saham: harga terakhir + nama perusahaan (bila ada).
export interface DataSaham {
  harga: number;
  nama?: string;
}

// Bentuk jawaban: data yang berhasil + daftar kode yang gagal.
interface JawabanHarga {
  hasil: Record<string, DataSaham>; // { "BBRI": { harga: 3070, nama: "..." } }
  gagal: string[]; // kode yang tidak dapat harga
}

// Mengambil data 1 saham dari Yahoo. Kembalikan {harga, nama}, atau null bila gagal.
async function ambilSatu(kode: string): Promise<DataSaham | null> {
  try {
    // Saham IDX di Yahoo memakai akhiran ".JK" (mis. BBRI -> BBRI.JK).
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${kode}.JK?interval=1d&range=1d`;

    const res = await fetch(url, {
      // User-Agent generik; Yahoo kadang menolak permintaan tanpa ini.
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DividendTracker/1.0)" },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const harga = meta?.regularMarketPrice;
    if (typeof harga !== "number") return null;

    // Nama perusahaan: pakai shortName (lebih ringkas), cadangan longName.
    const nama: string | undefined =
      (typeof meta?.shortName === "string" && meta.shortName) ||
      (typeof meta?.longName === "string" && meta.longName) ||
      undefined;

    return { harga, nama };
  } catch {
    // Jaringan error / JSON rusak / format berubah -> anggap gagal.
    return null;
  }
}

export async function GET(req: NextRequest) {
  // Ambil parameter "kode" dari URL, mis. "BBRI,TLKM,BBCA".
  const kodeParam = req.nextUrl.searchParams.get("kode") ?? "";

  // Pecah jadi array, rapikan (huruf besar, buang spasi & duplikat).
  const daftarKode = Array.from(
    new Set(
      kodeParam
        .split(",")
        .map((k) => k.trim().toUpperCase())
        .filter(Boolean)
    )
  );

  // Batasi jumlah agar tidak membebani (maks 50 saham sekali panggil).
  const kodeTerbatas = daftarKode.slice(0, 50);

  const jawaban: JawabanHarga = { hasil: {}, gagal: [] };

  // Ambil semua data secara paralel (lebih cepat daripada satu per satu).
  await Promise.all(
    kodeTerbatas.map(async (kode) => {
      const data = await ambilSatu(kode);
      if (data != null) jawaban.hasil[kode] = data;
      else jawaban.gagal.push(kode);
    })
  );

  return NextResponse.json(jawaban);
}
