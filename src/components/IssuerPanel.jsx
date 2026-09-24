import React, { useState } from 'react';
import { Lock, PlusCircle, ArrowDownToLine } from 'lucide-react';

export default function IssuerPanel({ isOwner, onRestock, onWithdraw, isTransacting }) {
  const [restockAmount, setRestockAmount] = useState(250);

  if (!isOwner) return null; // Sembunyikan jika bukan pengelola sah

  return (
    <div className="card" style={{ marginTop: '20px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
      <div className="card-title" style={{ color: 'var(--accent-gold)' }}>
        <Lock size={20} />
        <span>Asset Issuer Dashboard (Kontrol Pengelola Properti)</span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Anda terdeteksi sebagai <strong>Pengelola Sah Aset (Contract Owner)</strong>. Anda memiliki hak untuk menambah kuota fraksi penawaran dan mencairkan modal investasi ETH untuk operasional properti.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            min="1"
            value={restockAmount}
            onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
            disabled={isTransacting}
            placeholder="Tambah kuota"
            style={{
              width: '100px',
              padding: '10px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-card)',
              borderRadius: '10px',
              color: 'var(--text-main)'
            }}
          />
          <button
            onClick={() => onRestock(restockAmount)}
            disabled={isTransacting}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: 'var(--accent-gold)',
              color: '#000',
              fontWeight: 'bold',
              borderRadius: '10px'
            }}
          >
            <PlusCircle size={18} />
            <span>Tambah Kuota</span>
          </button>
        </div>

        <button
          onClick={onWithdraw}
          disabled={isTransacting}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: 'var(--accent-green)',
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: '10px'
          }}
        >
          <ArrowDownToLine size={18} />
          <span>Tarik Modal Investasi (Withdraw)</span>
        </button>
      </div>
    </div>
  );
}
