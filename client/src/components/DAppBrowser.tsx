import React from 'react';
import { Button } from '@/components/ui/button';
import { Box, Palette, Plus } from 'lucide-react';

// Example dApps
const recentDapps = [
  {
    id: 1,
    name: 'Uniswap',
    description: 'Decentralized Exchange',
    url: 'https://app.uniswap.org',
    icon: <Box className="text-white text-xs" />,
    backgroundColor: 'bg-blue-500',
  },
  {
    id: 2,
    name: 'OpenSea',
    description: 'NFT Marketplace',
    url: 'https://opensea.io',
    icon: <Palette className="text-white text-xs" />,
    backgroundColor: 'bg-purple-500',
  },
];

const DAppBrowser: React.FC = () => {
  const openDapp = (url: string) => {
    window.open(url, '_blank');
  };
  
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-3">Browse dApps</h4>
      <div className="space-y-3">
        {recentDapps.map((dapp) => (
          <Button 
            key={dapp.id}
            variant="outline" 
            className="w-full flex items-center justify-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 h-auto"
            onClick={() => openDapp(dapp.url)}
          >
            <div className={`w-8 h-8 ${dapp.backgroundColor} rounded-full flex items-center justify-center mr-3`}>
              {dapp.icon}
            </div>
            <div className="text-left">
              <h5 className="text-sm font-medium text-gray-800">{dapp.name}</h5>
              <p className="text-xs text-gray-500">{dapp.description}</p>
            </div>
          </Button>
        ))}
        
        <Button 
          variant="outline" 
          className="w-full p-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 h-auto"
        >
          Browse more dApps
        </Button>
      </div>
    </div>
  );
};

export default DAppBrowser;
