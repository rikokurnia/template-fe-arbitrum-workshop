import React, { useState } from 'react';
import Navbar from './components/Navbar';
import PropertyCard from './components/PropertyCard';
import InvestorPortfolio from './components/InvestorPortfolio';
import InvestBox from './components/InvestBox';
import TransactionHistory from './components/TransactionHistory';
import './App.css';

export default function App() {
  // -------------------------------------------------------------
  // MOCK DATA & SIMULASI STATE (Frontend Template)
  // -------------------------------------------------------------
  const [account, setAccount] = useState(null);
  const [propertyName, setPropertyName] = useState('Bali Sunset Villa #01');
  const [symbol, setSymbol] = useState('VILLA-BALI-01');
  const [documentURI, setDocumentURI] = useState('ipfs://bafybeiexwukp7b44s42dk7fjybeduq4teqganfsmndrpxmr6im32meru3i');
  const [totalFractions, setTotalFractions] = useState(1000);
  const [availableFractions, setAvailableFractions] = useState(990);
  const [priceEth, setPriceEth] = useState('0.001');
  const [myFractions, setMyFractions] = useState(10);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const [isTransacting, setIsTransacting] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);

  // Riwayat transaksi dengan LocalStorage persistence
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('rwa_tx_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Gagal membaca localStorage:', e);
    }
    return [
      {
        hash: '0x3a7b8e1f5d6c9a4b2e0f183748291a0b5c7d8e9f1a2b3c4d5e6f7a8b9c0d1e2f',
        type: 'Beli Fraksi',
        description: 'Pembelian Awal 10 Fraksi (0.010 ETH)',
        timestamp: Date.now() - 3600000,
        status: 'Sukses'
      }
    ];
  });

  const addTransaction = (tx) => {
    setTransactions((prev) => {
      const updated = [tx, ...prev];
      try {
        localStorage.setItem('rwa_tx_history', JSON.stringify(updated));
      } catch (e) {
        console.error('Gagal menyimpan localStorage:', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('rwa_tx_history');
    } catch (e) {
      console.error(e);
    }
    setTransactions([]);
  };

  // Handler koneksi dompet pada mode Mock Frontend
  const handleConnectWallet = () => {
    alert("ℹ️ Mode Mock Frontend:\nFitur Connect Wallet (MetaMask) dinonaktifkan pada tahap ini.\nSeluruh data dan transaksi saat ini berjalan dalam mode simulasi (mock).");
  };

  // Simulasi investasi pembelian fraksi
  const handleInvest = (quantity) => {
    if (quantity > availableFractions) {
      setTxStatus({
        type: 'error',
        message: 'Gagal: Jumlah pembelian melebihi sisa kuota fraksi yang tersedia!'
      });
      return;
    }

    setIsTransacting(true);
    setTxStatus({
      type: 'info',
      message: 'Simulasi: Memproses pengiriman transaksi investasi di Arbitrum Sepolia...'
    });
    setTxHash(null);

    setTimeout(() => {
      setIsTransacting(false);
      setAvailableFractions((prev) => Math.max(0, prev - quantity));
      setMyFractions((prev) => prev + quantity);

      const mockHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setTxHash(mockHash);

      addTransaction({
        hash: mockHash,
        type: 'Beli Fraksi',
        description: `Pembelian ${quantity} Lembar Fraksi (${(quantity * 0.001).toFixed(3)} ETH)`,
        timestamp: Date.now(),
        status: 'Sukses'
      });

      setTxStatus({
        type: 'success',
        message: `Simulasi Berhasil: Sukses membeli ${quantity} fraksi kepemilikan ${propertyName}!`
      });
    }, 1000);
  };

  return (
    <div className="app-container">
      {/* Header & Status Jaringan */}
      <Navbar
        account={account}
        onConnect={handleConnectWallet}
        isConnecting={false}
        connectError={null}
        onDismissConnectError={() => {}}
      />

      <main style={{ marginTop: '24px' }}>
        <div className="grid-dashboard">
          {/* Kolom Kiri: Kartu Aset & Portofolio Investor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <PropertyCard
              propertyName={propertyName}
              symbol={symbol}
              availableFractions={availableFractions}
              totalFractions={totalFractions}
              priceEth={priceEth}
              documentURI={documentURI}
            />

            <InvestorPortfolio
              myFractions={myFractions}
              priceEth={priceEth}
              cooldownSeconds={cooldownSeconds}
            />
          </div>

          {/* Kolom Kanan: Form Transaksi Beli Fraksi */}
          <div>
            <InvestBox
              priceEth={priceEth}
              availableFractions={availableFractions}
              cooldownSeconds={cooldownSeconds}
              onInvest={handleInvest}
              isTransacting={isTransacting}
              txStatus={txStatus}
              txHash={txHash}
            />
          </div>
        </div>

        {/* Riwayat Transaksi Lokal */}
        <TransactionHistory
          transactions={transactions}
          onClear={handleClearHistory}
        />
      </main>
    </div>
  );
}
