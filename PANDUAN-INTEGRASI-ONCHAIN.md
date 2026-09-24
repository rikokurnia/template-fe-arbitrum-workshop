# 📘 Panduan Integrasi: Mock Frontend ke Full On-Chain RWA (Arbitrum Sepolia)

Dokumen ini adalah panduan praktis langkah-demi-langkah bagi mentor dan peserta workshop untuk mengubah proyek frontend statis (**Mock Mode**) menjadi aplikasi terdesentralisasi (**Full On-Chain dApp**) yang terhubung langsung ke smart contract di jaringan **Arbitrum Sepolia**.

---

## 🗺️ Alur Kerja Singkat (Roadmap)

```text
[1. Deploy Contract di Remix] ➡️ [2. Pasang CA & ABI di contract.js] ➡️ [3. Hubungkan Ethers di App.jsx]
                                                                                   ⬇️
[6. Audit Dokumen IPFS di Arbiscan] ⬅️ [5. Verify Source Code (Centang Hijau)] ⬅️ [4. Eksekusi Transaksi di Localhost]
```

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

Buka file `src/constants/contract.js` di proyek frontend Anda, lalu masukkan:
1. **Contract Address** hasil deploy pada variabel `PROPERTY_CONTRACT_ADDRESS`.
2. **JSON ABI** yang disalin dari Remix ke variabel `FRACTIONAL_PROPERTY_ABI`.

```javascript
export const PROPERTY_CONTRACT_ADDRESS = "0x5b8e4E04568abBFaA3ef8270891686be718f9c39"; // Ganti dengan CA Anda

export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
export const ARBITRUM_SEPOLIA_HEX_ID = "0x66eee";

export const ARBITRUM_SEPOLIA_NETWORK_PARAMS = {
  chainId: ARBITRUM_SEPOLIA_HEX_ID,
  chainName: "Arbitrum Sepolia Testnet",
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
  blockExplorerUrls: ["https://sepolia.arbiscan.io"]
};

export const FRACTIONAL_PROPERTY_ABI = [
  // Paste JSON ABI dari Remix di sini
];
```

---

## 💻 Langkah 3: Integrasi Web3 di `src/App.jsx`

Buka file `src/App.jsx` dan terapkan 4 fondasi berikut:

### 1. Import Ethers & Dependencies
```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  PROPERTY_CONTRACT_ADDRESS,
  FRACTIONAL_PROPERTY_ABI,
  ARBITRUM_SEPOLIA_HEX_ID,
  ARBITRUM_SEPOLIA_NETWORK_PARAMS
} from './constants/contract';
```

### 2. Provider Anti-Tabrakan Ekstensi (Solusi Rabby vs MetaMask)
Mencegah error `wallet must has at least one account`:
```javascript
  const getProvider = () => {
    if (typeof window === 'undefined' || !window.ethereum) return undefined;
    if (window.ethereum.providers?.length) {
      const realMetaMask = window.ethereum.providers.find(
        (p) => p.isMetaMask && !p.isRabby
      );
      if (realMetaMask) return realMetaMask;
    }
    return window.ethereum;
  };
```

### 3. Connect Wallet & Auto-Switch Network
```javascript
  const ensureArbitrumNetwork = async () => {
    const provider = getProvider();
    if (!provider) return;
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARBITRUM_SEPOLIA_HEX_ID }]
      });
    } catch (err) {
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

  const handleConnectWallet = async () => {
    const provider = getProvider();
    if (!provider) {
      alert("Ekstensi dompet tidak terdeteksi!");
      return;
    }
    try {
      setIsConnecting(true);
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      await ensureArbitrumNetwork();
      setAccount(accounts[0]);
      await fetchBlockchainData(accounts[0]);
    } catch (err) {
      console.error("Gagal konek wallet:", err);
    } finally {
      setIsConnecting(false);
    }
  };
```

### 4. Read Calls (Membaca Data On-Chain Gratis Gas)
```javascript
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

      if (userAddr) {
        const bal = await contract.getInvestorFractions(userAddr);
        setMyFractions(Number(bal));
      }
    } catch (err) {
      console.error("Gagal baca data on-chain:", err);
    }
  }, []);

  useEffect(() => {
    fetchBlockchainData(account);
  }, [account, fetchBlockchainData]);
```

