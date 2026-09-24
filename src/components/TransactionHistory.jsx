import React from 'react';
import { History, ExternalLink, CheckCircle2, Trash2, Clock } from 'lucide-react';

export default function TransactionHistory({ transactions, onClearHistory }) {
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

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      ' · ' + date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const truncateHash = (hash) => {
    if (!hash) return '';
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="card-title" style={{ margin: 0 }}>
          <History size={20} />
          <span>Bukti Transaksi On-Chain (Arbiscan Proof)</span>
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
              borderRadius: '6px'
            }}
            title="Hapus riwayat lokal"
          >
            <Trash2 size={14} /> Bersihkan
          </button>
        )}
      </div>

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
