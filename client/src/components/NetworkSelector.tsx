import React, { useState } from 'react';
import { useWallet, Network } from '@/hooks/useWallet';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NetworkSelector: React.FC = () => {
  const { networkName, availableNetworks, switchNetwork, isConnected } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleNetworkChange = (network: Network) => {
    switchNetwork(network);
    setIsOpen(false);
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger 
        disabled={!isConnected}
        className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
          isConnected 
            ? 'bg-white/20 hover:bg-white/30 transition-colors' 
            : 'bg-white/10 text-white/50 cursor-not-allowed'
        }`}
      >
        <span>{networkName || 'Ethereum'}</span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableNetworks.map((network) => (
          <DropdownMenuItem 
            key={network.id}
            onClick={() => handleNetworkChange(network)}
          >
            {network.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NetworkSelector;
