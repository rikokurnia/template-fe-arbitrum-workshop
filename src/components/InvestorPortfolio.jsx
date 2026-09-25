// =============================================================================
// FILE: src/components/InvestorPortfolio.jsx
// DESKRIPSI: Komponen Portofolio Kepemilikan Investor & Status Cooldown Anti-Spam
// =============================================================================

// 1. IMPORT DEPENDENSI
import React from 'react';
import { PieChart, Clock, Award } from 'lucide-react';

/**
 * Komponen InvestorPortfolio
 * 
 * PROPS YANG DITERIMA DARI INDUK (App.jsx):
 * @param {number} myFractions - Jumlah lembar fraksi yang telah dimiliki oleh user/investor.
 * @param {string} priceEth - Harga fraksi per unit dalam ETH untuk menghitung valuasi portofolio.
 * @param {number} cooldownSeconds - Sisa waktu jeda transaksi (dalam detik) anti-bot spam.
 */
export default function InvestorPortfolio({ 
  myFractions, 
  priceEth, 
  cooldownSeconds 
}) {
  // ---------------------------------------------------------------------------
  // KALKULASI SEBELUM RETURN: Menghitung Estimasi Valuasi Portofolio (ETH)
  // ---------------------------------------------------------------------------
  // • fractions: Konversi aman nilai lembar ke tipe data Number (fallback ke 0).
  // • price: Konversi harga string (misal: "0.001") menjadi angka pecahan (float).
  // • estimatedValue: Total valuasi kepemilikan aset user (jumlah lembar x harga ETH)
  //   dengan pembulatan 3 digit desimal menggunakan `.toFixed(3)`.
  // ---------------------------------------------------------------------------
  const fractions = Number(myFractions) || 0;
  const price = parseFloat(priceEth) || 0.001;
  const estimatedValue = (fractions * price).toFixed(3);

  return (
    <div className="card">
      {/* HEADER KARTU */}
      <div className="card-title">
        <PieChart size={20} />
        <span>Portofolio Kepemilikan Anda</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
        {/* JUMLAH LEMBAR FRAKSI YANG DIMILIKI */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} /> Unit Fraksi Dimiliki
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            {fractions} <small style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lembar</small>
          </span>
        </div>

        {/* ESTIMASI NILAI DALAM KURS ETH */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Estimasi Nilai Kepemilikan
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
            ≈ {estimatedValue} ETH
          </span>
        </div>

        {/* STATUS COOLDOWN ANTI-SPAM (MEKANISME PERLINDUNGAN SMART CONTRACT) */}
        {/* Jika cooldownSeconds > 0: Tampilkan warna merah dengan hitungan mundur detik.
            Jika cooldownSeconds === 0: Tampilkan warna hijau "Siap Berinvestasi". */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} /> Status Cooldown Anti-Spam
          </span>
          <span style={{
            fontSize: '0.9rem',
            color: cooldownSeconds > 0 ? 'var(--accent-red)' : 'var(--accent-green)',
            fontWeight: '600'
          }}>
            {cooldownSeconds > 0 ? `Tunggu ${cooldownSeconds} detik` : 'Siap Berinvestasi ⚡'}
          </span>
        </div>

        {/* CATATAN EDUKASI RWA */}
        <div style={{
          padding: '10px 14px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '10px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          💡 <em>Kepemilikan tercatat langsung di smart contract Arbitrum Sepolia dan mewakili hak atas aset fisik.</em>
        </div>
      </div>
    </div>
  );
}
