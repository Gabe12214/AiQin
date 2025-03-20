import { useState } from "react";
import { ExternalLink, Search, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Network } from "@/hooks/useWallet";

interface Dapp {
  id: number;
  name: string;
  url: string;
  description: string;
  category: string;
  logoUrl: string;
}

interface DAppBrowserProps {
  dapps: Dapp[];
  isLoading: boolean;
  walletAddress?: string | null;
  network: Network | null;
}

export default function DAppBrowser({ dapps, isLoading, walletAddress, network }: DAppBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Get unique categories from dapps
  const categories = ["all", ...Array.from(new Set(dapps.map(dapp => dapp.category.toLowerCase())))];
  
  // Filter dapps based on search query and category
  const filteredDapps = dapps.filter(dapp => {
    const matchesSearch = dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dapp.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || 
                           dapp.category.toLowerCase() === activeCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const launchDapp = (url: string) => {
    // Append wallet address as a query parameter if provided
    const dappUrl = walletAddress ? 
      `${url}${url.includes('?') ? '&' : '?'}wallet=${walletAddress}&chainId=${network?.chainId || 1}` : 
      url;
    
    window.open(dappUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex w-full mb-4">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
              <Skeleton className="h-20 w-full mt-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search dApps..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs 
          defaultValue="all" 
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full sm:w-auto"
        >
          <TabsList className="h-10">
            {categories.slice(0, 4).map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
            {categories.length > 4 && (
              <TabsTrigger value="more">More...</TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </div>

      {filteredDapps.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p>No dApps found</p>
          <p className="text-sm mt-2">Try a different search term or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDapps.map(dapp => (
            <Card key={dapp.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {dapp.logoUrl ? (
                      <img 
                        src={dapp.logoUrl} 
                        alt={`${dapp.name} logo`} 
                        className="w-10 h-10 rounded-md mr-3 object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center mr-3">
                        <Globe className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{dapp.name}</CardTitle>
                      <Badge variant="outline" className="text-xs capitalize mt-1">
                        {dapp.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {dapp.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                >
                  <a href={dapp.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    Visit site
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => launchDapp(dapp.url)}
                  disabled={!walletAddress}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Connect
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}