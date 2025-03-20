import { 
  users, type User, type InsertUser,
  networks, type Network, type InsertNetwork,
  transactions, type Transaction, type InsertTransaction,
  dapps, type Dapp, type InsertDapp
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { db } from "./database";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWalletAddress(id: number, walletAddress: string): Promise<User | undefined>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Network methods
  getNetworks(): Promise<Network[]>;
  getNetwork(id: number): Promise<Network | undefined>;
  getNetworkByChainId(chainId: number): Promise<Network | undefined>;
  createNetwork(network: InsertNetwork): Promise<Network>;
  updateNetwork(id: number, networkData: Partial<InsertNetwork>): Promise<Network | undefined>;
  deleteNetwork(id: number): Promise<boolean>;
  
  // Transaction methods
  getTransactions(userId: number): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Dapp methods
  getDapps(): Promise<Dapp[]>;
  getDapp(id: number): Promise<Dapp | undefined>;
  createDapp(dapp: InsertDapp): Promise<Dapp>;
  updateDapp(id: number, dappData: Partial<InsertDapp>): Promise<Dapp | undefined>;
  deleteDapp(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private networks: Map<number, Network>;
  private transactions: Map<number, Transaction>;
  private dapps: Map<number, Dapp>;
  currentUserId: number;
  currentNetworkId: number;
  currentTransactionId: number;
  currentDappId: number;

  constructor() {
    this.users = new Map();
    this.networks = new Map();
    this.transactions = new Map();
    this.dapps = new Map();
    this.currentUserId = 1;
    this.currentNetworkId = 1;
    this.currentTransactionId = 1;
    this.currentDappId = 1;
    
    // Initialize with default networks and data
    this.initDefaultNetworks();
    this.initDefaultDapps();
    
    // Create admin user
    this.createUser({
      username: "admin",
      password: "admin123", // For a real app, this would be hashed
      isAdmin: true
    });
  }

  private initDefaultNetworks() {
    const defaultNetworks: InsertNetwork[] = [
      {
        name: "Ethereum",
        chainId: 1,
        rpcUrl: "https://mainnet.infura.io/v3/",
        symbol: "ETH",
        blockExplorerUrl: "https://etherscan.io",
        isDefault: true
      },
      {
        name: "Sepolia",
        chainId: 11155111,
        rpcUrl: "https://sepolia.infura.io/v3/",
        symbol: "ETH",
        blockExplorerUrl: "https://sepolia.etherscan.io",
        isDefault: false
      },
      {
        name: "Polygon",
        chainId: 137,
        rpcUrl: "https://polygon-rpc.com",
        symbol: "MATIC",
        blockExplorerUrl: "https://polygonscan.com",
        isDefault: false
      },
      {
        name: "Arbitrum One",
        chainId: 42161,
        rpcUrl: "https://arb1.arbitrum.io/rpc",
        symbol: "ETH",
        blockExplorerUrl: "https://arbiscan.io",
        isDefault: false
      },
      {
        name: "Avalanche C-Chain",
        chainId: 43114,
        rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
        symbol: "AVAX",
        blockExplorerUrl: "https://snowtrace.io",
        isDefault: false
      },
      {
        name: "BNB Smart Chain",
        chainId: 56,
        rpcUrl: "https://bsc-dataseed.binance.org",
        symbol: "BNB",
        blockExplorerUrl: "https://bscscan.com",
        isDefault: false
      }
    ];

    for (const network of defaultNetworks) {
      this.createNetwork(network);
    }
  }

  private initDefaultDapps() {
    const defaultDapps: InsertDapp[] = [
      {
        name: "Uniswap",
        url: "https://app.uniswap.org",
        description: "Decentralized Exchange",
        category: "DeFi",
        logoUrl: "uniswap"
      },
      {
        name: "OpenSea",
        url: "https://opensea.io",
        description: "NFT Marketplace",
        category: "NFT",
        logoUrl: "opensea"
      }
    ];

    for (const dapp of defaultDapps) {
      this.createDapp(dapp);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress,
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    // Ensure all required fields are present
    const user: User = {
      ...insertUser,
      id,
      createdAt: now,
      walletAddress: insertUser.walletAddress || null,
      isAdmin: insertUser.isAdmin || false
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserWalletAddress(id: number, walletAddress: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, walletAddress };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const success = this.users.delete(id);
    return success;
  }

  // Network methods
  async getNetworks(): Promise<Network[]> {
    return Array.from(this.networks.values());
  }

  async getNetwork(id: number): Promise<Network | undefined> {
    return this.networks.get(id);
  }

  async getNetworkByChainId(chainId: number): Promise<Network | undefined> {
    return Array.from(this.networks.values()).find(
      (network) => network.chainId === chainId,
    );
  }

  async createNetwork(insertNetwork: InsertNetwork): Promise<Network> {
    const id = this.currentNetworkId++;
    // Ensure all required fields are present
    const network: Network = {
      ...insertNetwork,
      id,
      isDefault: insertNetwork.isDefault || false
    };
    this.networks.set(id, network);
    return network;
  }
  
  async updateNetwork(id: number, networkData: Partial<InsertNetwork>): Promise<Network | undefined> {
    const network = await this.getNetwork(id);
    if (!network) return undefined;
    
    const updatedNetwork: Network = { ...network, ...networkData };
    this.networks.set(id, updatedNetwork);
    return updatedNetwork;
  }
  
  async deleteNetwork(id: number): Promise<boolean> {
    const network = await this.getNetwork(id);
    if (!network) return false;
    
    // Don't allow deleting default network
    if (network.isDefault) return false;
    
    return this.networks.delete(id);
  }

  // Transaction methods
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId,
    );
  }
  
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    const transaction: Transaction = { ...insertTransaction, id, timestamp: now };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const transaction = await this.getTransaction(id);
    if (!transaction) return undefined;
    
    const updatedTransaction: Transaction = { ...transaction, status };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Dapp methods
  async getDapps(): Promise<Dapp[]> {
    return Array.from(this.dapps.values());
  }

  async getDapp(id: number): Promise<Dapp | undefined> {
    return this.dapps.get(id);
  }

  async createDapp(insertDapp: InsertDapp): Promise<Dapp> {
    const id = this.currentDappId++;
    const dapp: Dapp = { ...insertDapp, id };
    this.dapps.set(id, dapp);
    return dapp;
  }
  
  async updateDapp(id: number, dappData: Partial<InsertDapp>): Promise<Dapp | undefined> {
    const dapp = await this.getDapp(id);
    if (!dapp) return undefined;
    
    const updatedDapp: Dapp = { ...dapp, ...dappData };
    this.dapps.set(id, updatedDapp);
    return updatedDapp;
  }
  
  async deleteDapp(id: number): Promise<boolean> {
    return this.dapps.delete(id);
  }
}

// PostgreSQL Storage Implementation
export class PgStorage implements IStorage {
  
  // Default data initialization
  async initializeDefaultData() {
    const networkCount = await db.select().from(networks).execute();
    
    // Only initialize if there are no networks yet
    if (networkCount.length === 0) {
      const defaultNetworks: InsertNetwork[] = [
        {
          name: "Ethereum",
          chainId: 1,
          rpcUrl: "https://mainnet.infura.io/v3/",
          symbol: "ETH",
          blockExplorerUrl: "https://etherscan.io",
          isDefault: true
        },
        {
          name: "Sepolia",
          chainId: 11155111,
          rpcUrl: "https://sepolia.infura.io/v3/",
          symbol: "ETH",
          blockExplorerUrl: "https://sepolia.etherscan.io",
          isDefault: false
        },
        {
          name: "Polygon",
          chainId: 137,
          rpcUrl: "https://polygon-rpc.com",
          symbol: "MATIC",
          blockExplorerUrl: "https://polygonscan.com",
          isDefault: false
        },
        {
          name: "Arbitrum One",
          chainId: 42161,
          rpcUrl: "https://arb1.arbitrum.io/rpc",
          symbol: "ETH",
          blockExplorerUrl: "https://arbiscan.io",
          isDefault: false
        },
        {
          name: "Avalanche C-Chain",
          chainId: 43114,
          rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
          symbol: "AVAX",
          blockExplorerUrl: "https://snowtrace.io",
          isDefault: false
        },
        {
          name: "BNB Smart Chain",
          chainId: 56,
          rpcUrl: "https://bsc-dataseed.binance.org",
          symbol: "BNB",
          blockExplorerUrl: "https://bscscan.com",
          isDefault: false
        }
      ];

      for (const network of defaultNetworks) {
        await this.createNetwork(network);
      }
    }

    const dappCount = await db.select().from(dapps).execute();
    
    // Only initialize if there are no dapps yet
    if (dappCount.length === 0) {
      const defaultDapps: InsertDapp[] = [
        {
          name: "Uniswap",
          url: "https://app.uniswap.org",
          description: "Decentralized Exchange",
          category: "DeFi",
          logoUrl: "uniswap"
        },
        {
          name: "OpenSea",
          url: "https://opensea.io",
          description: "NFT Marketplace",
          category: "NFT",
          logoUrl: "opensea"
        }
      ];

      for (const dapp of defaultDapps) {
        await this.createDapp(dapp);
      }
    }
    
    // Create an admin user if none exists
    const userCount = await db.select().from(users).execute();
    if (userCount.length === 0) {
      await this.createUser({
        username: "admin",
        password: "admin123",  // In a real app, this would be hashed
        isAdmin: true
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id)).execute();
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username)).execute();
    return results[0];
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.walletAddress, walletAddress)).execute();
    return results[0];
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).execute();
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const results = await db.insert(users).values(insertUser).returning().execute();
    return results[0];
  }

  async updateUserWalletAddress(id: number, walletAddress: string): Promise<User | undefined> {
    const results = await db
      .update(users)
      .set({ walletAddress })
      .where(eq(users.id, id))
      .returning()
      .execute();
    return results[0];
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const results = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning()
      .execute();
    return results[0];
  }
  
  async deleteUser(id: number): Promise<boolean> {
    try {
      await db
        .delete(users)
        .where(eq(users.id, id))
        .execute();
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  // Network methods
  async getNetworks(): Promise<Network[]> {
    return await db.select().from(networks).execute();
  }

  async getNetwork(id: number): Promise<Network | undefined> {
    const results = await db.select().from(networks).where(eq(networks.id, id)).execute();
    return results[0];
  }

  async getNetworkByChainId(chainId: number): Promise<Network | undefined> {
    const results = await db.select().from(networks).where(eq(networks.chainId, chainId)).execute();
    return results[0];
  }

  async createNetwork(insertNetwork: InsertNetwork): Promise<Network> {
    const results = await db.insert(networks).values(insertNetwork).returning().execute();
    return results[0];
  }
  
  async updateNetwork(id: number, networkData: Partial<InsertNetwork>): Promise<Network | undefined> {
    const results = await db
      .update(networks)
      .set(networkData)
      .where(eq(networks.id, id))
      .returning()
      .execute();
    return results[0];
  }
  
  async deleteNetwork(id: number): Promise<boolean> {
    try {
      await db
        .delete(networks)
        .where(eq(networks.id, id))
        .execute();
      return true;
    } catch (error) {
      console.error("Error deleting network:", error);
      return false;
    }
  }

  // Transaction methods
  async getTransactions(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).execute();
  }
  
  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).execute();
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const results = await db.select().from(transactions).where(eq(transactions.id, id)).execute();
    return results[0];
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const results = await db.insert(transactions).values(insertTransaction).returning().execute();
    return results[0];
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const results = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning()
      .execute();
    return results[0];
  }
  
  async deleteTransaction(id: number): Promise<boolean> {
    try {
      await db
        .delete(transactions)
        .where(eq(transactions.id, id))
        .execute();
      return true;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      return false;
    }
  }

  // Dapp methods
  async getDapps(): Promise<Dapp[]> {
    return await db.select().from(dapps).execute();
  }

  async getDapp(id: number): Promise<Dapp | undefined> {
    const results = await db.select().from(dapps).where(eq(dapps.id, id)).execute();
    return results[0];
  }

  async createDapp(insertDapp: InsertDapp): Promise<Dapp> {
    const results = await db.insert(dapps).values(insertDapp).returning().execute();
    return results[0];
  }
  
  async updateDapp(id: number, dappData: Partial<InsertDapp>): Promise<Dapp | undefined> {
    const results = await db
      .update(dapps)
      .set(dappData)
      .where(eq(dapps.id, id))
      .returning()
      .execute();
    return results[0];
  }
  
  async deleteDapp(id: number): Promise<boolean> {
    try {
      await db
        .delete(dapps)
        .where(eq(dapps.id, id))
        .execute();
      return true;
    } catch (error) {
      console.error("Error deleting dapp:", error);
      return false;
    }
  }
}

// Use PostgreSQL storage
export const storage = new PgStorage();

// Initialize default data
storage.initializeDefaultData().catch(err => {
  console.error("Failed to initialize default data:", err);
});
