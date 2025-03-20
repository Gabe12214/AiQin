import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertNetworkSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
