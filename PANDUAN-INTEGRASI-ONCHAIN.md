# 📘 Panduan Integrasi: Mock Frontend ke Full On-Chain RWA (Arbitrum Sepolia)

Dokumen ini adalah panduan praktis langkah-demi-langkah bagi mentor dan peserta workshop untuk mengubah proyek frontend statis (**Mock Mode**) menjadi aplikasi terdesentralisasi (**Full On-Chain dApp**) yang terhubung langsung ke smart contract di jaringan **Arbitrum Sepolia**.

---

## 🗺️ Alur Kerja Singkat (Roadmap)

```text
[1. Deploy Contract di Remix] ➡️ [2. Pasang CA & ABI di contract.js] ➡️ [3. Hubungkan Ethers di App.jsx]
                                                                                   ⬇️
[6. Audit Dokumen IPFS di Arbiscan] ⬅️ [5. Verify Source Code (Centang Hijau)] ⬅️ [4. Eksekusi Transaksi di Localhost]
```

### 📌 Cheatsheet Ringkasan: Apa yang Diganti, Dihapus & Dimasukkan (Langkah 2 - 5)

| Langkah | Lokasi File / Bagian | ✏️ Yang Diganti / ❌ Dihapus | ➕ Yang Dimasukkan / Ditambahkan |
| :--- | :--- | :--- | :--- |
| **Langkah 2** | `src/constants/contract.js` | • Ganti `PROPERTY_CONTRACT_ADDRESS`<br>• Hapus `//` comment pada `FRACTIONAL_PROPERTY_ABI` | • CA hasil deploy Remix<br>• Array JSON ABI dari Remix |
| **Langkah 3.1** | `src/App.jsx` (Header Import) | • Ganti import React sederhana | • Import `useEffect`, `useCallback`, `ethers`<br>• Import konstanta dari `./constants/contract` |
| **Langkah 3.2** | `src/App.jsx` (Deklarasi State) | *(Tidak ada yang dihapus)* | • `const [isConnecting, setIsConnecting] = useState(false);` |
| **Langkah 3.3** | `src/App.jsx` (Fungsi Helper) | *(Tidak ada yang dihapus)* | • Fungsi `getProvider()` (Filter anti-tabrakan MetaMask vs Rabby) |
| **Langkah 3.4** | `src/App.jsx` (Fungsi Connect) | • Hapus alert dummy mock | • Fungsi `ensureArbitrumNetwork()`<br>• `handleConnectWallet` riil via `eth_requestAccounts` |
| **Langkah 3.5** | `src/App.jsx` (Read Data) | *(Tidak ada yang dihapus)* | • Fungsi `fetchBlockchainData` via `useCallback`<br>• Hook `useEffect` untuk fetch otomatis |
| **Langkah 3.6** | `src/App.jsx` (Write Data) | • Hapus simulasi lokal `setTimeout` | • Panggilan riil `contract.buyFractions`<br>• Buffer gas 50% `maxFeePerGas` (Anti-Revert L2) |
| **Langkah 3.7** | `src/App.jsx` (Tag `<Navbar />`) | • Ganti `isConnecting={false}` | • Ubah prop menjadi `isConnecting={isConnecting}` |
| **Langkah 4** | Browser `http://localhost:5173` | • Transaksi mock statis | • Pengujian interaksi wallet riil, sign transaksi ETH, kuota berkurang & saldo bertambah |
| **Langkah 5** | Arbiscan Sepolia Verify | • **HAPUS TOTAL** teks catatan pada kotak *"Constructor Arguments"* | • Paste single-file kode `FractionalProperty.sol` ke kotak kode sumber |

---

## 🛠️ Prasyarat & Persiapan Lingkungan (Tools & Setup)

Sebelum memulai integrasi on-chain, pastikan perangkat dan peralatan berikut telah disiapkan:

