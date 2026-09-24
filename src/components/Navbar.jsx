import React from 'react';
import { Wallet, ShieldCheck, Building2, AlertCircle, X } from 'lucide-react';

export default function Navbar({ account, onConnect, isConnecting, connectError, onDismissConnectError }) {
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="status-badge">
          <ShieldCheck size={16} color="var(--accent-green)" />
          <span>Arbitrum Sepolia (421614)</span>
        </div>

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

    {/* Banner error koneksi dompet (mis. wallet terkunci / tanpa akun / request ditolak) */}
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
