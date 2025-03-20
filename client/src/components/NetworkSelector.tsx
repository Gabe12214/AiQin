import { Check, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Network } from "@/hooks/useWallet";

interface NetworkSelectorProps {
  networks: Network[];
  selectedNetwork: Network | null;
  onNetworkSelect: (network: Network) => void;
  isLoading: boolean;
}

export default function NetworkSelector({ 
  networks, 
  selectedNetwork, 
  onNetworkSelect,
  isLoading 
}: NetworkSelectorProps) {
  
  if (isLoading) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading networks...
        </span>
      </Button>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedNetwork ? (
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {selectedNetwork.name}
            </span>
          ) : (
            <span>Select Network</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Available Networks</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {networks.map((network) => (
          <DropdownMenuItem
            key={network.id}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => onNetworkSelect(network)}
          >
            <span>{network.name} ({network.symbol})</span>
            {selectedNetwork?.id === network.id && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}