### 1. Kebutuhan Perangkat Lunak (Tools):
* **Code Editor**: [Visual Studio Code](https://code.visualstudio.com/) (atau editor teks pilihan Anda).
* **Node.js**: Versi LTS (**v18.x** atau **v20.x+**) beserta `npm`.
  * Verifikasi di terminal: `node -v` dan `npm -v`
* **Browser Web**: Google Chrome, Brave, atau browser berbasis Chromium.
* **Web3 Wallet Extension**:
  * Pasang ekstensi [MetaMask](https://metamask.io/).
  * Pastikan jaringan **Arbitrum Sepolia Testnet** (Chain ID: `421614` / `0x66eee`) siap digunakan.
  * Siapkan saldo testnet ETH Arbitrum Sepolia untuk gas fee (bisa klaim di [Chainlink Faucet](https://faucets.chain.link/arbitrum-sepolia) atau faucet Arbitrum Sepolia lainnya).
  * 💡 *Tips Penting Peserta:* Jika browser sudah memiliki ekstensi dompet lain (seperti Phantom, Rabby, Coinbase Wallet, OKX), disarankan membuat **Profil Browser Baru** khusus workshop yang hanya memasang MetaMask, atau matikan opsi *"Set as default wallet"* pada ekstensi lain agar tidak membajak (*hijack*) objek `window.ethereum`.

---

### 2. Langkah Setup di Terminal:

Buka terminal Anda (atau terminal bawaan VS Code) lalu jalankan perintah berikut secara berurutan:

```bash
# 1. Clone repositori template workshop
git clone https://github.com/rikokurnia/template-fe-arbitrum-workshop.git
cd template-fe-arbitrum-workshop

# 2. Pasang seluruh dependensi proyek (Termasuk Ethers.js)
npm install
```

> ❓ **Apakah kita perlu menjalankan `npm install ethers` lagi secara terpisah?**  
> **Jawabannya: TIDAK PERLU!**  
> Library `ethers` (versi `^6.17.0`) sudah didaftarkan di dalam file `package.json` template ini. Saat kamu mengeksekusi `npm install`, npm secara otomatis mengunduh dan memasang `ethers`, `react`, `lucide-react`, dan semua pustaka pendukung sekaligus.  
> *(Catatan: Perintah `npm install ethers` baru wajib dijalankan jika Anda menginisiasi proyek React kosong dari nol).*

```bash
# 3. Jalankan development server lokal
npm run dev
```

Buka URL **`http://localhost:5173`** di browser. Pada tahap awal ini, web akan berjalan dalam status **Mode Mock Frontend** (siap untuk diintegrasikan ke on-chain mengikuti Langkah 1 s/d 5 di bawah).

---

## 🚀 Langkah 1: Deploy Smart Contract Modern di Remix IDE

1. Buka **[https://remix.ethereum.org](https://remix.ethereum.org)**.
2. Di dalam folder `contracts/`, buat file baru bernama **`FractionalProperty.sol`**.
3. Gunakan kode Solidity modern berikut yang sudah bebas dari *warning deprecation* `.transfer()`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FractionalProperty (Bali Sunset Villa #01)
 * @notice Smart Contract Real World Asset (RWA) untuk tokenisasi properti fraksional di Arbitrum Sepolia.
 */
contract FractionalProperty {
    string public propertyName;
    string public propertySymbol;
    string public propertyDocumentURI;

    address public owner;
    uint256 public fractionPrice;
    uint256 public totalFractions;
    uint256 public availableFractions;

    mapping(address => uint256) public fractionBalances;
    mapping(address => uint256) public lastInvestmentTime;
    uint256 public constant COOLDOWN_PERIOD = 10 seconds;

    event FractionPurchased(
        address indexed investor,
        uint256 amount,
        uint256 totalCost,
        uint256 remainingFractions,
        uint256 timestamp
    );

    event FractionsRestocked(
        uint256 additionalFractions,
        uint256 newAvailableFractions,
        uint256 timestamp
    );

    event FundsWithdrawn(
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Akses ditolak: Hanya pengelola properti yang berhak!");
        _;
    }

    constructor() {
        propertyName = "Bali Sunset Villa #01";
        propertySymbol = "VILLA-BALI-01";
        propertyDocumentURI = "ipfs://bafybeiexwukp7b44s42dk7fjybeduq4teqganfsmndrpxmr6im32meru3i";

        owner = msg.sender;
        fractionPrice = 0.001 ether; // 0.001 ETH per lembar fraksi
        totalFractions = 1000;
        availableFractions = 1000;
    }

    function buyFractions(uint256 _amount) public payable {
        require(_amount > 0, "Jumlah pembelian fraksi harus lebih dari 0!");
        require(_amount <= availableFractions, "Sisa kuota fraksi properti tidak mencukupi!");

        uint256 totalCost = _amount * fractionPrice;
        require(msg.value >= totalCost, "Pembayaran ETH yang dikirim kurang!");

        require(
            block.timestamp >= lastInvestmentTime[msg.sender] + COOLDOWN_PERIOD,
            "Harap tunggu periode cooldown selesai sebelum melakukan investasi lagi!"
        );

        lastInvestmentTime[msg.sender] = block.timestamp;
        availableFractions -= _amount;
        fractionBalances[msg.sender] += _amount;

        emit FractionPurchased(
            msg.sender,
            _amount,
            totalCost,
            availableFractions,
            block.timestamp
        );

        // Best Practice: Gunakan .call bukan .transfer
        if (msg.value > totalCost) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalCost}("");
            require(refundSuccess, "Pengembalian kelebihan ETH gagal!");
        }
    }

    function getMyFractions() public view returns (uint256) {
        return fractionBalances[msg.sender];
    }

    function getInvestorFractions(address _investor) public view returns (uint256) {
        return fractionBalances[_investor];
    }

    function restockFractions(uint256 _additionalFractions) public onlyOwner {
        require(_additionalFractions > 0, "Jumlah penambahan harus lebih dari 0!");
        availableFractions += _additionalFractions;
        totalFractions += _additionalFractions;
        emit FractionsRestocked(_additionalFractions, availableFractions, block.timestamp);
    }

    function withdrawFunds() public onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "Tidak ada saldo ETH yang dapat ditarik!");

        (bool success, ) = payable(owner).call{value: contractBalance}("");
        require(success, "Penarikan saldo ETH gagal!");

        emit FundsWithdrawn(owner, contractBalance, block.timestamp);
    }
}
```

### Kompilasi & Deploy:
1. Buka tab **Solidity Compiler** ➡️ Pilih versi compiler (misal `0.8.20` atau `0.8.34`) ➡️ Klik **Compile**.
2. Di bagian paling bawah panel compiler, klik tombol **ABI** untuk menyalin JSON ABI kontrak.
3. Buka tab **Deploy & Run Transactions**:
   - Environment: **Injected Provider - MetaMask** (pastikan jaringan Arbitrum Sepolia `421614`).
   - Contract: Pastikan memilih `FractionalProperty`.
   - Klik **Deploy** ➡️ Konfirmasi di MetaMask.
4. Salin **Contract Address (CA)** dari panel bawah *Deployed Contracts*.

---

## ⚙️ Langkah 2: Konfigurasi di `src/constants/contract.js`

> 📍 **Lokasi File**: `src/constants/contract.js`  
> ✏️ **Yang Diganti**: Nilai string `PROPERTY_CONTRACT_ADDRESS` (baris 5)  
> ❌ **Yang Dihapus / Di-uncomment**: Tanda komentar `//` pada `// export const FRACTIONAL_PROPERTY_ABI =` (baris 32)  
> ➕ **Yang Dimasukkan**: Salinan JSON ABI dari Remix ditempelkan ke variabel `FRACTIONAL_PROPERTY_ABI`

```javascript
// 1. ALAMAT SMART CONTRACT RWA
// Ganti alamat placeholder 0x000... dengan Contract Address hasil deploy Anda dari Remix:
export const PROPERTY_CONTRACT_ADDRESS = "0x5b8e4E04568abBFaA3ef8270891686be718f9c39"; 

// 2. PARAMETER JARINGAN ARBITRUM SEPOLIA (EIP-3085)
export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
export const ARBITRUM_SEPOLIA_HEX_ID = "0x66eee";

export const ARBITRUM_SEPOLIA_NETWORK_PARAMS = {
  chainId: ARBITRUM_SEPOLIA_HEX_ID,
  chainName: "Arbitrum Sepolia Testnet",
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
  blockExplorerUrls: ["https://sepolia.arbiscan.io"]
};

// 3. APPLICATION BINARY INTERFACE (ABI)
// Uncomment dan tempelkan (paste) array JSON ABI dari tombol 'ABI' Remix di sini:
export const FRACTIONAL_PROPERTY_ABI = [
  // Paste JSON ABI dari Remix di sini [...]
];
```

---

## 💻 Langkah 3: Integrasi Web3 di `src/App.jsx`

Buka file `src/App.jsx`. Terapkan 7 penyesuaian terstruktur berikut:

### 3.1. Import Ethers & Konfigurasi Kontrak
> 📍 **Lokasi**: Baris 1-13 (paling atas file)  
> ✏️ **Yang Diganti**: `import React, { useState } from 'react';`  
> ➕ **Yang Dimasukkan**: Tambahkan `useEffect`, `useCallback`, pustaka `ethers`, dan impor konstanta kontrak  
> 💡 *Catatan*: Mencegah error `ReferenceError: useCallback is not defined` dan `ReferenceError: ethers is not defined`.

```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Navbar from './components/Navbar';
import PropertyCard from './components/PropertyCard';
import InvestorPortfolio from './components/InvestorPortfolio';
import InvestBox from './components/InvestBox';
import TransactionHistory from './components/TransactionHistory';
import {
  PROPERTY_CONTRACT_ADDRESS,
  FRACTIONAL_PROPERTY_ABI,
  ARBITRUM_SEPOLIA_HEX_ID,
  ARBITRUM_SEPOLIA_NETWORK_PARAMS
} from './constants/contract';
import './App.css';
```

---

### 3.2. Tambah State `isConnecting` & Timer Cooldown
> 📍 **Lokasi**: Di dalam `export default function App()`, area deklarasi state (sekitar baris 25-50)  
> ➕ **Yang Dimasukkan**: State `isConnecting` dan hook `useEffect` timer countdown untuk `cooldownSeconds`  
> 💡 *Catatan*: Mencegah error `ReferenceError: setIsConnecting is not defined` dan menjalankan hitung mundur detik jeda anti-spam secara otomatis di UI.

```javascript
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // 1. Tambahkan baris state isConnecting ini: 👇
  const [isConnecting, setIsConnecting] = useState(false);

  const [isTransacting, setIsTransacting] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);

  // 2. Tambahkan timer hitung mundur otomatis untuk periode cooldown anti-spam: 👇
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);
```

---

### 3.3. Helper Provider Anti-Tabrakan Ekstensi Multi-Wallet (`getProvider`)
> 📍 **Lokasi**: Di atas fungsi koneksi wallet (sekitar baris 70)  
> ➕ **Yang Dimasukkan**: Fungsi helper `getProvider()`  
> 💡 *Catatan Masalah*: Banyak ekstensi dompet Web3 (seperti Rabby, Coinbase Wallet, Phantom EVM, OKX Wallet, Trust Wallet) otomatis menyetel flag `isMetaMask = true` ke `window.ethereum` agar dApp lawas tetap berfungsi. Fungsi helper ini menyaring array `window.ethereum.providers` secara ketat agar browser memilih instance **MetaMask asli**, sehingga mencegah error penolakan akun seperti `wallet must has at least one account (code 4001)`.

```javascript
  // Helper: Deteksi provider MetaMask asli bebas bentrok ekstensi lain (Rabby, Phantom, Coinbase, OKX, dll)
  const getProvider = () => {
    if (typeof window === 'undefined' || !window.ethereum) return undefined;

    // Jika terpasang banyak ekstensi dompet di browser
    if (window.ethereum.providers?.length) {
      const realMetaMask = window.ethereum.providers.find(
        (p) =>
          p.isMetaMask &&
          !p.isRabby &&
          !p.isCoinbaseWallet &&
          !p.isPhantom &&
          !p.isOkxWallet &&
          !p.isTrustWallet &&
          !p.isBraveWallet
      );
      if (realMetaMask) return realMetaMask;
    }

    return window.ethereum;
  };
```

---

### 3.4. Koneksi Wallet Asli & Auto-Switch Network
> 📍 **Lokasi**: Menggantikan fungsi `handleConnectWallet` lama (sekitar baris 80-110)  
> ❌ **Yang Dihapus**: Logika `alert("Mode Mock Frontend: ...")` lama  
> ➕ **Yang Dimasukkan**: Fungsi `ensureArbitrumNetwork` dan handler `handleConnectWallet` baru yang meminta akun nyata dari MetaMask

```javascript
  // 1. Memastikan jaringan dompet berada di Arbitrum Sepolia
  const ensureArbitrumNetwork = async () => {
    const provider = getProvider();
    if (!provider) return;
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARBITRUM_SEPOLIA_HEX_ID }]
      });
    } catch (err) {
      // Error 4902: Jaringan belum terdaftar di MetaMask, minta daftarkan otomatis
      if (err.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [ARBITRUM_SEPOLIA_NETWORK_PARAMS]
        });
      } else {
        throw err;
      }
    }
  };

  // 2. Handler tombol Connect Wallet
  const handleConnectWallet = async () => {
    const provider = getProvider();
    if (!provider) {
      alert("Ekstensi MetaMask tidak terdeteksi! Silakan instal MetaMask.");
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });
      await ensureArbitrumNetwork();

      const connectedAddr = accounts[0];
      setAccount(connectedAddr);
      await fetchBlockchainData(connectedAddr);
    } catch (err) {
      console.error("Gagal menghubungkan wallet:", err);
    } finally {
      setIsConnecting(false);
    }
  };
```

---

### 3.5. Read Calls (Membaca Data On-Chain Gratis Gas)
> 📍 **Lokasi**: Di bawah fungsi koneksi wallet (sekitar baris 115-160)  
> ➕ **Yang Dimasukkan**: Fungsi `fetchBlockchainData = useCallback(...)` dan hook `useEffect`  
> 💡 *Catatan*: Membaca fungsi view (`propertyName`, `availableFractions`, dsb.) secara otomatis setiap kali web pertama kali dibuka atau akun dompet berubah.

```javascript
  // Membaca data on-chain dari Arbitrum Sepolia tanpa biaya gas
  const fetchBlockchainData = useCallback(async (userAddr) => {
    const providerObj = getProvider();
    if (!providerObj || !PROPERTY_CONTRACT_ADDRESS) return;

    try {
      const provider = new ethers.BrowserProvider(providerObj);
      const contract = new ethers.Contract(
        PROPERTY_CONTRACT_ADDRESS,
        FRACTIONAL_PROPERTY_ABI,
        provider
      );

      // Baca data umum properti
      const [name, sym, docURI, priceWei, total, available] = await Promise.all([
        contract.propertyName(),
        contract.propertySymbol(),
        contract.propertyDocumentURI(),
        contract.fractionPrice(),
        contract.totalFractions(),
        contract.availableFractions()
      ]);

      setPropertyName(name);
      setSymbol(sym);
      setDocumentURI(docURI);
      setPriceEth(ethers.formatEther(priceWei));
      setTotalFractions(Number(total));
      setAvailableFractions(Number(available));

      // Baca saldo fraksi & waktu cooldown investor jika akun sudah terhubung
      if (userAddr) {
        const [bal, lastTime, cooldownPeriod] = await Promise.all([
          contract.getInvestorFractions(userAddr),
          contract.lastInvestmentTime(userAddr),
          contract.COOLDOWN_PERIOD()
        ]);
        setMyFractions(Number(bal));

        // Hitung sisa detik cooldown berdasarkan waktu on-chain
        const nowSec = Math.floor(Date.now() / 1000);
        const remaining = (Number(lastTime) + Number(cooldownPeriod)) - nowSec;
        if (remaining > 0 && Number(lastTime) > 0) {
          setCooldownSeconds(remaining);
        } else {
          setCooldownSeconds(0);
        }
      }
    } catch (err) {
      console.error("Gagal membaca data on-chain:", err);
    }
  }, []);

  // Hook untuk memicu pembacaan data otomatis saat aplikasi dimuat
  useEffect(() => {
    fetchBlockchainData(account);
  }, [account, fetchBlockchainData]);
```

---

### 3.6. Write Calls (Transaksi dengan Buffer Gas Arbitrum L2)
> 📍 **Lokasi**: Menggantikan fungsi `handleInvest` simulasi lama (sekitar baris 170-220)  
> ❌ **Yang Dihapus**: Seluruh blok `setTimeout(...)` simulasi lokal lama  
> ➕ **Yang Dimasukkan**: Pemanggilan on-chain `contract.buyFractions` dengan buffer `maxFeePerGas: 150%`  
> ⚠️ **Catatan Kunci**: Arbitrum L2 memproduksi blok sub-detik (~250ms) sehingga `baseFee` berfluktuasi cepat. Menambahkan buffer `maxFeePerGas: 150%` dari `provider.getFeeData()` **wajib dilakukan** untuk mencegah error: `"max fee per gas less than block base fee"`.

```javascript
  const handleInvest = async (quantity) => {
    if (!account) {
      alert("Harap hubungkan dompet MetaMask terlebih dahulu!");
      return;
    }

    // 1. Validasi Periode Cooldown Anti-Spam
    if (cooldownSeconds > 0) {
      setTxStatus({
        type: 'error',
        message: `Harap tunggu periode cooldown selesai (${cooldownSeconds} detik lagi)!`
      });
      return;
    }

    try {
      setIsTransacting(true);
      setTxStatus({
        type: 'info',
        message: 'Menunggu persetujuan transaksi di MetaMask...'
      });

      const activeProvider = getProvider() || window.ethereum;
      const provider = new ethers.BrowserProvider(activeProvider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        PROPERTY_CONTRACT_ADDRESS,
        FRACTIONAL_PROPERTY_ABI,
        signer
      );

      // 1. Hitung total nilai ETH (0.001 ETH per lembar fraksi)
      const costWei = ethers.parseEther((quantity * parseFloat(priceEth)).toFixed(4));

      // 2. Ambil data gas fee saat ini dan beri buffer 50% (Anti-Revert BaseFee L2)
      const feeData = await provider.getFeeData();
      const maxFeePerGas = feeData.maxFeePerGas 
        ? (feeData.maxFeePerGas * 150n) / 100n 
        : undefined;
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas 
        ? (feeData.maxPriorityFeePerGas * 150n) / 100n 
        : undefined;

      // 3. Kirim transaksi dengan parameter gas yang aman
      const tx = await contract.buyFractions(quantity, {
        value: costWei,
        gasLimit: 350000n,
        maxFeePerGas,
        maxPriorityFeePerGas
      });

      setTxStatus({
        type: 'info',
        message: 'Transaksi dikirim ke sequencer Arbitrum (~1-2 detik)...'
      });

      // 4. Tunggu konfirmasi blok on-chain
      const receipt = await tx.wait();
      setTxHash(tx.hash);

      // 5. Aktifkan timer hitung mundur cooldown 10 detik di UI
      setCooldownSeconds(10);

      addTransaction({
        hash: tx.hash,
        type: 'Beli Fraksi',
        description: `Beli ${quantity} Lembar Fraksi (${(quantity * parseFloat(priceEth)).toFixed(3)} ETH)`,
        timestamp: Date.now(),
        status: 'Sukses'
      });

      setTxStatus({
        type: 'success',
        message: `Sukses membeli ${quantity} fraksi on-chain di blok #${receipt.blockNumber}!`
      });

      // Refresh data kuota & portofolio on-chain secara instan
      await fetchBlockchainData(account);
    } catch (err) {
      console.error("Transaksi on-chain gagal:", err);
      let errMsg = "Transaksi dibatalkan atau gagal dieksekusi.";
      
      // Deteksi pesan revert cooldown dari Smart Contract
      if (err.reason) {
        errMsg = err.reason;
      } else if (err.message && (err.message.includes("cooldown") || err.message.includes("Harap tunggu"))) {
        errMsg = "Revert Smart Contract: Harap tunggu periode cooldown selesai sebelum melakukan investasi lagi!";
      } else if (err.message && err.message.includes("user rejected")) {
        errMsg = "Transaksi ditolak oleh pengguna di MetaMask.";
      } else if (err.shortMessage) {
        errMsg = err.shortMessage;
      }
      setTxStatus({ type: 'error', message: errMsg });
    } finally {
      setIsTransacting(false);
    }
  };
