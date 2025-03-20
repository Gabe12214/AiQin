import React, { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useTokens } from '@/hooks/useTokens';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardHeader 
} from '@/components/ui/card';
import { 
  Copy, 
  RotateCw, 
  Coins,
  DollarSign,
  ExternalLink,
  ExternalLinkIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const WalletOverview: React.FC = () => {
  const { 
    account, 
    disconnect, 
    balance, 
    currentNetwork,
    chainId 
  } = useWallet();
  const { nativeTokenInfo, tokenBalances, totalValueUSD, refreshBalances, isLoading } = useTokens();
  const { toast } = useToast();
  const [ethPrice, setEthPrice] = useState<number>(2000); // Default ETH price
  
  // Helper functions
  const truncateAddress = (address: string) => {
    if (!address) return '';
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
      case 'MATIC':
        return <Coins className="text-purple-700" />;
      case 'AVAX':
        return <Coins className="text-red-700" />;
      case 'BNB':
        return <Coins className="text-yellow-700" />;
      case 'USDC':
        return <DollarSign className="text-green-700" />;
      case 'LINK':
        return <ExternalLink className="text-blue-700" />;
      default:
        return <DollarSign className="text-gray-700" />;
    }
  };
  
  const getTokenColor = (symbol: string) => {
    switch (symbol) {
      case 'ETH': return 'bg-blue-100';
      case 'MATIC': return 'bg-purple-100';
      case 'AVAX': return 'bg-red-100';
      case 'BNB': return 'bg-yellow-100';
      case 'USDC': return 'bg-green-100';
      case 'LINK': return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  };
  
  const openBlockExplorer = () => {
    if (!account || !currentNetwork?.blockExplorerUrl) return;
    
    const url = `${currentNetwork.blockExplorerUrl}/address/${account}`;
    window.open(url, '_blank');
  };
  
  // For demo purposes, simulate a USD value based on the network's native token
  useEffect(() => {
    const fetchPrice = async () => {
      // In a real app, you would fetch the price from an API
      // Here we're using mock prices for demonstration
      if (currentNetwork) {
        switch (currentNetwork.symbol) {
          case 'ETH':
            setEthPrice(2000);
            break;
          case 'MATIC':
            setEthPrice(0.6);
            break;
          case 'AVAX':
            setEthPrice(11);
            break;
          case 'BNB':
            setEthPrice(220);
            break;
          default:
            setEthPrice(100);
        }
      }
    };
    
    fetchPrice();
  }, [currentNetwork]);
  
  // Calculate the native token value in USD
  const tokenValueUSD = balance ? parseFloat(balance) * ethPrice : 0;
  
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
                  {currentNetwork?.blockExplorerUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary hover:text-primary/80 p-0 h-auto"
                      onClick={openBlockExplorer}
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">Connected</span>
              </div>
              {currentNetwork && (
                <Badge variant="outline" className="my-1">
                  {currentNetwork.name}
                </Badge>
              )}
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
            <h3 className="text-gray-500 text-sm">Balance on {currentNetwork?.name || 'Network'}</h3>
            <span className="text-sm text-gray-500">≈ {formatUSD(tokenValueUSD)} USD</span>
          </div>
          <div className="mt-2 flex items-end">
            <span className="text-3xl font-bold text-gray-800">
              {parseFloat(balance || '0').toFixed(5)} {currentNetwork?.symbol || 'ETH'}
            </span>
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
              <div className={`w-8 h-8 rounded-full ${getTokenColor(currentNetwork?.symbol || 'ETH')} flex items-center justify-center mr-3`}>
                {getTokenIcon(currentNetwork?.symbol || 'ETH')}
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{currentNetwork?.name || 'Ethereum'}</h4>
                <p className="text-xs text-gray-500">{currentNetwork?.symbol || 'ETH'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-800">{parseFloat(balance || '0').toFixed(5)} {currentNetwork?.symbol || 'ETH'}</p>
              <p className="text-xs text-gray-500">{formatUSD(tokenValueUSD)}</p>
            </div>
          </div>
          
          {/* ERC-20 Tokens - depending on current network, we could show different tokens */}
          {tokenBalances.length > 0 ? (
            tokenBalances.map((token, index) => (
              <div 
                key={index} 
                className={`${index < tokenBalances.length - 1 ? 'border-b border-gray-100' : ''} py-3 flex justify-between items-center`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full ${getTokenColor(token.symbol)} flex items-center justify-center mr-3`}>
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
            ))
          ) : (
            parseFloat(balance || '0') === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No assets found in this wallet on {currentNetwork?.name}
              </div>
            ) : (
              <div className="py-4 text-center text-gray-500 text-sm">
                <p>No additional tokens found on this network.</p>
                <p className="mt-1">Use the 'Send' feature to add tokens to your wallet.</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletOverview;
