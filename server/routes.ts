import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertNetworkSchema, insertDappSchema, insertUserSchema } from "@shared/schema";

// Middleware to check if user is an admin
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // For demo purposes, we're using userId from query param
  // In a real app, this would come from authenticated session
  const userId = parseInt(req.query.adminId as string);
  
  if (isNaN(userId)) {
    return res.status(401).json({ message: "Unauthorized - Invalid admin ID" });
  }
  
  try {
    const user = await storage.getUser(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Forbidden - Admin access required" });
    }
    // Add user to request object for further use
    (req as any).adminUser = user;
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({ message: "Failed to verify admin status" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // ========================
  // PUBLIC ROUTES
  // ========================
  
  // GET all networks
  app.get("/api/networks", async (_req: Request, res: Response) => {
    try {
      const networks = await storage.getNetworks();
      return res.json(networks);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch networks" });
    }
  });

  // GET network by chainId
  app.get("/api/networks/chain/:chainId", async (req: Request, res: Response) => {
    try {
      const chainId = parseInt(req.params.chainId);
      if (isNaN(chainId)) {
        return res.status(400).json({ message: "Invalid chain ID" });
      }

      const network = await storage.getNetworkByChainId(chainId);
      if (!network) {
        return res.status(404).json({ message: "Network not found" });
      }

      return res.json(network);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch network" });
    }
  });

  // POST create new network
  app.post("/api/networks", async (req: Request, res: Response) => {
    try {
      const parsedData = insertNetworkSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid network data", 
          errors: parsedData.error.format() 
        });
      }

      // Check if network with this chainId already exists
      const existingNetwork = await storage.getNetworkByChainId(parsedData.data.chainId);
      if (existingNetwork) {
        return res.status(409).json({ 
          message: "A network with this chain ID already exists",
          network: existingNetwork
        });
      }
      
      const network = await storage.createNetwork(parsedData.data);
      return res.status(201).json(network);
    } catch (error) {
      console.error("Error creating network:", error);
      return res.status(500).json({ message: "Failed to create network" });
    }
  });

  // GET all dApps
  app.get("/api/dapps", async (_req: Request, res: Response) => {
    try {
      const dapps = await storage.getDapps();
      return res.json(dapps);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch dApps" });
    }
  });

  // POST save transaction
  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const transactionSchema = z.object({
        userId: z.number().optional(),
        hash: z.string(),
        from: z.string(),
        to: z.string(),
        value: z.string(),
        networkId: z.number(),
        status: z.string(),
      });

      const parsedData = transactionSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid transaction data", 
          errors: parsedData.error.format() 
        });
      }

      // Use default user ID 1 if not provided (demo purpose)
      const userId = parsedData.data.userId || 1;
      
      const transaction = await storage.createTransaction({
        ...parsedData.data,
        userId,
      });

      return res.status(201).json(transaction);
    } catch (error) {
      return res.status(500).json({ message: "Failed to save transaction" });
    }
  });

  // GET user transactions
  app.get("/api/transactions/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const transactions = await storage.getTransactions(userId);
      return res.json(transactions);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // GET or create user by wallet address
  app.post("/api/users/wallet", async (req: Request, res: Response) => {
    try {
      const walletSchema = z.object({
        walletAddress: z.string(),
        username: z.string().optional(),
      });

      const parsedData = walletSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid wallet data", 
          errors: parsedData.error.format() 
        });
      }

      let user = await storage.getUserByWalletAddress(parsedData.data.walletAddress);
      
      if (!user) {
        // Create a new user if one doesn't exist
        const username = parsedData.data.username || `user_${Date.now()}`;
        user = await storage.createUser({
          username,
          password: "wallet_" + Date.now(), // Generate a random password
          walletAddress: parsedData.data.walletAddress,
        });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: "Failed to process wallet user" });
    }
  });

  // ========================
  // ADMIN ROUTES
  // ========================
  
  // Admin login - Basic version for demo
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const loginSchema = z.object({
        username: z.string(),
        password: z.string()
      });
      
      const parsedData = loginSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid login data", 
          errors: parsedData.error.format() 
        });
      }
      
      const { username, password } = parsedData.data;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!user.isAdmin) {
        return res.status(403).json({ message: "User is not an admin" });
      }
      
      // In a real app, you would create a session and return a token
      // For demo purposes, we'll just return the user with their ID
      return res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      return res.status(500).json({ message: "Failed to login" });
    }
  });
  
  // Get all users - Admin only
  app.get("/api/admin/users", isAdmin, async (_req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      // Strip passwords before sending
      const safeUsers = users.map(user => ({
        ...user,
        password: undefined
      }));
      return res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Create user - Admin only
  app.post("/api/admin/users", isAdmin, async (req: Request, res: Response) => {
    try {
      const parsedData = insertUserSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: parsedData.error.format() 
        });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(parsedData.data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(parsedData.data);
      
      // Strip password before sending response
      const safeUser = {
        ...user,
        password: undefined
      };
      
      return res.status(201).json(safeUser);
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Get all transactions - Admin only
  app.get("/api/admin/transactions", isAdmin, async (_req: Request, res: Response) => {
    try {
      const transactions = await storage.getAllTransactions();
      return res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  
  // Create dApp - Admin only
  app.post("/api/admin/dapps", isAdmin, async (req: Request, res: Response) => {
    try {
      const parsedData = insertDappSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid dApp data", 
          errors: parsedData.error.format() 
        });
      }
      
      const dapp = await storage.createDapp(parsedData.data);
      return res.status(201).json(dapp);
    } catch (error) {
      console.error("Error creating dApp:", error);
      return res.status(500).json({ message: "Failed to create dApp" });
    }
  });
  
  // Update network - Admin only
  app.put("/api/admin/networks/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const networkId = parseInt(req.params.id);
      if (isNaN(networkId)) {
        return res.status(400).json({ message: "Invalid network ID" });
      }
      
      const network = await storage.getNetwork(networkId);
      if (!network) {
        return res.status(404).json({ message: "Network not found" });
      }
      
      const parsedData = insertNetworkSchema.partial().safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid network data", 
          errors: parsedData.error.format() 
        });
      }
      
      const updatedNetwork = await storage.updateNetwork(networkId, parsedData.data);
      return res.json(updatedNetwork);
    } catch (error) {
      console.error("Error updating network:", error);
      return res.status(500).json({ message: "Failed to update network" });
    }
  });
  
  // Delete network - Admin only
  app.delete("/api/admin/networks/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const networkId = parseInt(req.params.id);
      if (isNaN(networkId)) {
        return res.status(400).json({ message: "Invalid network ID" });
      }
      
      const network = await storage.getNetwork(networkId);
      if (!network) {
        return res.status(404).json({ message: "Network not found" });
      }
      
      // Don't allow deleting default network
      if (network.isDefault) {
        return res.status(403).json({ message: "Cannot delete default network" });
      }
      
      const success = await storage.deleteNetwork(networkId);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete network" });
      }
      
      return res.json({ message: "Network deleted successfully" });
    } catch (error) {
      console.error("Error deleting network:", error);
      return res.status(500).json({ message: "Failed to delete network" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
