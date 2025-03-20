import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Repeat, CreditCard, Box, Palette } from 'lucide-react';
import { TransactionModal } from './TransactionModal';
import DAppBrowser from './DAppBrowser';

const QuickActions: React.FC = () => {
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  
  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">Quick Actions</h3>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 h-auto"
              onClick={() => setIsSendModalOpen(true)}
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Send className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-gray-700">Send</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 h-auto"
              onClick={() => setIsSwapModalOpen(true)}
            >
              <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center mb-2">
                <Repeat className="h-4 w-4 text-purple-500" />
              </div>
              <span className="text-xs text-gray-700">Swap</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 h-auto"
              onClick={() => setIsBuyModalOpen(true)}
            >
              <div className="w-10 h-10 bg-pink-500/10 rounded-full flex items-center justify-center mb-2">
                <CreditCard className="h-4 w-4 text-pink-500" />
              </div>
              <span className="text-xs text-gray-700">Buy</span>
            </Button>
          </div>
          
          {/* DApp Browser Component */}
          <DAppBrowser />
        </CardContent>
      </Card>
      
      {/* Transaction Modals */}
      <TransactionModal 
        isOpen={isSendModalOpen} 
        onClose={() => setIsSendModalOpen(false)} 
        type="send" 
      />
      
      <TransactionModal 
        isOpen={isSwapModalOpen} 
        onClose={() => setIsSwapModalOpen(false)} 
        type="swap" 
      />
      
      <TransactionModal 
        isOpen={isBuyModalOpen} 
        onClose={() => setIsBuyModalOpen(false)} 
        type="buy" 
      />
    </>
  );
};

export default QuickActions;
