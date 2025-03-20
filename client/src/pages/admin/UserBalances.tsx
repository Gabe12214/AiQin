import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, PlusCircle, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Network } from "@/hooks/useWallet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: number;
  username: string;
  walletAddress: string | null;
  isAdmin: boolean;
  createdAt: string;
}

interface BalanceUpdateData {
  userId: number;
  networkId: number;
  amount: string;
  operation: 'add' | 'subtract' | 'set';
}

export default function AdminUserBalances() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<number>(0);
  const [amount, setAmount] = useState<string>("");
  const [operation, setOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: () => apiRequest({
      method: "GET",
      url: "/api/admin/users"
    })
  });

  // Fetch networks
  const { data: networks = [], isLoading: isLoadingNetworks } = useQuery({
    queryKey: ['/api/networks'],
    queryFn: () => apiRequest({
      method: "GET",
      url: "/api/networks"
    })
  });

  // Fetch user balances
  const { data: userBalances = {}, isLoading: isLoadingBalances, refetch: refetchBalances } = useQuery({
    queryKey: ['/api/admin/user-balances', selectedUser?.id],
    queryFn: () => apiRequest({
      method: "GET",
      url: `/api/admin/user-balances/${selectedUser?.id}`
    }),
    enabled: !!selectedUser,
  });

  // Update user balance mutation
  const updateBalanceMutation = useMutation({
    mutationFn: (balanceData: BalanceUpdateData) => {
      return apiRequest({
        method: "POST",
        url: "/api/admin/user-balances",
        body: balanceData
      });
    },
    onSuccess: () => {
      toast({
        title: "Balance updated",
        description: "User balance has been updated successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-balances', selectedUser?.id] });
      setIsUpdateDialogOpen(false);
      setAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update user balance",
        variant: "destructive",
      });
    }
  });

  const handleOpenUpdateDialog = (user: User) => {
    setSelectedUser(user);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateBalance = () => {
    if (!selectedUser || !selectedNetwork || !amount) {
      toast({
        title: "Missing information",
        description: "Please select a network and enter an amount",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    updateBalanceMutation.mutate({
      userId: selectedUser.id,
      networkId: selectedNetwork,
      amount: amount,
      operation: operation
    });
  };

  return (
    <AdminLayout title="User Balances">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Balance Management</CardTitle>
            <CardDescription>
              View and modify user wallet balances across different networks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Wallet Address</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user: User) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            {user.walletAddress ? (
                              <span className="font-mono text-xs">
                                {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(user.walletAddress.length - 4)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Not connected</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleOpenUpdateDialog(user)}
                              disabled={!user.walletAddress}
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Manage Balance
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Balance Update Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update User Balance</DialogTitle>
              <DialogDescription>
                {selectedUser && (
                  <span>
                    Modify the balance for <strong>{selectedUser.username}</strong>
                    {selectedUser.walletAddress && (
                      <span className="block font-mono text-xs mt-1">
                        Wallet: {selectedUser.walletAddress.substring(0, 6)}...{selectedUser.walletAddress.substring(selectedUser.walletAddress.length - 4)}
                      </span>
                    )}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="network">Network</Label>
                  <Select
                    value={selectedNetwork.toString()}
                    onValueChange={(value) => setSelectedNetwork(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      {networks.map((network: Network) => (
                        <SelectItem key={network.id} value={network.id.toString()}>
                          {network.name} ({network.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedUser && selectedNetwork > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Balance:</span>
                    <div className="flex items-center gap-2">
                      {isLoadingBalances ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="font-medium">
                          {userBalances[selectedNetwork] || "0"}
                          <span className="text-muted-foreground ml-1">
                            {networks.find((n: Network) => n.id === selectedNetwork)?.symbol}
                          </span>
                        </span>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => refetchBalances()}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="operation">Operation</Label>
                  <Select
                    value={operation}
                    onValueChange={(value) => setOperation(value as 'add' | 'subtract' | 'set')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add to balance</SelectItem>
                      <SelectItem value="subtract">Subtract from balance</SelectItem>
                      <SelectItem value="set">Set to specific amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    step="0.000001"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateBalance}
                disabled={updateBalanceMutation.isPending}
                className="ml-2"
              >
                {updateBalanceMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Update Balance
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}