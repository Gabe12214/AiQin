import React, { useState } from 'react';
import { useWallet, Network } from '@/hooks/useWallet';
import { ChevronDown, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const NetworkSelector: React.FC = () => {
  const { 
    networkName, 
    availableNetworks, 
    switchNetwork, 
    addNetwork,
    isConnected,
    currentNetwork
  } = useWallet();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customNetwork, setCustomNetwork] = useState({
    name: '',
    chainId: '',
    rpcUrl: '',
    symbol: '',
    blockExplorerUrl: ''
  });
  
  const handleNetworkChange = (network: Network) => {
    switchNetwork(network);
    setIsOpen(false);
  };

  const handleAddNetwork = async () => {
    // Validate form
    if (!customNetwork.name || !customNetwork.chainId || !customNetwork.rpcUrl || 
        !customNetwork.symbol || !customNetwork.blockExplorerUrl) {
      return;
    }
    
    // Create network object
    const newNetwork: Network = {
      id: 0, // This will be set by the server
      name: customNetwork.name,
      chainId: parseInt(customNetwork.chainId),
      rpcUrl: customNetwork.rpcUrl,
      symbol: customNetwork.symbol,
      blockExplorerUrl: customNetwork.blockExplorerUrl
    };
    
    // Add to wallet
    const success = await addNetwork(newNetwork);
    
    if (success) {
      // If added successfully, close dialog and reset form
      setIsDialogOpen(false);
      setCustomNetwork({
        name: '',
        chainId: '',
        rpcUrl: '',
        symbol: '',
        blockExplorerUrl: ''
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomNetwork(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <>
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
              className={currentNetwork?.id === network.id ? 'bg-primary/10' : ''}
            >
              {network.name} ({network.symbol})
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {
            setIsDialogOpen(true);
            setIsOpen(false);
          }}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Custom Network
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Network</DialogTitle>
            <DialogDescription>
              Add a custom blockchain network to your wallet
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Network Name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="e.g. Avalanche C-Chain" 
                value={customNetwork.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="chainId">Chain ID</Label>
              <Input 
                id="chainId" 
                name="chainId" 
                placeholder="e.g. 43114" 
                value={customNetwork.chainId}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rpcUrl">RPC URL</Label>
              <Input 
                id="rpcUrl" 
                name="rpcUrl" 
                placeholder="e.g. https://api.avax.network/ext/bc/C/rpc" 
                value={customNetwork.rpcUrl}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="symbol">Currency Symbol</Label>
              <Input 
                id="symbol" 
                name="symbol" 
                placeholder="e.g. AVAX" 
                value={customNetwork.symbol}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="blockExplorerUrl">Block Explorer URL</Label>
              <Input 
                id="blockExplorerUrl" 
                name="blockExplorerUrl" 
                placeholder="e.g. https://snowtrace.io" 
                value={customNetwork.blockExplorerUrl}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddNetwork}>
              Add Network
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NetworkSelector;
