import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Plug, Globe, Info } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

interface WelcomeScreenProps {
  onExplore: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onExplore }) => {
  const { connect, isConnecting } = useWallet();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Wallet className="text-primary text-3xl h-12 w-12" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to AIQin Wallet</h2>
      <p className="text-gray-600 max-w-md mb-8">Your secure gateway to blockchain applications and cryptocurrency management</p>
      
      <Card className="max-w-2xl w-full">
        <CardHeader className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">Get Started</h3>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1 bg-gray-50 rounded-lg p-5">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Plug className="text-primary h-6 w-6" />
              </div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">Connect Wallet</h4>
              <p className="text-sm text-gray-600 mb-4">Connect your MetaMask or other Ethereum wallet to get started.</p>
              <Button
                className="w-full bg-primary text-white rounded-lg shadow hover:bg-primary/90"
                onClick={connect}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect Now'}
              </Button>
            </div>
            
            <div className="flex-1 bg-gray-50 rounded-lg p-5">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-3">
                <Globe className="text-purple-500 h-6 w-6" />
              </div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">Explore dApps</h4>
              <p className="text-sm text-gray-600 mb-4">Discover and interact with decentralized applications.</p>
              <Button 
                variant="outline" 
                className="w-full border border-purple-500 text-purple-500 rounded-lg hover:bg-purple-500/10"
                onClick={onExplore}
              >
                Browse dApps
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <Info className="text-blue-500 h-5 w-5" />
              </div>
              <div>
                <h5 className="font-medium mb-1">New to Crypto?</h5>
                <p className="text-blue-600">
                  AIQin provides a secure way to manage your digital assets and interact with blockchain applications without exposing your private keys.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
