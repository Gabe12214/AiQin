import { useState, useEffect, useCallback } from 'react';
import { getBalance, getProvider } from '@/lib/ethers';
import { useWallet } from '@/hooks/useWallet';
import { ethers } from 'ethers';

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  value: number; // USD value
  icon: string;
}

// ERC-20 Token ABI (minimal ABI for balanceOf, decimals, symbol, name)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

export function useTokens() {
  const { account, chainId, isConnected } = useWallet();
  const [nativeBalance, setNativeBalance] = useState<string>("0");
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalValueUSD, setTotalValueUSD] = useState<number>(0);
  
  // Mock token contracts for demonstration - in a real app, these would come from a token registry or API
  const mockTokens = [
    { 
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum Mainnet
      name: "USD Coin",
      symbol: "USDC",
      icon: "dollar-sign",
      decimals: 6,
      price: 1, // 1 USDC = $1 USD
    },
    {
      address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", // LINK on Ethereum Mainnet
      name: "Chainlink",
      symbol: "LINK",
      icon: "link",
      decimals: 18,
      price: 14.30, // Example price $14.30 USD
    }
  ];
  
  // Mock ETH price for demonstration
  const mockEthPrice = 1850; // $1850 USD
  
  // Fetch native token (ETH, MATIC, etc.) balance
  const fetchNativeBalance = useCallback(async () => {
    if (!account || !isConnected) return;
    
    try {
      const balance = await getBalance(account);
      setNativeBalance(balance);
      
      // Update total USD value
      const ethValue = parseFloat(balance) * mockEthPrice;
      updateTotalValue([...tokenBalances, {
        symbol: "ETH",
        name: "Ethereum",
        balance,
        value: ethValue,
        icon: "ethereum"
      }]);
    } catch (error) {
      console.error("Error fetching native balance:", error);
    }
  }, [account, isConnected, tokenBalances]);
  
  // Fetch ERC-20 token balances
  const fetchTokenBalances = useCallback(async () => {
    if (!account || !isConnected) return;
    
    const provider = getProvider();
    if (!provider) return;
    
    setIsLoading(true);
    
    try {
      const balances: TokenBalance[] = [];
      
      for (const token of mockTokens) {
        try {
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
          const balance = await contract.balanceOf(account);
          const decimals = token.decimals;
          
          const formattedBalance = ethers.formatUnits(balance, decimals);
          const valueUSD = parseFloat(formattedBalance) * token.price;
          
          balances.push({
            symbol: token.symbol,
            name: token.name,
            balance: formattedBalance,
            value: valueUSD,
            icon: token.icon
          });
        } catch (error) {
          console.error(`Error fetching balance for ${token.symbol}:`, error);
        }
      }
      
      setTokenBalances(balances);
      
      // Add ETH to total calculation
      const ethValue = parseFloat(nativeBalance) * mockEthPrice;
      updateTotalValue([...balances, {
        symbol: "ETH",
        name: "Ethereum",
        balance: nativeBalance,
        value: ethValue,
        icon: "ethereum"
      }]);
    } catch (error) {
      console.error("Error fetching token balances:", error);
    } finally {
      setIsLoading(false);
    }
  }, [account, isConnected, nativeBalance]);
  
  // Update total USD value
  const updateTotalValue = (balances: TokenBalance[]) => {
    const total = balances.reduce((sum, token) => sum + token.value, 0);
    setTotalValueUSD(total);
  };
  
  // Refresh all balances
  const refreshBalances = useCallback(() => {
    fetchNativeBalance();
    fetchTokenBalances();
  }, [fetchNativeBalance, fetchTokenBalances]);
  
  // Fetch balances when account or chain changes
  useEffect(() => {
    if (isConnected && account) {
      refreshBalances();
    } else {
      setNativeBalance("0");
      setTokenBalances([]);
      setTotalValueUSD(0);
    }
  }, [isConnected, account, chainId, refreshBalances]);
  
  // Format native token info
  const nativeTokenInfo = useCallback(() => {
    // The native token info depends on the network
    const symbol = chainId === 137 ? "MATIC" : "ETH";
    const name = chainId === 137 ? "Polygon" : "Ethereum";
    const value = parseFloat(nativeBalance) * mockEthPrice;
    
    return {
      symbol,
      name,
      balance: nativeBalance,
      value,
      icon: chainId === 137 ? "hexagon" : "ethereum"
    };
  }, [chainId, nativeBalance]);
  
  return {
    nativeBalance,
    tokenBalances,
    isLoading,
    totalValueUSD,
    refreshBalances,
    nativeTokenInfo
  };
}
