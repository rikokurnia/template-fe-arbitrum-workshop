# template-fe-arbitrum-workshop

Template Frontend dApp Real World Asset (RWA) Properti Fraksional di Arbitrum Sepolia untuk workshop **Build on Arbitrum**.

## 🏗️ Struktur Proyek

```text
arbitrum-rwa-property/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx             # Header & tombol status dompet
│   │   ├── PropertyCard.jsx       # Informasi properti & sertifikat IPFS
│   │   ├── InvestorPortfolio.jsx  # Portofolio kepemilikan unit fraksi
│   │   ├── InvestBox.jsx          # Form input investasi unit fraksi
│   │   └── TransactionHistory.jsx # Riwayat transaksi & link Arbiscan
│   ├── App.jsx                    # Komponen utama penampung state UI
│   ├── App.css                    # Tata letak grid dashboard & card styling
│   ├── index.css                  # Desain sistem global bertema Arbitrum
│   └── main.jsx
├── package.json
└── vite.config.js
```

## 🛠️ Prasyarat & Tools yang Dibutuhkan

Sebelum memulai, pastikan perangkat Anda telah terpasang:
* **Code Editor**: [Visual Studio Code](https://code.visualstudio.com/)
* **Node.js**: Versi LTS (**v18.x** atau **v20.x+**) beserta `npm` (cek via terminal: `node -v`)
* **Browser**: Google Chrome atau Brave
* **Web3 Wallet**: Ekstensi [MetaMask](https://metamask.io/) dengan jaringan **Arbitrum Sepolia Testnet** & saldo faucet ETH

---

## 🚀 Langkah Menjalankan Proyek di Terminal

1. **Clone repository & masuk ke direktori**:
   ```bash
   git clone https://github.com/rikokurnia/template-fe-arbitrum-workshop.git
   cd template-fe-arbitrum-workshop
   ```

2. **Pasang semua dependensi**:
   ```bash
   npm install
   ```
   > 💡 *Catatan Ethers.js:* Pustaka `ethers` (`^6.17.0`) sudah terdaftar di `package.json`, sehingga otomatis terpasang saat `npm install`. Anda **tidak perlu** menjalankan `npm install ethers` lagi secara terpisah.

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```

4. **Buka di browser**:
   Kunjungi [http://localhost:5173](http://localhost:5173). Tampilan awal aplikasi akan berjalan dalam **Mode Mock Frontend**.

---

## 📖 Panduan Integrasi On-Chain

Panduan lengkap kode dan langkah-demi-langkah tersedia di:  
👉 **[PANDUAN-INTEGRASI-ONCHAIN.md](./PANDUAN-INTEGRASI-ONCHAIN.md)**

### 📌 Ringkasan Integrasi On-Chain (Langkah 2 - 5)

Berikut adalah panduan cepat mengenai bagian mana saja yang perlu disesuaikan, dihapus, atau ditambahkan saat beralih dari Mock ke On-Chain:

| Langkah | Lokasi File / Bagian | ✏️ Yang Diganti / ❌ Dihapus | ➕ Yang Dimasukkan / Ditambahkan |
| :--- | :--- | :--- | :--- |
| **Langkah 2** | `src/constants/contract.js` | • Ganti `PROPERTY_CONTRACT_ADDRESS`<br>• Hapus `//` comment pada `FRACTIONAL_PROPERTY_ABI` | • Tempelkan CA dari Remix<br>• Tempelkan JSON ABI dari Remix |
| **Langkah 3.1** | `src/App.jsx` (Import atas) | • Ganti import React biasa | • Tambahkan `useEffect`, `useCallback`, `ethers`<br>• Import konstanta dari `./constants/contract` |
| **Langkah 3.2** | `src/App.jsx` (State) | *(Tidak ada yang dihapus)* | • `const [isConnecting, setIsConnecting] = useState(false);` |
| **Langkah 3.3** | `src/App.jsx` (Helper) | *(Tidak ada yang dihapus)* | • Fungsi `getProvider()` (Filter anti-tabrakan MetaMask vs Rabby) |
| **Langkah 3.4** | `src/App.jsx` (Connect) | • Hapus alert dummy mock | • Fungsi `ensureArbitrumNetwork()`<br>• Request akun riil via `eth_requestAccounts` |
| **Langkah 3.5** | `src/App.jsx` (Read Data) | *(Tidak ada yang dihapus)* | • Fungsi `fetchBlockchainData` via `useCallback`<br>• Hook `useEffect` untuk fetch otomatis |
| **Langkah 3.6** | `src/App.jsx` (Write Data) | • Hapus simulasi lokal `setTimeout` | • Panggilan riil `contract.buyFractions`<br>• Buffer gas 50% `maxFeePerGas` (Anti-Revert L2) |
| **Langkah 3.7** | `src/App.jsx` (Navbar JSX) | • Ganti `isConnecting={false}` | • Ubah prop menjadi `isConnecting={isConnecting}` |
| **Langkah 4** | Browser `localhost:5173` | • Transaksi mock statis | • Pengujian transaksi riil dengan sign di MetaMask |
| **Langkah 5** | Arbiscan Sepolia | • **HAPUS TOTAL** teks pada *"Constructor Arguments"* | • Tempelkan kode `FractionalProperty.sol` single-file |


