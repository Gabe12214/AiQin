import { createContext, useState, useContext, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import UserDashboard from "@/pages/user/Dashboard";
import UserWallet from "@/pages/user/Wallet";
import UserTransactions from "@/pages/user/Transactions";
import UserDapps from "@/pages/user/Dapps";
import UserLogin from "@/pages/user/Login";

// Admin pages
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminNetworks from "@/pages/admin/Networks";
import AdminTransactions from "@/pages/admin/Transactions";
import AdminDapps from "@/pages/admin/Dapps";
import AdminUserBalances from "@/pages/admin/UserBalances";

// Auth context 
interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Auth Provider
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error("Failed to parse user from localStorage");
        return null;
      }
    }
    return null;
  });
  
  const isAuthenticated = !!user;
  const isAdmin = !!user?.isAdmin;
  
  const login = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };
  
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected route that requires user authentication
const ProtectedRoute: React.FC<{ 
  path: string; 
  component: React.ComponentType;
  requireAdmin?: boolean;
}> = ({ path, component, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(requireAdmin ? "/admin/login" : "/login");
    } else if (requireAdmin && !isAdmin) {
      // Redirect non-admin users trying to access admin routes
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, navigate, requireAdmin]);
  
  // Only render if user meets the authentication requirements
  if (!isAuthenticated) return null;
  if (requireAdmin && !isAdmin) return null;
  
  return <Route path={path} component={component} />;
};

// Admin route is just a specialized protected route
const AdminRoute: React.FC<{ path: string; component: React.ComponentType }> = ({ path, component }) => {
  return <ProtectedRoute path={path} component={component} requireAdmin={true} />;
};

// User route is a protected route that doesn't require admin
const UserRoute: React.FC<{ path: string; component: React.ComponentType }> = ({ path, component }) => {
  return <ProtectedRoute path={path} component={component} requireAdmin={false} />;
};

function AppRouter() {
  const { isAdmin } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={isAdmin ? AdminDashboard : Home} />
      <Route path="/login" component={UserLogin} />
      
      {/* User routes */}
      <UserRoute path="/dashboard" component={UserDashboard} />
      <UserRoute path="/wallet" component={UserWallet} />
      <UserRoute path="/transactions" component={UserTransactions} />
      <UserRoute path="/dapps" component={UserDapps} />
      
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <AdminRoute path="/admin" component={AdminDashboard} />
      <AdminRoute path="/admin/users" component={AdminUsers} />
      <AdminRoute path="/admin/networks" component={AdminNetworks} />
      <AdminRoute path="/admin/transactions" component={AdminTransactions} />
      <AdminRoute path="/admin/dapps" component={AdminDapps} />
      <AdminRoute path="/admin/user-balances" component={AdminUserBalances} />
      
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
