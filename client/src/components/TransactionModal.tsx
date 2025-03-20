import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/App";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { sendTransaction } from "@/lib/ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send, Download, Repeat, ArrowRight, Loader2, QrCode, Copy, CheckCircle } from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'send' | 'swap' | 'buy';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  type
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    isConnected, 
    account: walletAddress, 
    balance, 
    currentNetwork,
    chainId
  } = useWallet();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Create transaction
  const createTransactionMutation = useMutation({
    mutationFn: (transactionData: any) => {
      return apiRequest({
        method: "POST",
        url: "/api/transactions",
        body: transactionData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions', user?.id] });
      toast({
        title: "Transaction submitted",
        description: "Your transaction has been recorded",
      });
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Transaction failed",
        description: error.message || "Failed to record transaction",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  const handleSendTransaction = async () => {
    if (!user || !walletAddress || !currentNetwork) {
      toast({
        title: "Error",
        description: "Wallet not connected or network not selected",
        variant: "destructive",
      });
      return;
    }

    if (!recipient) {
      toast({
        title: "Error",
        description: "Recipient address is required",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // For demo purposes, we're just recording the transaction
      // In a real app, we would use ethers.js to send the transaction
      /*
      const hash = await sendTransaction(recipient, amount);
      setTransactionHash(hash);
      */
      
      // Demo transaction hash
      const mockHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
      setTransactionHash(mockHash);

      // Record transaction in our system
      createTransactionMutation.mutate({
        userId: user.id,
        hash: mockHash,
        from: walletAddress,
        to: recipient,
        value: amount,
        networkId: currentNetwork.id,
        status: "completed",
      });

    } catch (error: any) {
      console.error("Transaction error:", error);
      toast({
        title: "Transaction failed",
        description: error.message || "An error occurred while sending the transaction",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRecipient("");
    setAmount("");
    setTransactionHash("");
    setIsSubmitting(false);
    setShowQRCode(false);
    setIsCopied(false);
  };

  const copyWalletAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Get title and icon based on transaction type
  const getTransactionTitle = () => {
    switch (type) {
      case 'send':
        return { title: "Send Tokens", icon: <Send className="h-5 w-5 mr-2" /> };
      case 'swap':
        return { title: "Swap Tokens", icon: <Repeat className="h-5 w-5 mr-2" /> };
      case 'buy':
        return { title: "Receive Tokens", icon: <Download className="h-5 w-5 mr-2" /> };
      default:
        return { title: "Transaction", icon: null };
    }
  };

  const { title, icon } = getTransactionTitle();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription>
            {type === 'send' && "Send tokens to another wallet address"}
            {type === 'swap' && "Swap between different tokens"}
            {type === 'buy' && "Share your address to receive tokens"}
          </DialogDescription>
        </DialogHeader>

        {type === 'send' && (
          <div className="space-y-4 py-2">
            {!transactionHash ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="amount">Amount</Label>
                    <span className="text-sm text-muted-foreground">
                      Balance: {balance} {currentNetwork?.symbol || 'ETH'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => setAmount(balance)}
                      disabled={isSubmitting || !balance}
                    >
                      MAX
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md bg-muted p-3 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground">Network</span>
                    <span>{currentNetwork?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground">Estimated Gas</span>
                    <span>0.0001 {currentNetwork?.symbol || 'ETH'}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-4 space-y-4">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Transaction Submitted</h3>
                  <p className="text-sm text-muted-foreground">
                    Your transaction is being processed
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span>{amount} {currentNetwork?.symbol || 'ETH'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Transaction Hash</span>
                    <span className="font-mono text-xs truncate max-w-[160px]">{transactionHash}</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (currentNetwork?.blockExplorerUrl) {
                        window.open(`${currentNetwork.blockExplorerUrl}/tx/${transactionHash}`, "_blank");
                      }
                    }}
                    disabled={!currentNetwork?.blockExplorerUrl}
                  >
                    View on Explorer
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {type === 'buy' && (
          <div className="space-y-4 py-4">
            {showQRCode ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  {/* Placeholder for QR code - in a real app you'd use a QR code library */}
                  <div className="w-48 h-48 border-2 border-gray-300 rounded flex items-center justify-center">
                    <QrCode className="h-24 w-24 text-gray-400" />
                  </div>
                </div>
                <Button variant="outline" onClick={() => setShowQRCode(false)}>
                  Show Address
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">
                    Share your wallet address to receive tokens
                  </p>
                </div>
                
                <div className="relative">
                  <Input
                    value={walletAddress || ""}
                    readOnly
                    className="pr-20 font-mono"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7"
                    onClick={copyWalletAddress}
                  >
                    {isCopied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline" onClick={() => setShowQRCode(true)}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Show QR Code
                  </Button>
                </div>
                
                <div className="rounded-md bg-muted p-3 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground">Network</span>
                    <span>{currentNetwork?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Chain ID</span>
                    <span>{chainId || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {type === 'swap' && (
          <div className="space-y-4 py-4">
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                Token swapping feature coming soon!
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          {type === 'send' && !transactionHash && (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSendTransaction}
                disabled={isSubmitting || !recipient || !amount}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          )}
          
          {type === 'send' && transactionHash && (
            <Button
              className="w-full"
              onClick={onClose}
            >
              Close
            </Button>
          )}
          
          {type === 'buy' && (
            <Button
              className="w-full"
              onClick={onClose}
            >
              Done
            </Button>
          )}
          
          {type === 'swap' && (
            <Button
              className="w-full"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};