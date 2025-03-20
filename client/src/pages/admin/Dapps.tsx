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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

interface Dapp {
  id: number;
  name: string;
  url: string;
  description: string;
  category: string;
  logoUrl: string;
}

interface DappFormData {
  name: string;
  url: string;
  description: string;
  category: string;
  logoUrl: string;
}

export default function AdminDapps() {
  const { adminId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDapp, setSelectedDapp] = useState<Dapp | null>(null);
  const [formData, setFormData] = useState<DappFormData>({
    name: "",
    url: "",
    description: "",
    category: "DeFi",
    logoUrl: "",
  });

  // Fetch dapps
  const { data: dapps = [], isLoading } = useQuery({
    queryKey: ["/api/dapps"],
    queryFn: async () => {
      const response = await fetch("/api/dapps");
      if (!response.ok) throw new Error("Failed to fetch dapps");
      return response.json();
    },
  });

  // Create dapp mutation
  const createDappMutation = useMutation({
    mutationFn: (dappData: DappFormData) => {
      return apiRequest({
        method: "POST",
        url: `/api/admin/dapps?adminId=${adminId}`,
        body: dappData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dapps"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "DApp created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create DApp",
        variant: "destructive",
      });
    },
  });

  // For a full implementation, we would also add update and delete mutations here.
  // They are not shown in the provided routes, but would be similar to the ones for networks.

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      description: "",
      category: "DeFi",
      logoUrl: "",
    });
  };

  const handleEdit = (dapp: Dapp) => {
    setSelectedDapp(dapp);
    setFormData({
      name: dapp.name,
      url: dapp.url,
      description: dapp.description,
      category: dapp.category,
      logoUrl: dapp.logoUrl,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (dapp: Dapp) => {
    setSelectedDapp(dapp);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDappMutation.mutate(formData);
  };

  // In a full implementation, these would be connected to their respective mutations
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Update Not Implemented",
      description: "This functionality would update the DApp in a full implementation.",
    });
    setIsEditDialogOpen(false);
  };

  const confirmDelete = () => {
    toast({
      title: "Delete Not Implemented",
      description: "This functionality would delete the DApp in a full implementation.",
    });
    setIsDeleteDialogOpen(false);
  };

  const categories = [
    "DeFi",
    "NFT",
    "Gaming",
    "Social",
    "Utility",
    "Exchange",
    "Wallet",
    "Other",
  ];

  return (
    <AdminLayout title="DApps Management">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Decentralized Applications</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>Add New DApp</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New DApp</DialogTitle>
                <DialogDescription>
                  Add a new decentralized application to the wallet.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">DApp Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., Uniswap"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      name="url"
                      placeholder="e.g., https://app.uniswap.org"
                      value={formData.url}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the DApp's functionality"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={handleCategoryChange}
                      name="category"
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      name="logoUrl"
                      placeholder="URL to the DApp's logo"
                      value={formData.logoUrl}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createDappMutation.isPending}>
                    {createDappMutation.isPending ? "Adding..." : "Add DApp"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit DApp</DialogTitle>
                <DialogDescription>
                  Update the decentralized application details.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateSubmit}>
                <div className="grid gap-4 py-4">
                  {/* Same form fields as create */}
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">DApp Name</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-url">URL</Label>
                    <Input
                      id="edit-url"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={handleCategoryChange}
                      name="category"
                    >
                      <SelectTrigger id="edit-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-logoUrl">Logo URL</Label>
                    <Input
                      id="edit-logoUrl"
                      name="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Update DApp</Button>
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
                  This will permanently delete the "{selectedDapp?.name}" DApp.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
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
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dapps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No DApps found
                    </TableCell>
                  </TableRow>
                ) : (
                  dapps.map((dapp: Dapp) => (
                    <TableRow key={dapp.id}>
                      <TableCell>{dapp.id}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {dapp.logoUrl && (
                            <img
                              src={dapp.logoUrl}
                              alt={dapp.name}
                              className="w-6 h-6 mr-2 rounded-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          {dapp.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                          {dapp.category}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {dapp.description}
                      </TableCell>
                      <TableCell>
                        <a
                          href={dapp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center dark:text-blue-400"
                        >
                          <span className="truncate max-w-[120px]">{dapp.url}</span>
                          <ExternalLink size={14} className="ml-1" />
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(dapp)}
                          className="mr-2"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(dapp)}
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