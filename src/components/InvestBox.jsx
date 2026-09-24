import React, { useState } from 'react';
import { ShoppingBag, AlertCircle, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

export default function InvestBox({ priceEth, onInvest, isTransacting, txStatus, txHash, availableFractions }) {
  const [quantity, setQuantity] = useState(1);
  const price = parseFloat(priceEth || '0.001');
  const totalEth = (quantity * price).toFixed(4);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity > 0) {
      onInvest(quantity);
    }
  };

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <div className="card-title">
        <ShoppingBag size={20} />
        <span>Beli Unit Fraksi Properti</span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: '1' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Jumlah Unit Fraksi
            </label>
            <input
              type="number"
              min="1"
              max={availableFractions || 100}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={isTransacting}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-card)',
                borderRadius: '10px',
                color: 'var(--text-main)',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            />
          </div>

          <div style={{ flex: '1' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Total Pembayaran (ETH)
            </label>
            <div style={{
              padding: '12px 16px',
              background: 'rgba(0, 0, 0, 0.15)',
              border: '1px dashed var(--border-card)',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'var(--accent-gold)'
            }}>
              {totalEth} ETH
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isTransacting || availableFractions === 0}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            padding: '14px',
            background: isTransacting ? 'rgba(40, 160, 240, 0.5)' : 'var(--primary)',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 'bold',
            marginTop: '8px'
          }}
        >
          {isTransacting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Memproses Investasi di Arbitrum...</span>
            </>
          ) : (
            <>
              <span>🏢 Konfirmasi & Beli ({quantity} Lembar Fraksi)</span>
            </>
          )}
        </button>
      </form>

      {/* Banner status transaksi */}
      {txStatus && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: txStatus.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${txStatus.type === 'error' ? 'var(--accent-red)' : 'var(--accent-green)'}`
        }}>
          {txStatus.type === 'error' ? (
            <AlertCircle size={20} color="var(--accent-red)" />
          ) : (
            <CheckCircle2 size={20} color="var(--accent-green)" />
          )}
          <div style={{ flex: 1, fontSize: '0.9rem' }}>
            {txStatus.message}
            {txHash && (
              <div style={{ marginTop: '4px' }}>
                <a
                  href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Lihat Transaksi di Arbiscan Sepolia <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
