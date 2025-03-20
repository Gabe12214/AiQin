import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useTokens } from '@/hooks/useTokens';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader 
} from '@/components/ui/card';
import { 
  Copy, 
  RotateCw, 
  Coins,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WalletOverview: React.FC = () => {
  const { account, disconnect } = useWallet();
  const { nativeTokenInfo, tokenBalances, totalValueUSD, refreshBalances, isLoading } = useTokens();
  const { toast } = useToast();
  
  // Helper functions
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };
  
  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Get the appropriate icon for each token
  const getTokenIcon = (symbol: string) => {
    switch (symbol) {
      case 'ETH':
        return <Coins className="text-gray-700" />;
      case 'USDC':
        return <DollarSign className="text-green-700" />;
      case 'LINK':
        return <ExternalLink className="text-blue-700" />;
      default:
        return <DollarSign className="text-gray-700" />;
    }
  };
  
  const nativeToken = nativeTokenInfo();
  
  return (
    <div className="mb-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-semibold text-gray-700">Connected Wallet</h2>
              {account && (
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600 font-mono">{truncateAddress(account)}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 text-primary hover:text-primary/80 p-0 h-auto"
                    onClick={copyAddress}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">Connected</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm text-red-500 hover:text-red-600 mt-1 p-0 h-auto"
                onClick={disconnect}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
        
        {/* Total Balance Section */}
        <CardContent className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Total Balance</h3>
            <span className="text-sm text-gray-500">≈ {formatUSD(totalValueUSD)} USD</span>
          </div>
          <div className="mt-2 flex items-end">
            <span className="text-3xl font-bold text-gray-800">
              {parseFloat(nativeToken.balance).toFixed(3)} {nativeToken.symbol}
            </span>
            <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded">+2.4%</span>
          </div>
        </CardContent>
        
        {/* Assets List */}
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Assets</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary text-sm hover:bg-transparent hover:underline p-0 h-auto flex items-center" 
              onClick={refreshBalances}
              disabled={isLoading}
            >
              <RotateCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {/* Native Token (ETH, MATIC, etc.) */}
          <div className="border-b border-gray-100 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                <Coins className="h-4 w-4 text-gray-700" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{nativeToken.name}</h4>
                <p className="text-xs text-gray-500">{nativeToken.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-800">{parseFloat(nativeToken.balance).toFixed(3)} {nativeToken.symbol}</p>
              <p className="text-xs text-gray-500">{formatUSD(nativeToken.value)}</p>
            </div>
          </div>
          
          {/* ERC-20 Tokens */}
          {tokenBalances.map((token, index) => (
            <div 
              key={index} 
              className={`${index < tokenBalances.length - 1 ? 'border-b border-gray-100' : ''} py-3 flex justify-between items-center`}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full ${
                  token.symbol === 'LINK' ? 'bg-blue-100' : 
                  token.symbol === 'USDC' ? 'bg-green-100' : 'bg-gray-100'
                } flex items-center justify-center mr-3`}>
                  {getTokenIcon(token.symbol)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{token.name}</h4>
                  <p className="text-xs text-gray-500">{token.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-800">{parseFloat(token.balance).toFixed(2)} {token.symbol}</p>
                <p className="text-xs text-gray-500">{formatUSD(token.value)}</p>
              </div>
            </div>
          ))}
          
          {/* Empty state if no tokens */}
          {tokenBalances.length === 0 && parseFloat(nativeToken.balance) === 0 && (
            <div className="py-8 text-center text-gray-500">
              No assets found in this wallet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletOverview;
