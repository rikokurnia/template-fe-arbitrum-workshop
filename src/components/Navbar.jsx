// =============================================================================
// FILE: src/components/Navbar.jsx
// DESKRIPSI: Komponen Header Navigasi & Status Koneksi Dompet Web3
// =============================================================================

// 1. IMPORT DEPENDENSI
// React untuk komponen UI, dan Lucide-React untuk icon vektor modern.
import React from 'react';
import { Wallet, ShieldCheck, Building2, AlertCircle, X } from 'lucide-react';

/**
 * Komponen Navbar
 * 
 * PROPS YANG DITERIMA DARI INDUK (App.jsx):
 * @param {string|null} account - Alamat dompet user yang terhubung (misal: "0xd1C4...1cA4") atau null jika belum terhubung.
 * @param {function} onConnect - Fungsi callback dari App.jsx yang dipicu saat tombol 'Connect Wallet' diklik.
 * @param {boolean} isConnecting - Status loading true/false saat pop-up MetaMask sedang menunggu otorisasi user.
 * @param {string|null} connectError - Pesan teks error jika proses koneksi dompet mengalami kendala.
 * @param {function} onDismissConnectError - Fungsi callback untuk menutup/menghapus banner error koneksi.
 */
export default function Navbar({ 
  account, 
  onConnect, 
  isConnecting, 
  connectError, 
  onDismissConnectError 
}) {
  // ---------------------------------------------------------------------------
  // HELPER FUNCTION SEBELUM RETURN: Pemotong Alamat Dompet (Truncate Address)
  // ---------------------------------------------------------------------------
  // Alamat dompet Ethereum memiliki panjang 42 karakter (contoh: 0xd1C46EbdCE5d3b84869cC0754735036efeA41cA4).
  // Fungsi ini memotongnya menjadi format ringkas: 6 karakter depan + "..." + 4 karakter belakang.
  // Contoh output: "0xd1C4...1cA4" (lebih rapi dan pas untuk badge di navbar).
  // ---------------------------------------------------------------------------
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: '16px'
      }}>
        {/* LOGO & IDENTITAS APLIKASI */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(40, 160, 240, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--primary)'
          }}>
            <Building2 size={24} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Arbitrum RWA Real Estate</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tokenized Property on Arbitrum Sepolia</p>
          </div>
        </div>

        {/* STATUS JARINGAN & TOMBOL DOMPET */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Badge Penunjuk Jaringan Arbitrum Sepolia (Chain ID 421614) */}
          <div className="status-badge">
            <ShieldCheck size={16} color="var(--accent-green)" />
            <span>Arbitrum Sepolia (421614)</span>
          </div>

          {/* RENDER KONDISIONAL:
              - Jika sudah terhubung (account !== null): Tampilkan badge alamat dompet.
              - Jika belum terhubung: Tampilkan tombol 'Connect Wallet'. */}
          {account ? (
            <div style={{
              padding: '8px 16px',
              background: 'rgba(40, 160, 240, 0.15)',
              border: '1px solid var(--primary)',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '0.9rem',
              color: 'var(--primary)'
            }}>
              {formatAddress(account)}
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'var(--primary)',
                color: '#fff',
                borderRadius: '12px',
                fontWeight: '600',
                boxShadow: '0 4px 14px var(--primary-glow)'
              }}
            >
              <Wallet size={18} />
              <span>{isConnecting ? 'Menghubungkan...' : 'Connect Wallet'}</span>
            </button>
          )}
        </div>
      </header>

      {/* BANNER NOTIFIKASI ERROR KONEKSI DOMPET
          Hanya muncul jika state `connectError` bernilai string (tidak null). */}
      {connectError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid var(--accent-red)',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={20} color="var(--accent-red)" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, whiteSpace: 'pre-line', lineHeight: '1.45' }}>{connectError}</span>
          <button
            onClick={onDismissConnectError}
            aria-label="Tutup pesan error"
            style={{ background: 'transparent', color: 'var(--text-muted)', padding: '4px', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
