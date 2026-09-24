// -------------------------------------------------------------
// 1. ALAMAT SMART CONTRACT RWA
// Ganti nilai string di bawah ini dengan alamat kontrak hasil deploy Anda!
// -------------------------------------------------------------
export const PROPERTY_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// -------------------------------------------------------------
// 2. PARAMETER JARINGAN ARBITRUM SEPOLIA (EIP-3085)
// Digunakan untuk meminta MetaMask beralih/menambahkan jaringan secara otomatis
// -------------------------------------------------------------
export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
export const ARBITRUM_SEPOLIA_HEX_ID = "0x66eee"; // 421614 dalam format heksadesimal

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

// -------------------------------------------------------------
// 3. APPLICATION BINARY INTERFACE (ABI)
// Mencakup seluruh fungsi dan event dari FractionalProperty.sol
// -------------------------------------------------------------


// export const FRACTIONAL_PROPERTY_ABI =