import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/App";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { Pencil, Trash2 } from "lucide-react";

interface Network {
  id: number;
  name: string;
  chainId: number;
  rpcUrl: string;
  symbol: string;
  blockExplorerUrl: string;
  isDefault: boolean;
}

interface NetworkFormData {
  name: string;
  chainId: number;
  rpcUrl: string;
  symbol: string;
  blockExplorerUrl: string;
  isDefault: boolean;
}

export default function AdminNetworks() {
  const { adminId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [formData, setFormData] = useState<NetworkFormData>({
    name: "",
    chainId: 0,
    rpcUrl: "",
    symbol: "",
    blockExplorerUrl: "",
    isDefault: false,
  });

  // Fetch networks
  const { data: networks = [], isLoading } = useQuery({
    queryKey: ["/api/networks"],
    queryFn: async () => {
      const response = await fetch("/api/networks");
      if (!response.ok) throw new Error("Failed to fetch networks");
      return response.json();
    },
  });

  // Create network mutation
  const createNetworkMutation = useMutation({
    mutationFn: (networkData: NetworkFormData) => {
      return apiRequest({
        method: "POST",
        url: "/api/networks",
        body: networkData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/networks"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Network created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create network",
        variant: "destructive",
      });
    },
  });

  // Update network mutation
  const updateNetworkMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NetworkFormData> }) => {
      return apiRequest({
        method: "PUT",
        url: `/api/admin/networks/${id}?adminId=${adminId}`,
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/networks"] });
      setIsEditDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Network updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update network",
        variant: "destructive",
      });
    },
  });

  // Delete network mutation
  const deleteNetworkMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest({
        method: "DELETE",
        url: `/api/admin/networks/${id}?adminId=${adminId}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/networks"] });
      setIsDeleteDialogOpen(false);
      setSelectedNetwork(null);
      toast({
        title: "Success",
        description: "Network deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete network",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isDefault: checked,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      chainId: 0,
      rpcUrl: "",
      symbol: "",
      blockExplorerUrl: "",
      isDefault: false,
    });
  };

  const handleEdit = (network: Network) => {
    setSelectedNetwork(network);
    setFormData({
      name: network.name,
      chainId: network.chainId,
      rpcUrl: network.rpcUrl,
      symbol: network.symbol,
      blockExplorerUrl: network.blockExplorerUrl,
      isDefault: network.isDefault,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (network: Network) => {
    setSelectedNetwork(network);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createNetworkMutation.mutate(formData);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNetwork) {
      updateNetworkMutation.mutate({
        id: selectedNetwork.id,
        data: formData,
      });
    }
  };

  const confirmDelete = () => {
    if (selectedNetwork) {
      deleteNetworkMutation.mutate(selectedNetwork.id);
    }
  };

  return (
    <AdminLayout title="Networks Management">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Blockchain Networks</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>Add New Network</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Blockchain Network</DialogTitle>
                <DialogDescription>
                  Add a new blockchain network to the wallet.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Network Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., Ethereum"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="chainId">Chain ID</Label>
                    <Input
                      id="chainId"
                      name="chainId"
                      type="number"
                      placeholder="e.g., 1"
                      value={formData.chainId || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="rpcUrl">RPC URL</Label>
                    <Input
                      id="rpcUrl"
                      name="rpcUrl"
                      placeholder="e.g., https://mainnet.infura.io/v3/"
                      value={formData.rpcUrl}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="symbol">Currency Symbol</Label>
                    <Input
                      id="symbol"
                      name="symbol"
                      placeholder="e.g., ETH"
                      value={formData.symbol}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="blockExplorerUrl">Block Explorer URL</Label>
                    <Input
                      id="blockExplorerUrl"
                      name="blockExplorerUrl"
                      placeholder="e.g., https://etherscan.io"
                      value={formData.blockExplorerUrl}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDefault"
                      checked={formData.isDefault}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="isDefault">Default Network</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createNetworkMutation.isPending}>
                    {createNetworkMutation.isPending ? "Adding..." : "Add Network"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Network</DialogTitle>
                <DialogDescription>
                  Update the blockchain network details.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Network Name</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-chainId">Chain ID</Label>
                    <Input
                      id="edit-chainId"
                      name="chainId"
                      type="number"
                      value={formData.chainId || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-rpcUrl">RPC URL</Label>
                    <Input
                      id="edit-rpcUrl"
                      name="rpcUrl"
                      value={formData.rpcUrl}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-symbol">Currency Symbol</Label>
                    <Input
                      id="edit-symbol"
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-blockExplorerUrl">Block Explorer URL</Label>
                    <Input
                      id="edit-blockExplorerUrl"
                      name="blockExplorerUrl"
                      value={formData.blockExplorerUrl}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-isDefault"
                      checked={formData.isDefault}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="edit-isDefault">Default Network</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={updateNetworkMutation.isPending}>
                    {updateNetworkMutation.isPending ? "Updating..." : "Update Network"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the "{selectedNetwork?.name}" network.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteNetworkMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Chain ID</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {networks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No networks found
                    </TableCell>
                  </TableRow>
                ) : (
                  networks.map((network: Network) => (
                    <TableRow key={network.id}>
                      <TableCell>{network.id}</TableCell>
                      <TableCell className="font-medium">{network.name}</TableCell>
                      <TableCell>{network.chainId}</TableCell>
                      <TableCell>{network.symbol}</TableCell>
                      <TableCell>
                        {network.isDefault ? (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                            Yes
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                            No
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(network)}
                          className="mr-2"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(network)}
                          disabled={network.isDefault}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}