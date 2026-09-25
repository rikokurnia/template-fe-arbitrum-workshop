// =============================================================================
// FILE: src/constants/contract.js
// DESKRIPSI: Konfigurasi Smart Contract RWA & Jaringan Arbitrum Sepolia
// =============================================================================
// File ini bertindak sebagai "buku alamat dan kamus komunikasi" bagi frontend
// untuk mengenali, menghubungi, dan berinteraksi dengan smart contract di blockchain.
// =============================================================================

// -----------------------------------------------------------------------------
// 1. ALAMAT SMART CONTRACT RWA (CONTRACT ADDRESS / CA)
// -----------------------------------------------------------------------------
// • Alamat unik smart contract di jaringan Arbitrum Sepolia.
// • PADA MODE MOCK: Menggunakan alamat dummy "0x0000000000000000000000000000000000000000".
// • PADA MODE ON-CHAIN: Ganti nilai string ini dengan Contract Address (CA)
//   yang Anda dapatkan dari panel Deployed Contracts di Remix IDE setelah proses deploy!
// -----------------------------------------------------------------------------
export const PROPERTY_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// -----------------------------------------------------------------------------
// 2. PARAMETER JARINGAN ARBITRUM SEPOLIA (EIP-3085 & EIP-3326)
// -----------------------------------------------------------------------------
// Digunakan oleh fungsi `ensureArbitrumNetwork()` di App.jsx untuk:
// 1. Meminta MetaMask otomatis berpindah ke Arbitrum Sepolia (wallet_switchEthereumChain).
// 2. Jika belum ada di MetaMask user (Error 4902), MetaMask akan otomatis memunculkan
//    pop-up persetujuan untuk menambahkan jaringan ini (wallet_addEthereumChain).
// -----------------------------------------------------------------------------
export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

// 421614 dalam format heksadesimal (wajib diawali 0x untuk standar RPC Ethereum):
export const ARBITRUM_SEPOLIA_HEX_ID = "0x66eee";

export const ARBITRUM_SEPOLIA_NETWORK_PARAMS = {
  chainId: ARBITRUM_SEPOLIA_HEX_ID,
  chainName: "Arbitrum Sepolia Testnet",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
  blockExplorerUrls: ["https://sepolia.arbiscan.io"]
};

// -----------------------------------------------------------------------------
// 3. APPLICATION BINARY INTERFACE (ABI)
// -----------------------------------------------------------------------------
// • ABI adalah "Kamus Penerjemah" berformat JSON yang memberitahu pustaka Ethers.js
//   fungsi-fungsi apa saja yang tersedia di smart contract Solidity (nama fungsi,
//   tipe input parameter, dan tipe data kembalian).
// • PADA MODE MOCK: Variabel ini sengaja di-comment out agar peserta workshop
//   dapat mempraktikkan proses ekstraksi ABI dari Remix secara mandiri.
// • PADA MODE ON-CHAIN: Hapus tanda komentar `//` di bawah ini, lalu tempelkan (paste)
//   seluruh array JSON yang disalin dari tombol 'ABI' pada panel Solidity Compiler di Remix.
// -----------------------------------------------------------------------------

// export const FRACTIONAL_PROPERTY_ABI = [
//   // Tempelkan JSON ABI dari Remix di sini [...]
// ];