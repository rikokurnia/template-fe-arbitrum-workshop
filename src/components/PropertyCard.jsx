// =============================================================================
// FILE: src/components/PropertyCard.jsx
// DESKRIPSI: Komponen Kartu Informasi Aset Properti RWA & Bukti Legalitas IPFS
// =============================================================================

// 1. IMPORT DEPENDENSI
// React dan icon-icon dari Lucide untuk mempercantik kartu aset.
import React from 'react';
import { Home, Tag, Layers, FileText, ExternalLink } from 'lucide-react';

/**
 * Komponen PropertyCard
 * 
 * PROPS YANG DITERIMA DARI INDUK (App.jsx):
 * @param {string} propertyName - Nama aset properti (contoh: "Bali Sunset Villa #01").
 * @param {string} symbol - Simbol token / ticker fraksi (contoh: "VILLA-BALI-01").
 * @param {string} priceEth - Harga investasi per lembar fraksi dalam satuan ETH (contoh: "0.001").
 * @param {number} availableFractions - Sisa kuota fraksi yang belum terbeli (contoh: 990).
 * @param {number} totalFractions - Total pasokan fraksi yang diterbitkan oleh pengembang (contoh: 1000).
 * @param {string} documentURI - Tautan URI dokumen legalitas (contoh: "ipfs://bafybei...").
 */
export default function PropertyCard({ 
  propertyName, 
  symbol, 
  priceEth, 
  availableFractions, 
  totalFractions, 
  documentURI 
}) {
  // ---------------------------------------------------------------------------
  // 1. KALKULASI SEBELUM RETURN: Menghitung Sisa Kuota & Persentase Bar Penjualan
  // ---------------------------------------------------------------------------
  // • total: Memastikan nilai bertipe number (fallback ke 1000 jika belum terisi).
  // • available: Sisa fraksi yang masih bisa dibeli investor.
  // • sold: Jumlah unit fraksi yang sudah laku terjual (total - available).
  // • percentSold: Persentase 0-100% untuk menentukan lebar style progress bar fill.
  // ---------------------------------------------------------------------------
  const total = Number(totalFractions) || 1000;
  const available = Number(availableFractions) || 0;
  const sold = Math.max(0, total - available);
  const percentSold = Math.min(100, Math.round((sold / total) * 100));

  // ---------------------------------------------------------------------------
  // 2. HELPER SEBELUM RETURN: IPFS Gateway Resolver
  // ---------------------------------------------------------------------------
  // Browser standar (Chrome, Firefox, Safari) tidak bisa membuka protokol desentralisasi
  // "ipfs://" secara langsung tanpa ekstensi khusus IPFS node.
  // Fungsi ini mengubah URI "ipfs://bafy..." menjadi URL web HTTPS gateway publik
  // (misal: Pinata Gateway) agar sertifikat PDF bisa langsung diklik dan dibuka oleh siapa saja.
  // ---------------------------------------------------------------------------
  const getGatewayUrl = (uri) => {
    if (!uri) return '#';
    if (uri.startsWith('ipfs://')) {
      return `https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://', '')}`;
    }
    return uri;
  };

  return (
    <div className="card">
      {/* JUDUL KARTU */}
      <div className="card-title">
        <Home size={20} />
        <span>Detail Aset Properti (RWA)</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
        {/* NAMA PROPERTI & TICKER */}
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
            {propertyName || 'Bali Sunset Villa #01'}
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
            Ticker: {symbol || 'VILLA-BALI-01'}
          </span>
        </div>

        {/* HARGA PER LEMBAR FRAKSI */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={18} /> Harga per Fraksi
          </span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
            {priceEth} ETH
          </span>
        </div>

        {/* KUOTA PENJUALAN & VISUALISASI PROGRESS BAR */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} /> Kuota Penjualan
            </span>
            <span>
              <strong>{available}</strong> / {total} Fraksi Tersedia
            </span>
          </div>
          {/* Progress bar container (abu-abu gelap) */}
          <div className="progress-bar-bg">
            {/* Progress bar isi (biru menyala dinamis sesuai percentSold) */}
            <div className="progress-bar-fill" style={{ width: `${percentSold}%` }}></div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
            {percentSold}% Terjual
          </p>
        </div>

        {/* BUKTI LEGALITAS DOKUMEN IPFS (ASPEK REAL WORLD ASSET) */}
        <div style={{
          padding: '10px 14px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '10px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <FileText size={16} /> Sertifikat BPN Legal
          </span>
          {/* Tautan link ke IPFS Gateway publik */}
          <a
            href={getGatewayUrl(documentURI)}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            Verifikasi On-Chain <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
