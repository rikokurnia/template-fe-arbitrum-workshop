import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Navbar from './components/Navbar';
import PropertyCard from './components/PropertyCard';
import InvestorPortfolio from './components/InvestorPortfolio';
import InvestBox from './components/InvestBox';
import IssuerPanel from './components/IssuerPanel';
import TransactionHistory from './components/TransactionHistory';
import {
  PROPERTY_CONTRACT_ADDRESS,
  FRACTIONAL_PROPERTY_ABI,
  ARBITRUM_SEPOLIA_HEX_ID,
  ARBITRUM_SEPOLIA_NETWORK_PARAMS
} from './constants/contract';
import './App.css';

// Endpoint RPC teruji bebas isu CORS / 429 duplicate headers
const PUBLIC_RPC_ENDPOINT = "https://arbitrum-sepolia-rpc.publicnode.com";

// -------------------------------------------------------------
// EIP-6963: Multi-Injected Provider Discovery
// Standar resmi Ethereum untuk mendeteksi semua dompet yang terpasang
// (MetaMask, Rabby, Coinbase, Brave, dll.) bahkan ketika satu dompet
// (seperti Rabby Wallet) membajak objek window.ethereum.
// -------------------------------------------------------------
const eip6963Providers = [];

if (typeof window !== 'undefined') {
  window.addEventListener('eip6963:announceProvider', (event) => {
    if (event.detail && event.detail.provider) {
      const exists = eip6963Providers.some((p) => p.info.uuid === event.detail.info.uuid);
      if (!exists) {
        eip6963Providers.push(event.detail);
        console.log('[EIP-6963] Wallet terdeteksi:', event.detail.info.name, `(${event.detail.info.rdns})`);
      }
    }
  });
  window.dispatchEvent(new Event('eip6963:requestProvider'));
}

// Helper untuk memilih provider dompet terbaik yang tersedia
const getInjectedProvider = () => {
  if (typeof window === 'undefined') return undefined;

  // 1. Cek EIP-6963: Cari MetaMask secara spesifik
  const metaMaskEip = eip6963Providers.find(
    (p) => p.info?.rdns === 'io.metamask' || p.info?.name?.toLowerCase().includes('metamask')
  );
  if (metaMaskEip?.provider) {
    return metaMaskEip.provider;
  }

  const eth = window.ethereum;
  if (!eth) return undefined;

  const list = Array.isArray(eth.providers) ? eth.providers : [eth];

  // 2. Cari MetaMask asli dalam list providers (tanpa flag Rabby / dompet lain)
  const realMetaMask = list.find(
    (p) => p && p.request && p.isMetaMask && !p.isRabby && !p.isBraveWallet && !p.isCoinbaseWallet
  );
  if (realMetaMask) return realMetaMask;

  // 3. Jika ada provider lain dalam list yang BUKAN Rabby, gunakan itu
  const nonRabby = list.find((p) => p && p.request && !p.isRabby);
  if (nonRabby) return nonRabby;

  // 4. Jika ada provider lain dari EIP-6963
  if (eip6963Providers.length > 0) {
    return eip6963Providers[0].provider;
  }

  // 5. Fallback ke window.ethereum (bisa berupa Rabby jika hanya Rabby yang terpasang)
  return eth.request ? eth : undefined;
};

