// =============================================================================
// FILE: src/App.jsx
// DESKRIPSI: Komponen Utama (Pusat Otak, State Management, & Controller dApp)
// =============================================================================
// Di arsitektur React, file ini menerapkan pola "Lifting State Up":
// Semua data penting (nama properti, harga, kuota, akun pengguna, riwayat transaksi)
// dikelola secara terpusat di sini, lalu dialirkan ke bawah menuju komponen-komponen
// anak (Navbar, PropertyCard, dll) melalui mekanisme Props.
// =============================================================================

// 1. IMPORT DEPENDENSI & KOMPONEN
// Mengimpor hook React untuk manajemen state, kelima komponen anak, dan stylesheet.
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PropertyCard from './components/PropertyCard';
import InvestorPortfolio from './components/InvestorPortfolio';
import InvestBox from './components/InvestBox';
import TransactionHistory from './components/TransactionHistory';
import './App.css';

export default function App() {
  // ---------------------------------------------------------------------------
  // 2. DEKLARASI STATE METADATA PROPERTI (ASET RWA)
  // ---------------------------------------------------------------------------
  // Catatan Edukasi: Nilai awal sengaja diisi dengan data default (Mock Data)
  // agar saat aplikasi pertama kali dijalankan di `localhost:5173`, tampilan dashboard
  // langsung rapi, estetik, dan siap dipresentasikan.
  // Saat integrasi on-chain diaktifkan, nilai-nilai ini akan otomatis ditimpa
  // oleh data riil yang dibaca dari smart contract Arbitrum Sepolia!
  // ---------------------------------------------------------------------------
  const [propertyName, setPropertyName] = useState('Bali Sunset Villa #01');
  const [symbol, setSymbol] = useState('VILLA-BALI-01');
  const [documentURI, setDocumentURI] = useState('ipfs://bafybeiexwukp7b44s42dk7fjybeduq4teqganfsmndrpxmr6im32meru3i');
  const [totalFractions, setTotalFractions] = useState(1000);
  const [availableFractions, setAvailableFractions] = useState(990);
  const [priceEth, setPriceEth] = useState('0.001');

  // ---------------------------------------------------------------------------
  // 3. DEKLARASI STATE AKUN INVESTOR
  // ---------------------------------------------------------------------------
  // • account: Alamat dompet MetaMask pengguna (null = belum terhubung).
  // • myFractions: Jumlah lembar kepemilikan unit fraksi milik investor aktif.
  // • cooldownSeconds: Sisa waktu jeda anti-spam (0 = siap melakukan transaksi).
  // ---------------------------------------------------------------------------
  const [account, setAccount] = useState(null);
  const [myFractions, setMyFractions] = useState(10);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Hook timer hitung mundur otomatis untuk periode cooldown anti-spam
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // ---------------------------------------------------------------------------
  // 4. DEKLARASI STATE STATUS TRANSAKSI & FEEDBACK UI
  // ---------------------------------------------------------------------------
  // • isTransacting: Boolean penanda transaksi sedang dikirim ke sequencer Arbitrum.
  // • txStatus: Objek pesan status { type: 'success'|'error'|'info', message: string }.
  // • txHash: Hash transaksi heksadesimal untuk tautan pelacakan ke Arbiscan Sepolia.
  // ---------------------------------------------------------------------------
  const [isTransacting, setIsTransacting] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);

  // ---------------------------------------------------------------------------
  // 5. DEKLARASI STATE RIWAYAT TRANSAKSI DENGAN LOCALSTORAGE PERSISTENCE
  // ---------------------------------------------------------------------------
  // Pola "Lazy Initial State": Menggunakan fungsi callback di dalam `useState(() => ...)`
  // agar pembacaan memori LocalStorage peramban hanya dilakukan 1x saat aplikasi pertama
  // kali dimuat, bukan pada setiap kali komponen re-render.
  // ---------------------------------------------------------------------------
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('rwa_tx_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Gagal membaca localStorage:', e);
    }
    // Data transaksi contoh awal (Sample fallback):
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

  // ---------------------------------------------------------------------------
  // 6. HELPER FUNGSI: Menambah & Menyimpan Transaksi ke LocalStorage
  // ---------------------------------------------------------------------------
  const addTransaction = (tx) => {
    setTransactions((prev) => {
      const updated = [tx, ...prev]; // Transaksi baru ditaruh di urutan paling atas
      try {
        localStorage.setItem('rwa_tx_history', JSON.stringify(updated));
      } catch (e) {
        console.error('Gagal menyimpan localStorage:', e);
      }
      return updated;
    });
  };

  // Helper fungsi untuk menghapus seluruh riwayat lokal
  const handleClearHistory = () => {
    try {
      localStorage.removeItem('rwa_tx_history');
    } catch (e) {
      console.error(e);
    }
    setTransactions([]);
  };

  // ---------------------------------------------------------------------------
  // 7. HANDLER KONEKSI DOMPET (PADA MODE MOCK TEMPLATE)
  // ---------------------------------------------------------------------------
  // Pada tahap template ini, tombol Connect Wallet menampilkan pop-up panduan simulasi.
  // 👉 Untuk menggantinya dengan koneksi MetaMask asli & auto-switch ke Arbitrum Sepolia,
  //    silakan ikuti Langkah 3.4 pada file `PANDUAN-INTEGRASI-ONCHAIN.md`!
  // ---------------------------------------------------------------------------
  const handleConnectWallet = () => {
    alert(
      "ℹ️ Mode Mock Frontend:\n" +
      "Fitur Connect Wallet (MetaMask) dinonaktifkan pada template awal ini.\n" +
      "Seluruh data dan transaksi saat ini berjalan dalam mode simulasi lokal.\n\n" +
      "Ikuti panduan di PANDUAN-INTEGRASI-ONCHAIN.md untuk menghubungkannya ke MetaMask & Smart Contract riil!"
    );
  };

  // ---------------------------------------------------------------------------
  // 8. HANDLER TRANSAKSI INVESTASI PEMBELIAN FRAKSI (PADA MODE MOCK TEMPLATE)
  // ---------------------------------------------------------------------------
  // Menyimulasikan alur transaksi on-chain:
  // 1. Memvalidasi ketersediaan kuota fraksi.
  // 2. Mengaktifkan status loading (isTransacting = true).
  // 3. Menunggu jeda waktu (setTimeout 1 detik) seolah memproses blok di blockchain.
  // 4. Memotong sisa kuota, menambah saldo unit investor, dan membuat hash transaksi acak.
  // 👉 Untuk menggantinya dengan transaksi on-chain riil via Smart Contract `buyFractions()`,
  //    silakan ikuti Langkah 3.6 pada file `PANDUAN-INTEGRASI-ONCHAIN.md`!
  // ---------------------------------------------------------------------------
  const handleInvest = (quantity) => {
    // 1. Validasi Periode Cooldown Anti-Spam
    if (cooldownSeconds > 0) {
      setTxStatus({
        type: 'error',
        message: `Revert Cooldown: Harap tunggu periode cooldown selesai (${cooldownSeconds} detik lagi)!`
      });
      return;
    }

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

    // Simulasi waktu tunggu sequencer Layer-2 Arbitrum (~1 detik)
    setTimeout(() => {
      setIsTransacting(false);
      setAvailableFractions((prev) => Math.max(0, prev - quantity));
      setMyFractions((prev) => prev + quantity);

      // Aktifkan periode cooldown 10 detik setelah transaksi berhasil
      setCooldownSeconds(10);

      // Membuat hash transaksi tiruan sepanjang 64 karakter heksadesimal
      const mockHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setTxHash(mockHash);

      // Catat ke riwayat transaksi lokal
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

  // ---------------------------------------------------------------------------
  // 9. TATA LETAK JSX (RETURN UI)
  // ---------------------------------------------------------------------------
  return (
    <div className="app-container">
      {/* HEADER & STATUS JARINGAN (Navbar) */}
      <Navbar
        account={account}
        onConnect={handleConnectWallet}
        isConnecting={false}
        connectError={null}
        onDismissConnectError={() => {}}
      />

      <main style={{ marginTop: '24px' }}>
        <div className="grid-dashboard">
          {/* KOLOM KIRI: Kartu Detail Aset Properti & Portofolio Kepemilikan Investor */}
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

          {/* KOLOM KANAN: Formulir Pembelian Unit Fraksi (InvestBox) */}
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

        {/* BAGIAN BAWAH: Tabel Riwayat Transaksi Persisten (Arbiscan Proof) */}
        <TransactionHistory
          transactions={transactions}
          onClearHistory={handleClearHistory}
        />
      </main>
    </div>
  );
}
