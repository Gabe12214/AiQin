import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/App";
import { apiRequest } from "@/lib/queryClient";
import { useWallet } from "@/hooks/useWallet";
import DAppBrowser from "@/components/DAppBrowser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function UserDapps() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { 
    isConnected, 
    account: walletAddress,
    currentNetwork 
  } = useWallet();
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Get available dapps
  const { data: dapps = [], isLoading: isLoadingDapps } = useQuery({
    queryKey: ['/api/dapps'],
    queryFn: () => 
      apiRequest({
        method: "GET",
        url: "/api/dapps",
      }),
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 pt-8 max-w-screen-lg">
        <header className="mb-8 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">DApp Browser</h1>
            <p className="text-muted-foreground">
              Explore and connect to decentralized applications
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Decentralized Applications</CardTitle>
            <CardDescription>
              Browse and interact with the Web3 ecosystem
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <p className="text-muted-foreground mb-4">
                  Connect your wallet to interact with DApps
                </p>
                <Button onClick={() => navigate("/wallet")}>
                  Go to Wallet
                </Button>
              </div>
            ) : (
              <DAppBrowser 
                dapps={dapps} 
                isLoading={isLoadingDapps}
                walletAddress={walletAddress}
                network={currentNetwork}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}