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
│   │   ├── IssuerPanel.jsx        # Panel pengelola aset (Restock & Withdraw)
│   │   └── TransactionHistory.jsx # Riwayat transaksi & link Arbiscan
│   ├── App.jsx                    # Komponen utama penampung state UI
│   ├── App.css                    # Tata letak grid dashboard & card styling
│   ├── index.css                  # Desain sistem global bertema Arbitrum
│   └── main.jsx
├── package.json
└── vite.config.js
```

## 🚀 Menjalankan Proyek Lokal

1. **Pasang dependensi**:
   ```bash
   npm install
   ```

2. **Jalankan development server**:
   ```bash
   npm run dev
   ```

3. **Buka di browser**:
   Kunjungi [http://localhost:5173](http://localhost:5173)
