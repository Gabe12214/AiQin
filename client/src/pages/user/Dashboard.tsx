import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/App";
import { useWallet } from "@/hooks/useWallet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { Activity, Layers, Compass, BarChart3, Wallet as WalletIcon, ArrowUpRight } from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { 
    isConnected, 
    account: walletAddress, 
    balance, 
    currentNetwork, 
    handleConnect 
  } = useWallet();
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Redirect to wallet page
  const goToWallet = () => {
    navigate("/wallet");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 pt-8 max-w-screen-lg">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user.username}</h1>
          <p className="text-muted-foreground">
            Your digital wallet dashboard
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isConnected ? `${balance} ${currentNetwork?.symbol || 'ETH'}` : 'Connect Wallet'}
              </div>
              <p className="text-xs text-muted-foreground">
                {isConnected ? 'Your current balance on this network' : 'Connect your wallet to view your balance'}
              </p>
              {!isConnected && (
                <Button onClick={handleConnect} className="mt-2 w-full">
                  Connect Wallet
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Wallet Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-md font-mono">
                {isConnected ? formatAddress(walletAddress || '') : '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                {isConnected ? 'Your current wallet address' : 'No wallet connected'}
              </p>
              {isConnected && (
                <Button variant="outline" onClick={goToWallet} className="mt-2 w-full">
                  View Wallet
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-md">
                {currentNetwork?.name || 'Not Connected'}
              </div>
              <p className="text-xs text-muted-foreground">
                {isConnected ? `Chain ID: ${currentNetwork?.chainId || 'Unknown'}` : 'Connect wallet to view network'}
              </p>
              {isConnected && (
                <Button variant="outline" onClick={goToWallet} className="mt-2 w-full">
                  Switch Network
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Gas Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-md">
                {isConnected ? '25 Gwei' : '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                Current gas price on the network
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your crypto assets and applications
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-auto flex flex-col items-center justify-center p-4 gap-2"
                onClick={() => navigate("/wallet")}
              >
                <WalletIcon className="h-6 w-6" />
                <span>Wallet</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto flex flex-col items-center justify-center p-4 gap-2"
                onClick={() => navigate("/transactions")}
              >
                <Activity className="h-6 w-6" />
                <span>Transactions</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto flex flex-col items-center justify-center p-4 gap-2"
                onClick={() => navigate("/dapps")}
              >
                <Compass className="h-6 w-6" />
                <span>DApps</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto flex flex-col items-center justify-center p-4 gap-2"
                onClick={() => window.open(
                  currentNetwork?.blockExplorerUrl || "https://etherscan.io", 
                  "_blank"
                )}
              >
                <ArrowUpRight className="h-6 w-6" />
                <span>Explorer</span>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest blockchain activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isConnected ? (
                <div className="text-center text-muted-foreground py-10">
                  <p>No recent transactions</p>
                  <Button variant="link" onClick={() => navigate("/transactions")}>
                    View all transactions
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <p>Connect your wallet to view transactions</p>
                  <Button onClick={handleConnect} className="mt-2">
                    Connect Wallet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>DApp Recommendations</CardTitle>
              <CardDescription>
                Popular decentralized applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-10">
                <p>Explore decentralized applications</p>
                <Button variant="link" onClick={() => navigate("/dapps")}>
                  View all DApps
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}