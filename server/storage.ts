import { 
  users, type User, type InsertUser,
  networks, type Network, type InsertNetwork,
  transactions, type Transaction, type InsertTransaction,
  dapps, type Dapp, type InsertDapp
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWalletAddress(id: number, walletAddress: string): Promise<User | undefined>;
  
  // Network methods
  getNetworks(): Promise<Network[]>;
  getNetwork(id: number): Promise<Network | undefined>;
  getNetworkByChainId(chainId: number): Promise<Network | undefined>;
  createNetwork(network: InsertNetwork): Promise<Network>;
  
  // Transaction methods
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined>;
  
  // Dapp methods
  getDapps(): Promise<Dapp[]>;
  getDapp(id: number): Promise<Dapp | undefined>;
  createDapp(dapp: InsertDapp): Promise<Dapp>;
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
    
    // Initialize with default networks
    this.initDefaultNetworks();
    this.initDefaultDapps();
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
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
    const network: Network = { ...insertNetwork, id };
    this.networks.set(id, network);
    return network;
  }

  // Transaction methods
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId,
    );
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
}

export const storage = new MemStorage();
