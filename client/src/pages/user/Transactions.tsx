import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/App";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useWallet } from "@/hooks/useWallet";
import TransactionHistory from "@/components/TransactionHistory";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

export default function UserTransactions() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { availableNetworks: networks } = useWallet();
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

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
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground">
              View all your blockchain transactions
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              Your complete transaction activity across all networks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistory 
              transactions={transactions} 
              isLoading={isLoadingTransactions}
              networks={networks}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}