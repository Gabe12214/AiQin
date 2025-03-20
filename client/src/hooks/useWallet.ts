import { useState, useEffect, useCallback } from 'react';
import { 
  connectWallet, 
  getAccounts, 
  getNetwork, 
  switchNetwork,
  addNetwork,
  listenToAccountChanges, 
  listenToNetworkChanges, 
  removeAllListeners,
  getBalance,
  type WalletNetwork
} from '@/lib/ethers';
import { useToast } from '@/hooks/use-toast';

export interface Network {
  id: number;
  name: string;
  chainId: number;
  symbol: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  isDefault?: boolean;
}

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [networkName, setNetworkName] = useState<string>('');
  const [availableNetworks, setAvailableNetworks] = useState<Network[]>([]);
  const [balance, setBalance] = useState<string>('0');
  const [currentNetwork, setCurrentNetwork] = useState<Network | null>(null);
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
      setBalance('0');
    } else {
      setIsConnected(true);
      setAccount(accounts[0]);
      
      // Update balance when account changes
      if (currentNetwork && accounts[0]) {
        updateBalance(accounts[0], currentNetwork);
      }
    }
  }, [currentNetwork]);

  // Update balance for the current account
  const updateBalance = useCallback(async (walletAddress: string, network: Network) => {
    if (!walletAddress) return;
    
    try {
      // Convert to WalletNetwork format
      const walletNetwork: WalletNetwork = {
        chainId: network.chainId,
        name: network.name,
        rpcUrl: network.rpcUrl,
        symbol: network.symbol,
        blockExplorerUrl: network.blockExplorerUrl
      };
      
      const newBalance = await getBalance(walletAddress, walletNetwork);
      setBalance(newBalance);
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  }, []);

  // Find network by chain ID
  const findNetworkByChainId = useCallback((targetChainId: number) => {
    return availableNetworks.find(network => network.chainId === targetChainId) || null;
  }, [availableNetworks]);

  // Handle network changes
  const handleChainChanged = useCallback(async (chainIdHex: string) => {
    const chainIdDecimal = parseInt(chainIdHex, 16);
    setChainId(chainIdDecimal);
    
    try {
      const network = await getNetwork();
      setNetworkName(network.name);
      
      // Find the network details from our available networks
      const foundNetwork = findNetworkByChainId(chainIdDecimal);
      if (foundNetwork) {
        setCurrentNetwork(foundNetwork);
        
        // Update balance with the new network
        if (account) {
          updateBalance(account, foundNetwork);
        }
      }
    } catch (error) {
      console.error('Error getting network name:', error);
    }
  }, [account, findNetworkByChainId, updateBalance]);

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
        
        // Find the network details from our available networks
        const foundNetwork = findNetworkByChainId(network.chainId);
        if (foundNetwork) {
          setCurrentNetwork(foundNetwork);
          
          // Update balance for the connected account
          updateBalance(accounts[0], foundNetwork);
        }
        
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
  }, [checkWalletInstalled, findNetworkByChainId, toast, updateBalance]);

  // Disconnect wallet function
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAccount(null);
    setChainId(null);
    setNetworkName('');
    setBalance('0');
    setCurrentNetwork(null);
    
    toast({
      title: "Disconnected",
      description: "Wallet disconnected",
    });
  }, [toast]);

  // Add a new network to the wallet
  const handleAddNetwork = useCallback(async (network: Network) => {
    try {
      // Convert to WalletNetwork format
      const walletNetwork: WalletNetwork = {
        chainId: network.chainId,
        name: network.name,
        rpcUrl: network.rpcUrl,
        symbol: network.symbol,
        blockExplorerUrl: network.blockExplorerUrl
      };
      
      const success = await addNetwork(walletNetwork);
      if (success) {
        toast({
          title: "Network Added",
          description: `${network.name} has been added to your wallet`,
        });
        return true;
      } else {
        toast({
          title: "Failed to Add Network",
          description: "There was an error adding the network",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error adding network:', error);
      toast({
        title: "Network Add Failed",
        description: "Failed to add network. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Switch network function
  const handleSwitchNetwork = useCallback(async (network: Network) => {
    try {
      // Convert to WalletNetwork format for the switchNetwork function
      const walletNetwork: WalletNetwork = {
        chainId: network.chainId,
        name: network.name,
        rpcUrl: network.rpcUrl,
        symbol: network.symbol,
        blockExplorerUrl: network.blockExplorerUrl
      };
      
      // Try to switch network, and if the network isn't added yet, it will be added automatically
      const success = await switchNetwork(network.chainId, walletNetwork);
      
      if (success) {
        setChainId(network.chainId);
        setNetworkName(network.name);
        setCurrentNetwork(network);
        
        // Update balance with the new network
        if (account) {
          updateBalance(account, network);
        }
        
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
  }, [account, toast, updateBalance]);

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
            
            // Find the network details from our available networks
            const foundNetwork = findNetworkByChainId(network.chainId);
            if (foundNetwork) {
              setCurrentNetwork(foundNetwork);
              
              // Update balance for the connected account
              updateBalance(accounts[0], foundNetwork);
            }
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };
    
    fetchNetworks();
    checkConnection();
  }, [checkWalletInstalled, fetchNetworks, findNetworkByChainId, updateBalance]);

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
    balance,
    currentNetwork,
    availableNetworks,
    connect,
    disconnect,
    switchNetwork: handleSwitchNetwork,
    addNetwork: handleAddNetwork,
    isWalletInstalled: checkWalletInstalled(),
  };
}
