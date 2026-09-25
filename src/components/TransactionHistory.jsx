// =============================================================================
// FILE: src/components/TransactionHistory.jsx
// DESKRIPSI: Komponen Tabel Riwayat Transaksi On-Chain & Pembuktian Arbiscan
// =============================================================================

// 1. IMPORT DEPENDENSI
import React from 'react';
import { History, ExternalLink, CheckCircle2, Trash2, Clock } from 'lucide-react';

/**
 * Komponen TransactionHistory
 * 
 * PROPS YANG DITERIMA DARI INDUK (App.jsx):
 * @param {Array<object>} transactions - Daftar riwayat transaksi tersimpan (dari state / LocalStorage).
 * @param {function} onClearHistory - Fungsi callback untuk membersihkan seluruh data riwayat transaksi.
 */
export default function TransactionHistory({ 
  transactions, 
  onClearHistory 
}) {
  // ---------------------------------------------------------------------------
  // 1. HELPER SEBELUM RETURN: Pewarnaan Badge Berdasarkan Tipe Transaksi
  // ---------------------------------------------------------------------------
  // Mengembalikan objek gaya CSS (warna font, background lembut, dan warna border)
  // sesuai dengan kategori aksi transaksi.
  // ---------------------------------------------------------------------------
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'Beli Fraksi':
        return {
          background: 'rgba(16, 185, 129, 0.12)',
          color: 'var(--accent-green)',
          borderColor: 'rgba(16, 185, 129, 0.3)'
        };
      case 'Restock Kuota':
        return {
          background: 'rgba(40, 160, 240, 0.12)',
          color: 'var(--primary)',
          borderColor: 'rgba(40, 160, 240, 0.3)'
        };
      case 'Tarik Modal':
        return {
          background: 'rgba(245, 158, 11, 0.12)',
          color: 'var(--accent-gold)',
          borderColor: 'rgba(245, 158, 11, 0.3)'
        };
      default:
        return {
          background: 'rgba(139, 148, 158, 0.12)',
          color: 'var(--text-muted)',
          borderColor: 'rgba(139, 148, 158, 0.3)'
        };
    }
  };

  // ---------------------------------------------------------------------------
  // 2. HELPER SEBELUM RETURN: Format Jam & Tanggal Lokal Indonesia
  // ---------------------------------------------------------------------------
  // Mengubah angka timestamp milidetik (contoh: 1727220000000) menjadi format jam:menit:detik
  // serta tanggal bulan yang mudah dibaca pengguna di Indonesia.
  // ---------------------------------------------------------------------------
  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      ' · ' + date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  // ---------------------------------------------------------------------------
  // 3. HELPER SEBELUM RETURN: Pemotong Hash Transaksi (Truncate TX Hash)
  // ---------------------------------------------------------------------------
  // Hash transaksi blockchain memiliki panjang 66 karakter heksadesimal (0x...).
  // Fungsi ini memotongnya menjadi 8 karakter depan + "..." + 6 karakter belakang.
  // Contoh output: "0x3a7b8e...c0d1e2f".
  // ---------------------------------------------------------------------------
  const truncateHash = (hash) => {
    if (!hash) return '';
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      {/* HEADER TABEL RIWAYAT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="card-title" style={{ margin: 0 }}>
          <History size={20} />
          <span>Bukti Transaksi On-Chain (Arbiscan Proof)</span>
          {/* Badge penghitung total transaksi tersimpan */}
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'rgba(40, 160, 240, 0.15)',
            color: 'var(--primary)',
            marginLeft: '4px'
          }}>
            {transactions.length} Tersimpan
          </span>
        </div>

        {/* TOMBOL BERSAPU RIWAYAT (HANYA MUNCUL JIKA ADA TRANSAKSI) */}
        {transactions.length > 0 && (
          <button
            onClick={onClearHistory}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              background: 'transparent',
              padding: '4px 8px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title="Hapus riwayat lokal"
          >
            <Trash2 size={14} /> Bersihkan
          </button>
        )}
      </div>

      {/* RENDER KONDISIONAL:
          1. JIKA BELUM ADA TRANSAKSI: Tampilkan placeholder kosong yang edukatif.
          2. JIKA SUDAH ADA TRANSAKSI: Tampilkan daftar item riwayat lengkap dengan link Arbiscan. */}
      {transactions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '28px 16px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          border: '1px dashed rgba(255, 255, 255, 0.1)'
        }}>
          <Clock size={28} style={{ color: 'var(--text-muted)', marginBottom: '8px', opacity: 0.6 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Belum ada transaksi on-chain yang tersimpan.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px', opacity: 0.75 }}>
            Lakukan pembelian fraksi di atas untuk melihat bukti hash transaksi yang tercatat otomatis di LocalStorage dan Arbiscan!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {transactions.map((tx, idx) => {
            const badge = getBadgeStyle(tx.type);
            return (
              <div
                key={tx.hash || idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                {/* TIPE TRANSAKSI, DESKRIPSI & WAKTU */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      border: `1px solid ${badge.borderColor}`,
                      background: badge.background,
                      color: badge.color
                    }}
                  >
                    <CheckCircle2 size={12} />
                    {tx.type}
                  </span>

                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-main)' }}>
                      {tx.description}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={12} /> {formatTime(tx.timestamp)}
                    </div>
                  </div>
                </div>

                {/* HASH TRANSAKSI & TAUTAN ARBISCAN SEPOLIA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <code style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}>
                    {truncateHash(tx.hash)}
                  </code>

                  <a
                    href={`https://sepolia.arbiscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.82rem',
                      color: 'var(--primary)',
                      textDecoration: 'none',
                      padding: '4px 10px',
                      background: 'rgba(40, 160, 240, 0.1)',
                      border: '1px solid rgba(40, 160, 240, 0.25)',
                      borderRadius: '6px',
                      fontWeight: '500'
                    }}
                  >
                    Arbiscan <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
            💡 Riwayat transaksi ini tersimpan permanen di <strong>LocalStorage</strong> peramban dan terhubung langsung ke hash on-chain Arbitrum Sepolia.
          </p>
        </div>
      )}
    </div>
  );
}
