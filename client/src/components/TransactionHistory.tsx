import { ExternalLink, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Network } from "@/hooks/useWallet";

interface Transaction {
  id: number;
  hash: string;
  from: string;
  to: string;
  value: string;
  networkId: number;
  status: string;
  timestamp: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
  networks: Network[];
}

export default function TransactionHistory({ transactions, isLoading, networks }: TransactionHistoryProps) {
  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format date for display
  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return timestamp;
    }
  };

  // Get network symbol by network ID
  const getNetworkSymbol = (networkId: number) => {
    const network = networks.find(n => n.id === networkId);
    return network?.symbol || "ETH";
  };

  // Get explorer URL for transaction
  const getExplorerUrl = (hash: string, networkId: number) => {
    const network = networks.find(n => n.id === networkId);
    if (!network || !network.blockExplorerUrl) return "#";
    return `${network.blockExplorerUrl}/tx/${hash}`;
  };

  // Get status badge
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center p-4 border rounded-lg">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-3 w-[200px]" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>No transactions found</p>
        <p className="text-sm mt-2">Transactions will appear here once you start interacting with the blockchain</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="space-y-1 mb-2 sm:mb-0">
            <div className="flex items-center">
              <span className="font-medium">Transaction</span>
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs pl-1 h-auto" 
                asChild
              >
                <a href={getExplorerUrl(tx.hash, tx.networkId)} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  {formatAddress(tx.hash)}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
              <span>From:</span>
              <span className="font-mono">{formatAddress(tx.from)}</span>
              
              <span>To:</span>
              <span className="font-mono">{formatAddress(tx.to)}</span>
              
              <span>Amount:</span>
              <span>{tx.value} {getNetworkSymbol(tx.networkId)}</span>
              
              <span>Date:</span>
              <span>{formatDate(tx.timestamp)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <StatusBadge status={tx.status} />
          </div>
        </div>
      ))}
    </div>
  );
}