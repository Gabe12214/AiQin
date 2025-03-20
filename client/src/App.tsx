import { createContext, useState, useContext, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";

// We'll create these admin pages next
const AdminLogin = () => <div>Admin Login</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;
const AdminUsers = () => <div>Admin Users</div>;
const AdminNetworks = () => <div>Admin Networks</div>;
const AdminTransactions = () => <div>Admin Transactions</div>;
const AdminDapps = () => <div>Admin DApps</div>;

// Auth context for admin
interface AuthContextType {
  isAuthenticated: boolean;
  adminId: number | null;
  login: (adminId: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  adminId: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Auth Provider
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminId, setAdminId] = useState<number | null>(
    localStorage.getItem("adminId") ? parseInt(localStorage.getItem("adminId") as string) : null
  );
  
  const login = (adminId: number) => {
    localStorage.setItem("adminId", adminId.toString());
    setAdminId(adminId);
  };
  
  const logout = () => {
    localStorage.removeItem("adminId");
    setAdminId(null);
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated: !!adminId, adminId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Admin route wrapper that redirects to login if not authenticated
const AdminRoute: React.FC<{ path: string; component: React.ComponentType }> = ({ path, component }) => {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);
  
  return isAuthenticated ? <Route path={path} component={component} /> : null;
};

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <AdminRoute path="/admin" component={AdminDashboard} />
      <AdminRoute path="/admin/users" component={AdminUsers} />
      <AdminRoute path="/admin/networks" component={AdminNetworks} />
      <AdminRoute path="/admin/transactions" component={AdminTransactions} />
      <AdminRoute path="/admin/dapps" component={AdminDapps} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