export default function App() {
  // -------------------------------------------------------------
  // STATE MANAGEMENT dApp
  // Nilai awal disiapkan agar overview UI langsung tampil prima
  // -------------------------------------------------------------
  const [account, setAccount] = useState(null);
  const [propertyName, setPropertyName] = useState('Bali Sunset Villa #01');
  const [symbol, setSymbol] = useState('VILLA-BALI-01');
  // Default CID resmi workshop (peserta tidak perlu repot upload manual ke IPFS)
  const [documentURI, setDocumentURI] = useState('ipfs://bafybeiexwukp7b44s42dk7fjybeduq4teqganfsmndrpxmr6im32meru3i');
  const [totalFractions, setTotalFractions] = useState(1000);
  const [availableFractions, setAvailableFractions] = useState(990);
  const [priceEth, setPriceEth] = useState('0.001');
  const [rawPriceWei, setRawPriceWei] = useState(ethers.parseEther('0.001'));
  const [myFractions, setMyFractions] = useState(10);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isOwner, setIsOwner] = useState(true); // Default true agar Issuer Dashboard tampak di overview

  const [isConnecting, setIsConnecting] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  // Pesan error koneksi dompet yang tampil sebagai banner (null = tidak ada error)
  const [connectError, setConnectError] = useState(null);

  // Menerjemahkan error provider (MetaMask/Rabby/RPC) menjadi solusi konkret
  const parseConnectError = (err, provider) => {
    const msg = err?.message || err?.info?.error?.message || "";
    const code = err?.code || err?.info?.error?.code;

    // Error spesifik: "wallet must has at least one account" (Error khas Rabby Wallet saat kosong/terkunci)
    if (/wallet must has at least one account|at least one account/i.test(msg) || (provider?.isRabby && code === 4001)) {
      return (
        "⚠️ Terdeteksi Rabby Wallet di browser, namun belum ada akun aktif di Rabby (atau Rabby membajak MetaMask).\n\n" +
        "👉 Jika Anda ingin menggunakan MetaMask:\n" +
        "Buka ekstensi Rabby Wallet di browser Anda, lalu klik ikon tombol/switch 'Flip to MetaMask' di kanan atas pop-up Rabby agar dApp bisa terhubung langsung ke MetaMask Anda.\n\n" +
        "👉 Jika Anda ingin menggunakan Rabby Wallet:\n" +
        "Buka Rabby Wallet dan buat/impor minimal 1 akun terlebih dahulu, lalu klik tombol Connect Wallet lagi."
      );
    }

    if (code === -32002 || /already pending/i.test(msg)) {
      return "Permintaan koneksi sudah dikirim — buka ekstensi dompet Anda (MetaMask/Rabby) dan setujui permintaannya di sana.";
    }

    if (code === 4001 || /user rejected|denied/i.test(msg)) {
      return "Koneksi dibatalkan di dompet pengguna. Tekan Connect Wallet lalu setujui permintaannya.";
    }

    if (/unauthorized|locked|no accounts/i.test(msg)) {
      return "Dompet terkunci atau belum memiliki akun aktif. Buka dompet Anda, login/unlock, pastikan ada minimal 1 akun, lalu tekan Connect Wallet lagi.";
    }

    return `Koneksi dompet gagal: ${msg || "Pastikan dompet Anda terpasang, tidak terkunci, dan berada di jaringan Arbitrum Sepolia."}`;
  };

  // -------------------------------------------------------------
  // RIWAYAT TRANSAKSI ON-CHAIN DENGAN LOCALSTORAGE PERSISTENCE
  // -------------------------------------------------------------
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('rwa_tx_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Gagal memuat riwayat transaksi dari localStorage:', e);
    }
    // Riwayat transaksi sampel bawaan untuk visualisasi instan
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

  const addTransaction = useCallback((tx) => {
    setTransactions((prev) => {
      const updated = [tx, ...prev];
      try {
        localStorage.setItem('rwa_tx_history', JSON.stringify(updated));
      } catch (e) {
        console.error('Gagal menyimpan transaksi ke localStorage:', e);
      }
      return updated;
    });
  }, []);

  const handleClearHistory = useCallback(() => {
    try {
      localStorage.removeItem('rwa_tx_history');
    } catch (e) {
      console.error('Gagal membersihkan localStorage:', e);
    }
    setTransactions([]);
  }, []);

  const isContractConfigured = PROPERTY_CONTRACT_ADDRESS && PROPERTY_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

  // -------------------------------------------------------------
  // FUNGSI SWITCH / ADD NETWORK ARBITRUM SEPOLIA (EIP-3085)
  // -------------------------------------------------------------
  const ensureArbitrumNetwork = async (targetProvider) => {
    const prov = targetProvider || getInjectedProvider() || (typeof window !== 'undefined' ? window.ethereum : null);
    if (!prov?.request) return;

    try {
      await prov.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARBITRUM_SEPOLIA_HEX_ID }],
      });
    } catch (error) {
      if (error.code === 4902 || error.code === -32603) {
        await prov.request({
          method: 'wallet_addEthereumChain',
          params: [ARBITRUM_SEPOLIA_NETWORK_PARAMS],
        });
      } else {
        throw error;
      }
    }
  };

  // -------------------------------------------------------------
  // FUNGSI MEMBACA STATE DARI ARBITRUM SEPOLIA (READ CALLS)
  // Menggunakan provider RPC publik (publicnode) yang bebas limit CORS
  // -------------------------------------------------------------
  const fetchBlockchainData = useCallback(async (currentAddr) => {
    if (!isContractConfigured) return;

    try {
      const readProvider = new ethers.JsonRpcProvider(PUBLIC_RPC_ENDPOINT);
      const contract = new ethers.Contract(
        PROPERTY_CONTRACT_ADDRESS,
        FRACTIONAL_PROPERTY_ABI,
        readProvider
      );

      // Baca metadata properti umum
      const [name, sym, docURI, rawPrice, total, available, ownerAddr] = await Promise.all([
        contract.propertyName(),
        contract.propertySymbol(),
        contract.propertyDocumentURI(),
        contract.fractionPrice(),
        contract.totalFractions(),
        contract.availableFractions(),
        contract.owner()
      ]);

      setPropertyName(name);
      setSymbol(sym);
      setDocumentURI(docURI);
      setRawPriceWei(rawPrice);
      setPriceEth(ethers.formatEther(rawPrice));
      setTotalFractions(Number(total));
      setAvailableFractions(Number(available));

      // Baca data akun investor jika ada alamat yang terhubung
      if (currentAddr) {
        const [bal, lastBuy, cooldownPeriod] = await Promise.all([
          contract.getInvestorFractions(currentAddr),
          contract.lastInvestmentTime(currentAddr),
          contract.COOLDOWN_PERIOD()
        ]);

        setMyFractions(Number(bal));
        setIsOwner(currentAddr.toLowerCase() === ownerAddr.toLowerCase());

        // Hitung sisa waktu cooldown anti-spam
        const currentBlockTime = Math.floor(Date.now() / 1000);
        const elapsed = currentBlockTime - Number(lastBuy);
        const remaining = Math.max(0, Number(cooldownPeriod) - elapsed);
        setCooldownSeconds(remaining);
      } else {
        setMyFractions(0);
        setIsOwner(false);
        setCooldownSeconds(0);
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data on-chain Arbitrum:", err);
    }
  }, [isContractConfigured]);

  // -------------------------------------------------------------
  // KONEKSI WALLET
  // -------------------------------------------------------------
  const handleConnectWallet = async () => {
    // Minta ulang pengumuman EIP-6963 untuk mendeteksi provider yang baru dimuat
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('eip6963:requestProvider'));
    }

    const provider = getInjectedProvider();

    if (!provider) {
      alert("Silakan instal ekstensi MetaMask untuk berinvestasi!");
      return;
    }

    try {
      setIsConnecting(true);
      setConnectError(null);

      console.log("[RWA connect] Menggunakan provider:", {
        isMetaMask: !!provider.isMetaMask,
        isRabby: !!provider.isRabby,
        isBraveWallet: !!provider.isBraveWallet,
        isCoinbaseWallet: !!provider.isCoinbaseWallet,
        providersCount: Array.isArray(window.ethereum?.providers) ? window.ethereum.providers.length : 1,
        eipCount: eip6963Providers.length,
        eipNames: eip6963Providers.map((p) => p.info.name),
      });

      // LANGKAH 1: Minta akun terlebih dahulu (eth_requestAccounts)!
      // Jangan pernah switch network sebelum akun terhubung, karena wallet (Rabby / MetaMask terkunci)
      // akan melempar error jika belum diotorisasi.
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        const connectedAccount = accounts[0];
        setAccount(connectedAccount);

        // LANGKAH 2: Setelah akun terhubung, pastikan jaringan berada di Arbitrum Sepolia
        try {
          const currentChain = await provider.request({ method: 'eth_chainId' });
          if (currentChain !== ARBITRUM_SEPOLIA_HEX_ID) {
            await ensureArbitrumNetwork(provider);
          }
        } catch (switchErr) {
          console.warn("Peringatan switch jaringan:", switchErr);
          if (switchErr.code === 4001) {
            setConnectError("Anda membatalkan pergantian jaringan ke Arbitrum Sepolia. Harap beralih jaringan di dompet Anda.");
          }
        }

        // LANGKAH 3: Ambil data blockchain on-chain untuk akun yang aktif
        if (isContractConfigured) {
          await fetchBlockchainData(connectedAccount);
        }
      } else {
        setConnectError("Dompet tidak mengembalikan akun. Buka dompet Anda, login/unlock, pastikan ada minimal 1 akun, lalu tekan Connect Wallet lagi.");
      }
    } catch (err) {
      console.error("Koneksi dompet gagal:", err);
      setConnectError(parseConnectError(err, provider));
    } finally {
      setIsConnecting(false);
    }
  };

  // -------------------------------------------------------------
  // TRANSAKSI INVESTASI PEMBELIAN FRAKSI (WRITE CALL)
  // -------------------------------------------------------------
  const handleInvest = async (quantity) => {
    if (!account) {
      alert("Harap hubungkan dompet MetaMask terlebih dahulu!");
      return;
    }

    if (!isContractConfigured) {
      // Simulasi interaktif jika belum deploy kontrak
      setIsTransacting(true);
      setTxStatus({ type: 'info', message: 'Simulasi pengiriman transaksi investasi ke Arbitrum Sepolia...' });
      setTimeout(() => {
        setIsTransacting(false);
        setAvailableFractions((prev) => Math.max(0, prev - quantity));
        setMyFractions((prev) => prev + quantity);
        setCooldownSeconds(10);
        addTransaction({
          hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
          type: 'Beli Fraksi',
          description: `Pembelian ${quantity} Lembar Fraksi (${(quantity * Number(priceEth)).toFixed(3)} ETH)`,
          timestamp: Date.now(),
          status: 'Sukses'
        });
        setTxStatus({
          type: 'success',
          message: `Sukses membeli ${quantity} lembar fraksi! (Simulasi Mode - Isi alamat kontrak di contract.js untuk live on-chain).`
        });
      }, 1200);
      return;
    }

    try {
      setIsTransacting(true);
      setTxStatus({ type: 'info', message: 'Konfirmasi transaksi investasi di dompet Anda...' });
      setTxHash(null);

      const activeProvider = getInjectedProvider() || window.ethereum;
      const provider = new ethers.BrowserProvider(activeProvider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        PROPERTY_CONTRACT_ADDRESS,
        FRACTIONAL_PROPERTY_ABI,
        signer
      );

      // Hitung total Wei yang wajib dikirim (0.001 ETH per fraksi)
      const unitPriceWei = rawPriceWei ? BigInt(rawPriceWei) : ethers.parseEther(priceEth || '0.001');
      const totalWei = BigInt(quantity) * unitPriceWei;

      console.log(`[RWA Invest] Membeli ${quantity} fraksi, total: ${ethers.formatEther(totalWei)} ETH (${totalWei.toString()} Wei)`);

      // Eksekusi fungsi buyFractions payable dengan gasLimit eksplisit
      // Memberikan gasLimit eksplisit mencegah kegagalan estimateGas jika RPC rate-limit / lambat
      const tx = await contract.buyFractions(quantity, {
        value: totalWei,
        gasLimit: 350000n
      });

      setTxHash(tx.hash);
      setTxStatus({
        type: 'info',
        message: 'Transaksi dikirim. Menunggu konfirmasi jaringan Arbitrum...'
      });

      // Tunggu konfirmasi blok (~250ms - 1 detik)
      await tx.wait();

      // Catat ke riwayat transaksi on-chain lokal
      addTransaction({
        hash: tx.hash,
        type: 'Beli Fraksi',
        description: `Pembelian ${quantity} Lembar Fraksi (${ethers.formatEther(totalWei)} ETH)`,
        timestamp: Date.now(),
        status: 'Sukses'
      });

      setTxStatus({
        type: 'success',
        message: `Sukses membeli ${quantity} lembar fraksi! Kepemilikan Anda telah resmi tercatat di Arbitrum Sepolia.`
      });

      // Segarkan state on-chain
      await fetchBlockchainData(account);

    } catch (error) {
      console.error("Gagal melakukan pembelian fraksi:", error);
      const rawMsg =
        error?.reason ||
        error?.info?.error?.message ||
        error?.shortMessage ||
        error?.message ||
        "";
      let message = "Transaksi dibatalkan atau gagal.";
      if (error?.code === "ACTION_REJECTED" || /user (rejected|denied)/i.test(rawMsg)) {
        message = "Transaksi dibatalkan di dompet pengguna.";
      } else if (/cooldown/i.test(rawMsg)) {
        message = "Gagal: Cooldown masih aktif. Silakan tunggu beberapa detik.";
      } else if (/lebih dari 0/i.test(rawMsg)) {
        message = "Gagal: Jumlah pembelian harus lebih dari 0.";
      } else if (/tidak mencukupi/i.test(rawMsg)) {
        message = "Gagal: Sisa kuota fraksi properti tidak mencukupi.";
      } else if (/kurang|insufficient funds/i.test(rawMsg)) {
        message = "Gagal: Saldo ETH tidak mencukupi untuk harga fraksi + gas fee.";
      } else if (error?.reason) {
        message = `Gagal: ${error.reason}`;
      }
      setTxStatus({ type: 'error', message });
    } finally {
      setIsTransacting(false);
    }
  };

  // -------------------------------------------------------------
  // RESTOCK FRAKSI PROPERTI (KHUSUS OWNER)
  // -------------------------------------------------------------
  const handleRestock = async (amount) => {
    if (!isContractConfigured) {
      setAvailableFractions((prev) => prev + amount);
      setTotalFractions((prev) => prev + amount);
      const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      addTransaction({
        hash: mockHash,
        type: 'Restock Kuota',
        description: `Penambahan Kuota ${amount} Fraksi`,
        timestamp: Date.now(),
        status: 'Sukses'
      });
      alert(`Simulasi: Berhasil menambah kuota penawaran sebanyak ${amount} fraksi!`);
      return;
    }

    try {
      setIsTransacting(true);
      const activeProvider = getInjectedProvider() || window.ethereum;
      const provider = new ethers.BrowserProvider(activeProvider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        PROPERTY_CONTRACT_ADDRESS,
        FRACTIONAL_PROPERTY_ABI,
        signer
      );

      const tx = await contract.restockFractions(amount, {
        gasLimit: 250000n
      });
      await tx.wait();

      addTransaction({
        hash: tx.hash,
        type: 'Restock Kuota',
        description: `Penambahan Kuota ${amount} Fraksi`,
        timestamp: Date.now(),
        status: 'Sukses'
      });

      alert(`Berhasil menambah kuota penawaran sebanyak ${amount} fraksi!`);
      await fetchBlockchainData(account);
    } catch (err) {
      console.error("Gagal restock fraksi:", err);
      alert("Gagal menambah kuota fraksi.");
    } finally {
      setIsTransacting(false);
    }
  };

  // -------------------------------------------------------------
  // WITHDRAW HASIL INVESTASI ETH (KHUSUS OWNER)
  // -------------------------------------------------------------
  const handleWithdraw = async () => {
    if (!isContractConfigured) {
      const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      addTransaction({
        hash: mockHash,
        type: 'Tarik Modal',
        description: 'Penarikan Seluruh Saldo Modal ETH',
        timestamp: Date.now(),
        status: 'Sukses'
      });
      alert("Simulasi: Seluruh modal investasi ETH berhasil ditarik ke dompet pengelola!");
      return;
    }

    try {
      setIsTransacting(true);
      const activeProvider = getInjectedProvider() || window.ethereum;
      const provider = new ethers.BrowserProvider(activeProvider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        PROPERTY_CONTRACT_ADDRESS,
        FRACTIONAL_PROPERTY_ABI,
        signer
      );

      const tx = await contract.withdrawFunds({
        gasLimit: 250000n
      });
      await tx.wait();

      addTransaction({
        hash: tx.hash,
        type: 'Tarik Modal',
        description: 'Penarikan Seluruh Saldo Modal ETH',
        timestamp: Date.now(),
        status: 'Sukses'
      });

      alert("Seluruh modal investasi ETH berhasil dicairkan ke dompet pengelola!");
      await fetchBlockchainData(account);
    } catch (err) {
      console.error("Gagal menarik dana investasi:", err);
      alert("Gagal menarik dana.");
    } finally {
      setIsTransacting(false);
    }
  };

  // -------------------------------------------------------------
  // SINKRONISASI AKUN & POLLING BERKALA DATA ON-CHAIN
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isContractConfigured) return;

    // Ambil data properti on-chain secara instan
    fetchBlockchainData(account);

    const injected = getInjectedProvider() || (typeof window !== 'undefined' ? window.ethereum : null);

    const handleAccountsChanged = (accounts) => {
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        fetchBlockchainData(accounts[0]);
      } else {
        setAccount(null);
        fetchBlockchainData(null);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (injected?.on) {
      injected.on('accountsChanged', handleAccountsChanged);
      injected.on('chainChanged', handleChainChanged);
    }

    // Polling data on-chain ringan setiap 15 detik (tanpa eth_getLogs berat)
    // agar data kuota dan saldo selalu up-to-date tanpa memicu 429 rate-limit
    const pollInterval = setInterval(() => {
      fetchBlockchainData(account);
    }, 15000);

    return () => {
      if (injected?.removeListener) {
        injected.removeListener('accountsChanged', handleAccountsChanged);
        injected.removeListener('chainChanged', handleChainChanged);
      }
      clearInterval(pollInterval);
    };
  }, [account, fetchBlockchainData, isContractConfigured]);

  // Timer cooldown lokal di antarmuka
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  return (
    <div className="app-container">
      {/* 1. Header & Wallet Status */}
      <Navbar
        account={account}
        onConnect={handleConnectWallet}
        isConnecting={isConnecting}
        connectError={connectError}
        onDismissConnectError={() => setConnectError(null)}
      />

      <main style={{ marginTop: '24px' }}>
        {/* Banner Status Konfigurasi Kontrak */}
        {!isContractConfigured && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid var(--accent-gold)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: 'var(--accent-gold)',
            fontSize: '0.85rem'
          }}>
            ⚠️ <strong>Perhatian:</strong> Alamat kontrak masih berupa placeholder. Masukkan alamat kontrak hasil deploy Arbitrum Sepolia Anda pada <code>src/constants/contract.js</code> untuk menghubungkan transaksi nyata!
          </div>
        )}

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
              account={account}
            />
          </div>

          {/* Kolom Kanan: Form Transaksi Beli Fraksi */}
          <div>
            <InvestBox
              priceEth={priceEth}
              availableFractions={availableFractions}
              cooldownSeconds={cooldownSeconds}
              account={account}
              onInvest={handleInvest}
              isTransacting={isTransacting}
              txStatus={txStatus}
              txHash={txHash}
            />
          </div>
        </div>

        {/* Panel Administratif Khusus Pengelola Aset (Owner) */}
        <IssuerPanel
          isOwner={isOwner}
          onRestock={handleRestock}
          onWithdraw={handleWithdraw}
          isTransacting={isTransacting}
        />

        {/* Riwayat Transaksi On-Chain Lokal */}
        <TransactionHistory
          transactions={transactions}
          onClear={handleClearHistory}
        />
      </main>
    </div>
  );
}
