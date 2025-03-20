import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { connectWallet } from "@/lib/ethers";

export default function UserLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleRegularLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Required fields",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await apiRequest({
        method: "POST",
        url: "/api/login",
        body: { username, password },
      });
      
      if (result.success) {
        login(result.user);
        toast({
          title: "Login successful",
          description: `Welcome back, ${result.user.username}!`,
        });
        navigate("/wallet");
      } else {
        toast({
          title: "Login failed",
          description: result.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    setConnectingWallet(true);
    
    try {
      const accounts = await connectWallet();
      
      if (accounts && accounts.length > 0) {
        const walletAddress = accounts[0];
        
        const result = await apiRequest({
          method: "POST",
          url: "/api/users/wallet",
          body: { walletAddress },
        });
        
        login({
          id: result.id,
          username: result.username,
          isAdmin: result.isAdmin || false
        });
        
        toast({
          title: "Wallet connected",
          description: "You've successfully connected your wallet",
        });
        
        navigate("/wallet");
      } else {
        toast({
          title: "Connection failed",
          description: "No accounts found. Please make sure your wallet is unlocked.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setConnectingWallet(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AIQin Wallet
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Your gateway to blockchain applications
          </p>
        </div>
        
        <Card className="border-2 border-blue-100 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-xl">Connect Wallet</CardTitle>
            <CardDescription>
              Connect with your existing crypto wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleConnectWallet}
              disabled={connectingWallet}
            >
              {connectingWallet ? "Connecting..." : "Connect with MetaMask"}
            </Button>
          </CardContent>
        </Card>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-100 dark:bg-gray-900 px-3 text-gray-500 dark:text-gray-400 text-sm">
              Or login with username
            </span>
          </div>
        </div>
        
        <Card>
          <form onSubmit={handleRegularLogin}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}