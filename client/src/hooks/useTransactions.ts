import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { sendTransaction } from '@/lib/ethers';
import { useToast } from "@/hooks/use-toast";

export interface Transaction {
  id: number;
  hash: string;
  from: string;
  to: string;
  value: string;
  status: string;
  timestamp: string;
  networkId: number;
}

export function useTransactions() {
  const { account, chainId, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTx, setPendingTx] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch transaction history
  const fetchTransactions = useCallback(async () => {
    if (!account || !isConnected) return;
    
    setIsLoading(true);
    
    // For demo purposes, we'll use userId = 1
    try {
      const userId = 1; // In a real app, this would be the actual user ID
      const response = await fetch(`/api/transactions/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transaction history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [account, isConnected, toast]);

  // Save a transaction to the backend
  const saveTransaction = useCallback(async (
    hash: string, 
    from: string, 
    to: string, 
    value: string,
    status = "pending"
  ) => {
    if (!chainId) return;
    
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hash,
          from, 
          to,
          value,
          networkId: chainId,
          status,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save transaction');
      }
      
      const savedTx = await response.json();
      setTransactions(prev => [savedTx, ...prev]);
      
      return savedTx;
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error",
        description: "Failed to save transaction record",
        variant: "destructive",
      });
      return null;
    }
  }, [chainId, toast]);

  // Execute a transaction
  const executeTransaction = useCallback(async (
    to: string,
    value: string
  ): Promise<string | null> => {
    if (!account || !isConnected) {
      toast({
        title: "Error",
        description: "Wallet not connected",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      setPendingTx('pending');
      
      // Send the transaction
      const txHash = await sendTransaction(to, value);
      
      // Save to our backend
      await saveTransaction(txHash, account, to, value);
      
      toast({
        title: "Transaction Sent",
        description: "Your transaction has been submitted to the network",
      });
      
      setPendingTx(txHash);
      return txHash;
    } catch (error: any) {
      console.error('Transaction error:', error);
      
      // Check if user rejected transaction
      if (error.code === 4001) {
        toast({
          title: "Transaction Cancelled",
          description: "You rejected the transaction",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Transaction Failed",
          description: error.message || "Failed to send transaction",
          variant: "destructive",
        });
      }
      
      setPendingTx(null);
      return null;
    }
  }, [account, isConnected, saveTransaction, toast]);

  // Fetch transactions when account or chain changes
  useEffect(() => {
    if (isConnected && account) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [isConnected, account, chainId, fetchTransactions]);

  return {
    transactions,
    isLoading,
    pendingTx,
    fetchTransactions,
    executeTransaction
  };
}
