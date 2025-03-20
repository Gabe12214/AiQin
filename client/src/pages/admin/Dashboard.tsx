import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/App";
import { Users, Globe, ArrowUpDown, FileText } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  loading?: boolean;
}

const StatCard = ({ title, value, description, icon, loading }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        ) : (
          value
        )}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const { adminId } = useAuth();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalNetworks, setTotalNetworks] = useState<number>(0);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [totalDapps, setTotalDapps] = useState<number>(0);

  // Users query
  const usersQuery = useQuery({
    queryKey: ["/api/admin/users", adminId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users?adminId=${adminId}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
    enabled: !!adminId,
  });

  // Networks query
  const networksQuery = useQuery({
    queryKey: ["/api/networks"],
    queryFn: async () => {
      const response = await fetch("/api/networks");
      if (!response.ok) throw new Error("Failed to fetch networks");
      return response.json();
    },
  });

  // Transactions query
  const transactionsQuery = useQuery({
    queryKey: ["/api/admin/transactions", adminId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/transactions?adminId=${adminId}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
    enabled: !!adminId,
  });

  // Dapps query
  const dappsQuery = useQuery({
    queryKey: ["/api/dapps"],
    queryFn: async () => {
      const response = await fetch("/api/dapps");
      if (!response.ok) throw new Error("Failed to fetch dapps");
      return response.json();
    },
  });

  useEffect(() => {
    if (usersQuery.data) {
      setTotalUsers(usersQuery.data.length);
    }
    
    if (networksQuery.data) {
      setTotalNetworks(networksQuery.data.length);
    }
    
    if (transactionsQuery.data) {
      setTotalTransactions(transactionsQuery.data.length);
    }
    
    if (dappsQuery.data) {
      setTotalDapps(dappsQuery.data.length);
    }
  }, [usersQuery.data, networksQuery.data, transactionsQuery.data, dappsQuery.data]);

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          description="Total registered users"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={usersQuery.isLoading}
        />
        <StatCard
          title="Total Networks"
          value={totalNetworks}
          description="Supported blockchain networks"
          icon={<Globe className="h-4 w-4 text-muted-foreground" />}
          loading={networksQuery.isLoading}
        />
        <StatCard
          title="Transactions"
          value={totalTransactions}
          description="Total processed transactions"
          icon={<ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
          loading={transactionsQuery.isLoading}
        />
        <StatCard
          title="DApps"
          value={totalDapps}
          description="Integrated DApps"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          loading={dappsQuery.isLoading}
        />
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to AIQin Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This dashboard gives you an overview of your multi-chain wallet application.
              Use the sidebar to navigate to different sections and manage your blockchain
              application ecosystem.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}