"use client";

import { useEffect, useRef, useState } from "react";

// =============================================================
// HOOK COUNT-UP
// Membuat angka "naik" mulus dari nilai lama ke nilai baru,
// mis. dari 0 → Rp 2.266.794 saat halaman dibuka.
//
// Cara pakai:
//   const nilai = useCountUp(totalDividen);
//   ...tampilkan formatRupiah(nilai)
//
// Menghormati "prefers-reduced-motion": kalau pengguna memilih
// "kurangi animasi" di OS, angka langsung ke nilai akhir.
// =============================================================
export function useCountUp(target: number, durationMs = 800): number {
  // Mulai dari 0 supaya ada efek "naik" saat pertama muncul.
  const [value, setValue] = useState(0);

  // Menyimpan nilai terakhir yang ditampilkan, agar animasi berikutnya
  // mulai dari sana (bukan loncat), mis. saat data diubah.
  const valueRef = useRef(0);

  // Menyimpan id frame animasi supaya bisa dibatalkan.
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Cek preferensi "kurangi gerak".
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      valueRef.current = target;
      setValue(target);
      return;
    }

    const from = valueRef.current; // mulai dari nilai yang sedang tampil
    const delta = target - from;
    if (delta === 0) return; // tidak ada perubahan → tidak perlu animasi

    const start = performance.now();

    const tick = (now: number) => {
      // t = progres 0..1 berdasarkan waktu berjalan.
      const t = Math.min((now - start) / durationMs, 1);
      // easeOutCubic: cepat di awal, melambat di akhir (terasa natural).
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + delta * eased;
      valueRef.current = v;
      setValue(v);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // Bersihkan animasi bila target berubah / komponen dilepas.
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return value;
}
