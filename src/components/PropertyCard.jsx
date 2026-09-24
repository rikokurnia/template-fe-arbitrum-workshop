import React from 'react';
import { Home, Tag, Layers, FileText, ExternalLink } from 'lucide-react';

export default function PropertyCard({ propertyName, symbol, priceEth, availableFractions, totalFractions, documentURI }) {
  const total = Number(totalFractions) || 1000;
  const available = Number(availableFractions) || 0;
  const sold = Math.max(0, total - available);
  const percentSold = Math.min(100, Math.round((sold / total) * 100));

  const getGatewayUrl = (uri) => {
    if (!uri) return '#';
    if (uri.startsWith('ipfs://')) {
      return `https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://', '')}`;
    }
    return uri;
  };

  return (
    <div className="card">
      <div className="card-title">
        <Home size={20} />
        <span>Detail Aset Properti (RWA)</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
            {propertyName || 'Bali Sunset Villa #01'}
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
            Ticker: {symbol || 'VILLA-BALI-01'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={18} /> Harga per Fraksi
          </span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
            {priceEth} ETH
          </span>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} /> Kuota Penjualan
            </span>
            <span>
              <strong>{available}</strong> / {total} Fraksi Tersedia
            </span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${percentSold}%` }}></div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
            {percentSold}% Terjual
          </p>
        </div>

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
