import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/App";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { getAccounts } from "@/lib/ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Network } from "@/hooks/useWallet";
import { TransactionModal } from "@/components/TransactionModal";
import NetworkSelector from "@/components/NetworkSelector";
import TransactionHistory from "@/components/TransactionHistory";
import DAppBrowser from "@/components/DAppBrowser";
import { apiRequest } from "@/lib/queryClient";

import { Copy, ExternalLink, LogOut, Send, Download, Wallet as WalletIcon, RefreshCw } from "lucide-react";

export default function UserWallet() {
  const [transactionType, setTransactionType] = useState<'send' | 'swap' | 'buy' | null>(null);
  const [activeTab, setActiveTab] = useState("assets");
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const {
    selectedNetwork,
    networks,
    isLoadingNetworks,
    handleNetworkSelect,
    walletAddress,
    walletBalance,
    isConnected,
    isLoadingBalance,
    handleConnectWallet,
    refreshBalance,
  } = useWallet();

  // Get user's wallet address from the auth context or try to connect
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (!isConnected) {
        try {
          const accounts = await getAccounts();
          if (accounts && accounts.length > 0 && user) {
            // Update user's wallet address in the database
            await apiRequest({
              method: "POST",
              url: "/api/users/wallet",
              body: { 
                userId: user.id,
                walletAddress: accounts[0]
              },
            });
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };
    
    checkWalletConnection();
  }, [isConnected, user]);

  // Get user's transactions
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['/api/transactions', user?.id],
    queryFn: () => 
      apiRequest({
        method: "GET",
        url: `/api/transactions/${user?.id}`,
      }),
    enabled: !!user?.id,
  });

  // Get available dapps
  const { data: dapps = [], isLoading: isLoadingDapps } = useQuery({
    queryKey: ['/api/dapps'],
    queryFn: () => 
      apiRequest({
        method: "GET",
        url: "/api/dapps",
      }),
  });

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleViewOnExplorer = () => {
    if (walletAddress && selectedNetwork) {
      const explorerUrl = `${selectedNetwork.blockExplorerUrl}/address/${walletAddress}`;
      window.open(explorerUrl, "_blank");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Truncate wallet address for display
  const truncateAddress = (address: string) => {
    if (!address) return "";
    return address.substring(0, 6) + "..." + address.substring(address.length - 4);
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Main layout */}
      <main className="container mx-auto p-4 pt-8 max-w-screen-lg">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          
          {/* Left sidebar with wallet info */}
          <div className="w-full md:w-1/3 space-y-4">
            <Card className="border-2 border-primary/10">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <WalletIcon className="h-5 w-5 text-primary" />
                    My Wallet
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {isConnected ? (
                  <>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-muted-foreground">
                        {user.username}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={handleCopyAddress}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleViewOnExplorer}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="px-3 py-2 bg-muted rounded-lg">
                      <code className="text-sm font-mono">
                        {truncateAddress(walletAddress || "")}
                      </code>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                          {isLoadingBalance ? (
                            <div className="h-7 w-24 animate-pulse bg-muted rounded"></div>
                          ) : (
                            <>
                              {walletBalance} {selectedNetwork?.symbol}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7" 
                                onClick={refreshBalance}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isLoadingBalance ? (
                            <div className="h-4 w-16 animate-pulse bg-muted rounded"></div>
                          ) : (
                            "$ 0.00 USD"
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button 
                        className="bg-primary"
                        onClick={() => setTransactionType("send")}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setTransactionType("buy")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Receive
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="py-4 flex flex-col items-center justify-center space-y-4">
                    <div className="text-center">
                      <p className="text-muted-foreground">
                        Connect your wallet to start using the app
                      </p>
                    </div>
                    <Button onClick={handleConnectWallet} className="w-full">
                      Connect Wallet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Network</CardTitle>
                <CardDescription>
                  Select a blockchain network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NetworkSelector 
                  networks={networks} 
                  selectedNetwork={selectedNetwork} 
                  onNetworkSelect={handleNetworkSelect}
                  isLoading={isLoadingNetworks}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="w-full md:w-2/3">
            <Card>
              <CardHeader className="pb-2">
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="assets">Assets</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="dapps">DApps</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent>
                <TabsContent value="assets" className="mt-0 space-y-4">
                  <div className="rounded-md bg-muted p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">
                          {selectedNetwork?.name || "Ethereum"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Native Token
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {walletBalance} {selectedNetwork?.symbol}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          $ 0.00 USD
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center text-muted-foreground py-8">
                    <p>No tokens found in this network</p>
                    <Button variant="link" onClick={() => setTransactionType("buy")}>
                      Buy some tokens
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="activity" className="mt-0">
                  <TransactionHistory 
                    transactions={transactions} 
                    isLoading={isLoadingTransactions}
                    networks={networks}
                  />
                </TabsContent>
                
                <TabsContent value="dapps" className="mt-0">
                  <DAppBrowser 
                    dapps={dapps} 
                    isLoading={isLoadingDapps}
                    walletAddress={walletAddress}
                    network={selectedNetwork}
                  />
                </TabsContent>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Transaction Modals */}
      {transactionType && (
        <TransactionModal
          isOpen={!!transactionType}
          onClose={() => setTransactionType(null)}
          type={transactionType}
        />
      )}
    </div>
  );
}