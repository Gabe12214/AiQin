import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/hooks/useWallet';
import { useTransactions } from '@/hooks/useTransactions';
import { X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'send' | 'swap' | 'buy';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  type,
}) => {
  const { account, networkName } = useWallet();
  const { executeTransaction } = useTransactions();
  const { toast } = useToast();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isPending, setIsPending] = useState(false);
  
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRecipient('');
      setAmount('');
      setIsPending(false);
    }
  }, [isOpen]);
  
  const getTitle = () => {
    switch (type) {
      case 'send':
        return 'Send Transaction';
      case 'swap':
        return 'Swap Tokens';
      case 'buy':
        return 'Buy Crypto';
      default:
        return 'Transaction';
    }
  };
  
  const validateTransaction = () => {
    if (!recipient) {
      toast({
        title: "Invalid Recipient",
        description: "Please enter a valid wallet address",
        variant: "destructive",
      });
      return false;
    }
    
    if (!ethers.isAddress(recipient)) {
      toast({
        title: "Invalid Address",
        description: "The recipient address is not a valid Ethereum address",
        variant: "destructive",
      });
      return false;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleConfirm = async () => {
    if (type !== 'send') {
      toast({
        title: "Not Implemented",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} functionality is not implemented yet`,
        variant: "destructive",
      });
      onClose();
      return;
    }
    
    if (!validateTransaction()) return;
    
    setIsPending(true);
    
    try {
      const txHash = await executeTransaction(recipient, amount);
      if (txHash) {
        toast({
          title: "Transaction Sent",
          description: "Your transaction has been submitted successfully",
        });
        onClose();
      }
    } catch (error) {
      console.error('Transaction error:', error);
    } finally {
      setIsPending(false);
    }
  };
  
  const handleReject = () => {
    onClose();
  };
  
  // Render send transaction UI
  const renderSendUI = () => (
    <>
      <DialogDescription>
        Send cryptocurrency to another wallet address
      </DialogDescription>
      
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (ETH)</Label>
          <Input
            id="amount"
            type="number"
            step="0.001"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-500">
          <span>Network Fee:</span>
          <span>~0.002 ETH</span>
        </div>
      </div>
      
      <div className="bg-yellow-50 p-3 rounded-lg mt-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-yellow-700">
            Always verify transaction details before confirming. This action cannot be undone.
          </p>
        </div>
      </div>
    </>
  );
  
  // Render swap tokens UI (placeholder for now)
  const renderSwapUI = () => (
    <div className="py-8 text-center text-gray-500">
      Token swap functionality is coming soon!
    </div>
  );
  
  // Render buy crypto UI (placeholder for now)
  const renderBuyUI = () => (
    <div className="py-8 text-center text-gray-500">
      Buy crypto functionality is coming soon!
    </div>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="bg-primary/10 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle>{getTitle()}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          {type === 'send' && renderSendUI()}
          {type === 'swap' && renderSwapUI()}
          {type === 'buy' && renderBuyUI()}
        </div>
        
        <DialogFooter>
          <div className="flex w-full space-x-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleReject}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-primary" 
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
