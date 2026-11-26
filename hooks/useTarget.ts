"use client";

import { useEffect, useState } from "react";

// =============================================================
// HOOK TARGET PASSIVE INCOME
// Menyimpan target dividen per TAHUN (dalam rupiah) di localStorage,
// terpisah dari data portofolio. 0 = belum diatur.
// =============================================================
const STORAGE_KEY = "dividend-tracker:target";

export function useTarget() {
  const [target, setTargetState] = useState(0);
  // loaded: penanda bahwa nilai dari localStorage sudah dibaca,
  // supaya tidak "berkedip" dari 0 ke nilai tersimpan.
  const [loaded, setLoaded] = useState(false);

  // Baca target tersimpan sekali saat komponen pertama muncul.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTargetState(Number(raw) || 0);
    } catch {
      // Abaikan bila localStorage tidak tersedia (mis. mode privat).
    }
    setLoaded(true);
  }, []);

  // Simpan target baru ke state + localStorage.
  const setTarget = (nilai: number) => {
    const aman = nilai >= 0 ? nilai : 0;
    setTargetState(aman);
    try {
      localStorage.setItem(STORAGE_KEY, String(aman));
    } catch {
      // Abaikan bila gagal menyimpan.
    }
  };

  return { target, setTarget, loaded };
}