### 5. Write Calls (Transaksi dengan Buffer Gas Arbitrum L2)
> ⚠️ **Catatan Kunci:** Menggunakan buffer `maxFeePerGas: 150%` mencegah error sequencer Arbitrum:  
> `"max fee per gas less than block base fee"`.

```javascript
  const handleInvest = async (quantity) => {
    if (!account) {
      alert("Harap hubungkan dompet MetaMask terlebih dahulu!");
      return;
    }

    try {
      setIsTransacting(true);
      setTxStatus({ type: 'info', message: 'Menunggu konfirmasi di MetaMask...' });

      const provider = new ethers.BrowserProvider(getProvider() || window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        PROPERTY_CONTRACT_ADDRESS,
        FRACTIONAL_PROPERTY_ABI,
        signer
      );

      const costWei = ethers.parseEther((quantity * parseFloat(priceEth)).toFixed(4));

      // Buffer 50% untuk fluktuasi baseFee Layer-2 Arbitrum
      const feeData = await provider.getFeeData();
      const maxFeePerGas = feeData.maxFeePerGas ? (feeData.maxFeePerGas * 150n) / 100n : undefined;
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 150n) / 100n : undefined;

      const tx = await contract.buyFractions(quantity, {
        value: costWei,
        gasLimit: 350000n,
        maxFeePerGas,
        maxPriorityFeePerGas
      });

      setTxStatus({ type: 'info', message: 'Memproses transaksi di sequencer Arbitrum...' });
      const receipt = await tx.wait();
      setTxHash(tx.hash);

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

      await fetchBlockchainData(account);
    } catch (err) {
      console.error("Transaksi gagal:", err);
      let errMsg = "Transaksi dibatalkan atau gagal dieksekusi.";
      if (err.reason) errMsg = err.reason;
      else if (err.message && err.message.includes("user rejected")) {
        errMsg = "Transaksi ditolak oleh pengguna di MetaMask.";
      }
      setTxStatus({ type: 'error', message: errMsg });
    } finally {
      setIsTransacting(false);
    }
  };
```

---

## 🧪 Langkah 4: Uji Coba Transaksi di Localhost

1. Jalankan server lokal:
   ```bash
   npm run dev
   ```
2. Buka `http://localhost:5173`:
   - Klik **Connect Wallet** ➡️ Popup MetaMask muncul dan terhubung ke Arbitrum Sepolia.
   - Masukkan kuota pembelian fraksi (misal `1` atau `2`) ➡️ Klik **Konfirmasi & Beli**.
   - Setujui transaksi di MetaMask ➡️ Dalam ~1-2 detik transaksi sukses terkonfirmasi, sisa kuota berkurang, dan portofolio Anda bertambah secara real-time!

---

## 🛡️ Langkah 5: Verifikasi Source Code di Arbiscan (Mendapatkan Centang Hijau)

Agar tab **Read Contract** dan **Write Contract** terbuka untuk publik di Arbiscan:

1. Kunjungi halaman kontrak Anda di Arbiscan Sepolia:  
   `https://sepolia.arbiscan.io/address/<CONTRACT_ADDRESS>`
2. Klik tab **Contract** ➡️ Klik tautan biru **Verify and Publish**.
3. Konfigurasi:
   - **Compiler Type**: `Solidity (Single file)`
   - **Compiler Version**: Sesuaikan versi compiler Remix Anda (misal `v0.8.34+commit.80d5c536`)
   - **Open Source License Type**: `MIT License (MIT)`
   - Klik **Continue**.
4. Halaman Kode:
   - Di kotak besar **"Enter the Solidity Contract Code below \*"**: Tempelkan (*paste*) seluruh kode `FractionalProperty.sol`.
   - ⚠️ **Sangat Penting:** Pada kotak **"Constructor Arguments ABI-encoded"** di bagian bawah, **HAPUS SELURUH TEKS CATATAN SAMPAI KOSONG TOTAL!** *(karena kontrak ini tidak memiliki parameter constructor).*
5. Selesaikan captcha Cloudflare ➡️ Klik **Verify and Publish**.
6. **Selesai!** Arbiscan akan menampilkan centang hijau: `Contract Source Code Verified`.

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