```

---

### 3.7. Update Props pada `<Navbar />` & `<InvestBox />`
> 📍 **Lokasi**: Di dalam blok `return (` pada file `src/App.jsx`  
> ✏️ **Yang Diganti**: 
> 1. Pada `<Navbar ... />`: Ubah `isConnecting={false}` menjadi `isConnecting={isConnecting}`  
> 2. Pada `<InvestBox ... />`: Pastikan menyertakan prop `cooldownSeconds={cooldownSeconds}`  
> 💡 *Catatan*: Agar tombol Navbar menampilkan teks "Menghubungkan...", dan tombol InvestBox otomatis menampilkan hitungan mundur cooldown anti-spam saat jeda aktif.

```jsx
      {/* 1. Header Navbar */}
      <Navbar
        account={account}
        onConnect={handleConnectWallet}
        isConnecting={isConnecting} // <-- Ubah dari false menjadi isConnecting
        connectError={null}
        onDismissConnectError={() => { }}
      />

      {/* 2. Formulir Pembelian InvestBox */}
      <InvestBox
        priceEth={priceEth}
        availableFractions={availableFractions}
        cooldownSeconds={cooldownSeconds} // <-- Pastikan prop ini disertakan
        onInvest={handleInvest}
        isTransacting={isTransacting}
        txStatus={txStatus}
        txHash={txHash}
      />
```

---

## 🧪 Langkah 4: Uji Coba Transaksi di Localhost

> 📍 **Lokasi Pengujian**: Terminal & Browser `http://localhost:5173`  
> 🎯 **Target Verifikasi**:
> 1. Klik tombol **Connect Wallet**: Ekstensi MetaMask terbuka, meminta izin koneksi, dan alamat dompet (misal `0xd1C4...1cA4`) langsung tampil di pojok kanan atas.
> 2. Form Pembelian Fraksi: Masukkan jumlah (misal `1` fraksi seharga `0.001 ETH`) ➡️ Klik **🏢 Konfirmasi & Beli**.
> 3. Konfirmasi di MetaMask: Pop-up MetaMask menampilkan transfer `0.001 ETH` + estimasi gas fee Arbitrum yang sangat kecil (~0.00003 ETH).
> 4. Hasil: Dalam ~1-2 detik transaksi terkonfirmasi, banner hijau sukses muncul dengan nomor blok, saldo fraksi bertambah, kuota sisa berkurang, dan riwayat transaksi lokal tercatat!

---

## 🛡️ Langkah 5: Verifikasi Source Code di Arbiscan (Mendapatkan Centang Hijau)

> 📍 **Lokasi Halaman**: Kunjungi Arbiscan Sepolia di `https://sepolia.arbiscan.io/address/<CONTRACT_ADDRESS>` ➡️ Klik tab **Contract** ➡️ Klik tautan biru **Verify and Publish**

### 1. Pengaturan Awal Formulir Verifikasi:
- **Compiler Type**: Pilih **`Solidity (Single file)`**
- **Compiler Version**: Pilih versi compiler yang sesuai dengan yang dipakai di Remix *(misal: `v0.8.34+commit.80d5c536`)*
- **Open Source License Type**: Pilih **`3) MIT License (MIT)`**
- Klik **Continue**.

### 2. Pengisian Kode Sumber:
- 📝 **Kotak Besar ("Enter the Solidity Contract Code below *")**:  
  **WAJIB DIISI!** Tempelkan (*paste*) seluruh kode sumber `FractionalProperty.sol` lengkap dari Remix ke dalam kotak ini.

- ❌ **Kotak Kecil ("Constructor Arguments ABI-encoded")**:  
  ⚠️ **WAJIB DIHAPUS TOTAL SAMPAI KOSONG MELOMPONG!**  
  *Penyebab Error*: Arbiscan sering otomatis mengisi kotak ini dengan teks catatan bantuan:  
  `Note: Unable to determine constructor arguments, please check and replace...`  
  Karena constructor smart contract `FractionalProperty` **tidak memiliki parameter apa pun** (`constructor() { ... }`), kotak ini **harus dibersihkan sampai tidak ada teks sama sekali**. Jika tidak dikosongkan, form akan menolak dengan error merah: `Multi-line input is not supported, please use a single line only.`

3. Selesaikan verifikasi Cloudflare / Captcha ➡️ Klik tombol biru **`Verify and Publish`**.
4. **Selesai!** Arbiscan akan menampilkan centang hijau: **`Contract Source Code Verified`** dan tab **Read Contract** & **Write Contract** resmi terbuka penuh untuk publik! 🌐

---

## 📜 Langkah 6: Membuktikan Dokumen Legalitas IPFS Secara On-Chain

Setelah terverifikasi di Arbiscan:
1. Klik tab **Contract** ➡️ **Read Contract**.
2. Cari dan klik fungsi **`propertyDocumentURI`**.
3. Nilai yang dikembalikan adalah:
   ```text
   ipfs://bafybeiexwukp7b44s42dk7fjybeduq4teqganfsmndrpxmr6im32meru3i
   ```

### Mengapa Ini Esensial untuk RWA (Bukan Link Web2 Biasa)?
- **Location Addressing (Web2):** Jika sertifikat disimpan di `website-developer.com/sertifikat.pdf`, pemilik server bisa diam-diam mengganti file tersebut kapan saja.
- **Content Addressing (Web3 IPFS):** Hash `bafybeiex...` adalah **sidik jari kriptografi (CID)** yang dihasilkan murni dari konten dokumen aslinya. Jika satu huruf atau titik pada dokumen tanah tersebut dipalsukan, hash-nya akan berubah total dan otomatis ditolak oleh smart contract.
- Dokumen fisik dan hak kepemilikannya terpatri abadi, terdesentralisasi, dan dapat diaudit oleh siapa saja 24/7 di seluruh dunia melalui Arbitrum Sepolia!
