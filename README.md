# Dividend Tracker 📈

Pelacak dividen saham Indonesia (IDX) sederhana. Dibuat dengan **Next.js + TypeScript + Tailwind CSS + Recharts**. Data disimpan di **localStorage** (tanpa backend), siap dipindah ke Supabase nanti.

## ✨ Fitur

- **Kartu ringkasan gelap**: rata-rata dividen/bulan, estimasi dividen setahun, yield on cost, nilai portofolio, kas disetor, potensi gain/loss (Rp & %).
- **Input portofolio**: tambah / edit / hapus saham (kode, lot, harga beli, harga sekarang, warna).
- **Jadwal dividen per saham**: DPS (dividen per lembar) + bulan pembayaran, bisa lebih dari 1× setahun (interim + final).
- **Grafik stacked bar** "Estimasi Dividen Tiap Bulan" (Jan–Des) dengan total di atas batang dan tooltip rincian per saham.
- **Tombol Bagikan**: ekspor kartu ringkasan jadi gambar PNG (footer "Dibuat [tanggal] · IDR").
- **Format angka Indonesia**: `Rp 2.266.794`, `10,15%`, `6,37 jt`.

## 🚀 Cara menjalankan (development)

```bash
npm install      # sekali saja, memasang dependency
npm run dev      # jalankan server pengembangan
```

Lalu buka **http://localhost:3000** di browser. Setiap perubahan kode langsung ter-reload.

## 🧪 Menjalankan test

```bash
npm test         # menjalankan unit test fungsi perhitungan & format
```

## 🏗️ Build produksi (opsional, untuk cek error)

```bash
npm run build    # memastikan tidak ada error TypeScript / build
npm run start    # menjalankan hasil build
```

## 📁 Struktur folder

```
app/
  layout.tsx          # kerangka HTML seluruh halaman
  page.tsx            # halaman utama (dashboard) — merakit semua komponen
  globals.css         # style global + Tailwind
components/
  SummaryCard.tsx     # kartu ringkasan gelap (6 metrik)
  MetricTile.tsx      # 1 kotak metrik kecil
  DividendChart.tsx   # grafik stacked bar per bulan
  HoldingsList.tsx    # daftar saham + tombol edit/hapus
  StockForm.tsx       # form tambah/edit saham + jadwal dividen
  ShareButton.tsx     # tombol ekspor gambar PNG
hooks/
  usePortfolio.ts     # muat & simpan data ke localStorage (sumber data)
lib/
  types.ts            # bentuk data (Stock, DividendPayment)
  format.ts           # format angka gaya Indonesia
  calculations.ts     # semua rumus perhitungan
  sampleData.ts       # 7 saham contoh
  *.test.ts           # unit test
```

## ☁️ Deploy gratis ke Vercel

Vercel adalah pembuat Next.js, jadi deploy-nya paling mudah ke sana.

1. Buat akun gratis di <https://vercel.com> (bisa login pakai GitHub).
2. Push kode ini ke sebuah repo GitHub:
   ```bash
   git init
   git add .
   git commit -m "Dividend Tracker awal"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
3. Di dashboard Vercel: **Add New → Project → Import** repo tadi.
4. Biarkan setelan default (Vercel otomatis mendeteksi Next.js), klik **Deploy**.
5. Selesai — aplikasi dapat URL publik `https://nama-repo.vercel.app`.

> Alternatif tanpa GitHub: pasang Vercel CLI (`npm i -g vercel`) lalu jalankan `vercel` di folder ini dan ikuti instruksinya.

## 🔜 Rencana lanjutan (opsional)

- Pindahkan penyimpanan dari localStorage ke **Supabase** (cukup ubah isi `hooks/usePortfolio.ts`).
- Ambil harga saham real-time dari API.
- Tambah login per pengguna.

---

⚠️ Angka pada data contoh hanya **ilustrasi**, bukan data pasar sebenarnya.
