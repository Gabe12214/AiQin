import React from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, Coins, Receipt } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TransactionHistory: React.FC = () => {
  const { transactions, isLoading } = useTransactions();

  // Helper function to truncate address
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format amount with symbol
  const formatAmount = (value: string, type: string) => {
    const symbol = 'ETH'; // This would be dynamic based on the network
    return `${type === 'sent' ? '-' : '+'} ${value} ${symbol}`;
  };

  // Helper to determine transaction type
  const getTransactionType = (from: string, to: string, account?: string) => {
    if (!account) return 'unknown';
    if (from.toLowerCase() === account.toLowerCase()) return 'sent';
    if (to.toLowerCase() === account.toLowerCase()) return 'received';
    return 'unknown';
  };

  // Get transaction icon based on type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3">
            <ArrowUp className="h-5 w-5" />
          </div>
        );
      case 'received':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
            <ArrowDown className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
            <Coins className="h-5 w-5" />
          </div>
        );
    }
  };

  // Get title based on transaction type
  const getTransactionTitle = (type: string) => {
    switch (type) {
      case 'sent':
        return 'Sent ETH';
      case 'received':
        return 'Received ETH';
      default:
        return 'Transaction';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-700">Recent Transactions</h3>
      </CardHeader>

      <div className="divide-y divide-gray-100">
        {/* Empty state */}
        {transactions.length === 0 && !isLoading && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Receipt className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">No transactions yet</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="p-6 text-center">
            <p className="text-gray-500">Loading transactions...</p>
          </div>
        )}

        {/* Transactions list */}
        {transactions.map((tx) => {
          const txType = getTransactionType(tx.from, tx.to);
          
          return (
            <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getTransactionIcon(txType)}
                  <div>
                    <h4 className="font-medium text-gray-800">{getTransactionTitle(txType)}</h4>
                    <p className="text-xs text-gray-500">
                      {txType === 'sent' ? 'To: ' : 'From: '}
                      {truncateAddress(txType === 'sent' ? tx.to : tx.from)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">{formatAmount(tx.value, txType)}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {transactions.length > 0 && (
          <div className="p-4 text-center">
            <Button variant="ghost" size="sm" className="text-primary text-sm font-medium hover:underline">
              View all transactions
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TransactionHistory;
