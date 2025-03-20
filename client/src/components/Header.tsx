import React from 'react';
import { Wallet } from 'lucide-react';
import ConnectButton from './ConnectButton';
import NetworkSelector from './NetworkSelector';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-primary to-purple-500 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold">AIQin</h1>
        </div>
        <div className="flex items-center space-x-3">
          <NetworkSelector />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
