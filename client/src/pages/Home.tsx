import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WalletOverview from '@/components/WalletOverview';
import TransactionHistory from '@/components/TransactionHistory';
import QuickActions from '@/components/QuickActions';
import WelcomeScreen from '@/components/WelcomeScreen';
import { useWallet } from '@/hooks/useWallet';

const Home: React.FC = () => {
  const { isConnected } = useWallet();
  const [showExplore, setShowExplore] = useState(false);
  
  const handleExplore = () => {
    setShowExplore(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {isConnected ? (
          <>
            <WalletOverview />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TransactionHistory />
              </div>
              <div className="lg:col-span-1">
                <QuickActions />
              </div>
            </div>
          </>
        ) : (
          <WelcomeScreen onExplore={handleExplore} />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
