import { useState, useEffect, useCallback } from 'react';
import { 
  connectWallet, 
  getAccounts, 
  getNetwork, 
  switchNetwork, 
  listenToAccountChanges, 
  listenToNetworkChanges, 
  removeAllListeners 
} from '@/lib/ethers';
import { useToast } from '@/hooks/use-toast';

export interface Network {
  id: number;
  name: string;
  chainId: number;
  symbol: string;
}

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [networkName, setNetworkName] = useState<string>('');
  const [availableNetworks, setAvailableNetworks] = useState<Network[]>([]);
  const { toast } = useToast();

  // Fetch available networks from the API
  const fetchNetworks = useCallback(async () => {
    try {
      const response = await fetch('/api/networks');
      if (!response.ok) throw new Error('Failed to fetch networks');
      
      const networks = await response.json();
      setAvailableNetworks(networks);
    } catch (error) {
      console.error('Error fetching networks:', error);
      toast({
        title: "Error",
        description: "Failed to load network list",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Check if wallet is installed
  const checkWalletInstalled = useCallback(() => {
    return typeof window !== 'undefined' && !!window.ethereum;
  }, []);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAccount(null);
    } else {
      setIsConnected(true);
      setAccount(accounts[0]);
    }
  }, []);

  // Handle network changes
  const handleChainChanged = useCallback(async (chainIdHex: string) => {
    const chainIdDecimal = parseInt(chainIdHex, 16);
    setChainId(chainIdDecimal);
    
    try {
      const network = await getNetwork();
      setNetworkName(network.name);
    } catch (error) {
      console.error('Error getting network name:', error);
    }
  }, []);

  // Connect wallet function
  const connect = useCallback(async () => {
    if (!checkWalletInstalled()) {
      toast({
        title: "Error",
        description: "No Ethereum wallet detected. Please install MetaMask.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      const accounts = await connectWallet();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        const network = await getNetwork();
        setChainId(network.chainId);
        setNetworkName(network.name);
        
        // Register the wallet address with our backend
        await fetch('/api/users/wallet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: accounts[0],
          }),
        });
        
        toast({
          title: "Success",
          description: "Wallet connected successfully",
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  }, [checkWalletInstalled, toast]);

  // Disconnect wallet function
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAccount(null);
    setChainId(null);
    setNetworkName('');
    
    toast({
      title: "Disconnected",
      description: "Wallet disconnected",
    });
  }, [toast]);

  // Switch network function
  const handleSwitchNetwork = useCallback(async (network: Network) => {
    try {
      const success = await switchNetwork(network.chainId);
      if (success) {
        setChainId(network.chainId);
        setNetworkName(network.name);
        toast({
          title: "Network Changed",
          description: `Connected to ${network.name}`,
        });
      }
    } catch (error) {
      console.error('Error switching network:', error);
      toast({
        title: "Network Switch Failed",
        description: "Failed to switch network. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Check initial connection status
  useEffect(() => {
    const checkConnection = async () => {
      if (checkWalletInstalled()) {
        try {
          const accounts = await getAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            
            const network = await getNetwork();
            setChainId(network.chainId);
            setNetworkName(network.name);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };
    
    fetchNetworks();
    checkConnection();
  }, [checkWalletInstalled, fetchNetworks]);

  // Set up event listeners
  useEffect(() => {
    if (checkWalletInstalled()) {
      listenToAccountChanges(handleAccountsChanged);
      listenToNetworkChanges(handleChainChanged);
      
      // Clean up listeners on unmount
      return () => {
        removeAllListeners();
      };
    }
  }, [checkWalletInstalled, handleAccountsChanged, handleChainChanged]);

  return {
    isConnected,
    isConnecting,
    account,
    chainId,
    networkName,
    availableNetworks,
    connect,
    disconnect,
    switchNetwork: handleSwitchNetwork,
    isWalletInstalled: checkWalletInstalled(),
  };
}
