import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/App";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Transaction {
  id: number;
  userId: number;
  hash: string;
  from: string;
  to: string;
  value: string;
  networkId: number;
  status: string;
  timestamp: string;
}

interface Network {
  id: number;
  name: string;
  symbol: string;
}

export default function AdminTransactions() {
  const { adminId } = useAuth();

  // Fetch all transactions
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["/api/admin/transactions", adminId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/transactions?adminId=${adminId}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
    enabled: !!adminId,
  });

  // Fetch networks for transaction display
  const { data: networks = [] } = useQuery({
    queryKey: ["/api/networks"],
    queryFn: async () => {
      const response = await fetch("/api/networks");
      if (!response.ok) throw new Error("Failed to fetch networks");
      return response.json();
    },
  });

  // Helper function to get network name
  const getNetworkName = (networkId: number): string => {
    const network = networks.find((n: Network) => n.id === networkId);
    return network ? network.name : "Unknown Network";
  };

  // Helper function to get network symbol
  const getNetworkSymbol = (networkId: number): string => {
    const network = networks.find((n: Network) => n.id === networkId);
    return network ? network.symbol : "ETH";
  };

  // Helper function to format transaction status
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800">
            Pending
          </Badge>
        );
      case "success":
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800">
            Success
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };

  // Helper function to truncate address
  const truncateAddress = (address: string): string => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <AdminLayout title="Transactions">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Hash</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx: Transaction) => (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.id}</TableCell>
                        <TableCell>{tx.userId}</TableCell>
                        <TableCell className="font-mono text-xs">
                          <a 
                            href={`${networks.find((n: Network) => n.id === tx.networkId)?.blockExplorerUrl}/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {truncateAddress(tx.hash)}
                          </a>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{truncateAddress(tx.from)}</TableCell>
                        <TableCell className="font-mono text-xs">{truncateAddress(tx.to)}</TableCell>
                        <TableCell>
                          {parseFloat(tx.value).toFixed(6)} {getNetworkSymbol(tx.networkId)}
                        </TableCell>
                        <TableCell>{getNetworkName(tx.networkId)}</TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell>{format(new Date(tx.timestamp), "MMM dd, yyyy HH:mm")}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}