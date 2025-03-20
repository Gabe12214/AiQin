import { ethers } from "ethers";

// Interface for network configuration
export interface WalletNetwork {
  chainId: number;
  name: string;
  rpcUrl: string;
  symbol: string;
  blockExplorerUrl: string;
  isDefault?: boolean;
}

// Initialize ethers with the browser provider (MetaMask or other wallets)
export function getProvider(): ethers.BrowserProvider | null {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  return new ethers.BrowserProvider(window.ethereum);
}

// Get a provider for a specific network with RPC URL
export function getNetworkProvider(rpcUrl: string): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(rpcUrl);
}

// Get the signer for transaction signing
export async function getSigner(): Promise<ethers.JsonRpcSigner | null> {
  const provider = getProvider();
  if (!provider) return null;
  
  try {
    return await provider.getSigner();
  } catch (error) {
    console.error("Failed to get signer:", error);
    return null;
  }
}

// Connect to wallet and return account addresses
export async function connectWallet(): Promise<string[]> {
  const provider = getProvider();
  if (!provider) throw new Error("No provider found. Please install MetaMask.");
  
  try {
    // Request account access
    const accounts = await provider.send("eth_requestAccounts", []);
    
    // After successful connection, return the accounts
    return accounts;
  } catch (error) {
    console.error("User rejected the connection request");
    throw error;
  }
}

// Get the connected accounts (if any)
export async function getAccounts(): Promise<string[]> {
  const provider = getProvider();
  if (!provider) throw new Error("No provider found. Please install MetaMask.");
  
  try {
    return await provider.send("eth_accounts", []);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }
}

// Get the current network
export async function getNetwork(): Promise<{ chainId: number, name: string }> {
  const provider = getProvider();
  if (!provider) throw new Error("No provider found. Please install MetaMask.");
  
  const network = await provider.getNetwork();
  return {
    chainId: Number(network.chainId),
    name: network.name
  };
}

// Add a new network to MetaMask
export async function addNetwork(network: WalletNetwork): Promise<boolean> {
  if (!window.ethereum) throw new Error("No provider found. Please install MetaMask.");
  
  try {
    const params = {
      chainId: `0x${network.chainId.toString(16)}`,
      chainName: network.name,
      nativeCurrency: {
        name: network.symbol,
        symbol: network.symbol,
        decimals: 18
      },
      rpcUrls: [network.rpcUrl],
      blockExplorerUrls: [network.blockExplorerUrl]
    };

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [params],
    });
    
    return true;
  } catch (error) {
    console.error("Error adding network:", error);
    return false;
  }
}

// Switch to a different network
export async function switchNetwork(chainId: number, networkInfo?: WalletNetwork): Promise<boolean> {
  if (!window.ethereum) throw new Error("No provider found. Please install MetaMask.");
  
  try {
    const hexChainId = `0x${chainId.toString(16)}`;
    
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
    
    return true;
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (error.code === 4902 && networkInfo) {
      // If the network is not available, try to add it
      return await addNetwork(networkInfo);
    }
    console.error("Error switching network:", error);
    return false;
  }
}

// Get balance for an address on a specific network
export async function getBalance(address: string, network?: WalletNetwork): Promise<string> {
  let provider;
  
  if (network) {
    // Use network-specific provider if a network is specified
    provider = getNetworkProvider(network.rpcUrl);
  } else {
    // Otherwise use the browser provider
    provider = getProvider();
    if (!provider) throw new Error("No provider found. Please install MetaMask.");
  }
  
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Error fetching balance:", error);
    return "0";
  }
}

// Send a transaction
export async function sendTransaction(to: string, value: string): Promise<string> {
  const signer = await getSigner();
  if (!signer) throw new Error("No signer found. Please connect your wallet.");
  
  try {
    const tx = await signer.sendTransaction({
      to,
      value: ethers.parseEther(value),
    });
    
    return tx.hash;
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error;
  }
}

// Add a token to MetaMask
export async function addTokenToWallet(
  tokenAddress: string,
  tokenSymbol: string,
  tokenDecimals: number,
  tokenImage: string
): Promise<boolean> {
  if (!window.ethereum) throw new Error("No provider found. Please install MetaMask.");
  
  try {
    // wasAdded is a boolean. Like any RPC method, an error may be thrown.
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: tokenAddress, // The address that the token is at.
          symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: tokenDecimals, // The number of decimals in the token
          image: tokenImage, // A string url of the token logo
        },
      },
    });
    
    return wasAdded;
  } catch (error) {
    console.error("Error adding token to wallet:", error);
    return false;
  }
}

// Listen for account changes
export function listenToAccountChanges(callback: (accounts: string[]) => void): void {
  if (!window.ethereum) return;
  
  window.ethereum.on("accountsChanged", callback);
}

// Listen for network changes
export function listenToNetworkChanges(callback: (chainId: string) => void): void {
  if (!window.ethereum) return;
  
  window.ethereum.on("chainChanged", callback);
}

// Clean up listeners
export function removeAllListeners(): void {
  if (!window.ethereum) return;
  
  window.ethereum.removeAllListeners("accountsChanged");
  window.ethereum.removeAllListeners("chainChanged");
}
