import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ConnectButton: React.FC = () => {
  const { isConnected, isConnecting, account, connect, disconnect } = useWallet();
  
  // Helper function to truncate address for display
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  if (isConnecting) {
    return (
      <Button variant="outline" size="sm" className="bg-white text-primary font-semibold rounded-lg" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting
      </Button>
    );
  }
  
  if (isConnected && account) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-white text-primary font-semibold rounded-lg hover:bg-white/90"
        onClick={disconnect}
      >
        {truncateAddress(account)}
      </Button>
    );
  }
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="bg-white text-primary font-semibold rounded-lg hover:bg-white/90"
      onClick={connect}
    >
      Connect Wallet
    </Button>
  );
};

export default ConnectButton;
