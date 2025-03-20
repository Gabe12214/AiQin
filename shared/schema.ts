import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const networks = pgTable("networks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  chainId: integer("chain_id").notNull(),
  rpcUrl: text("rpc_url").notNull(),
  symbol: text("symbol").notNull(),
  blockExplorerUrl: text("block_explorer_url").notNull(),
  isDefault: boolean("is_default").default(false),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  hash: text("hash").notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  value: text("value").notNull(),
  networkId: integer("network_id").notNull(),
  status: text("status").notNull(), // pending, success, failed
  timestamp: timestamp("timestamp").defaultNow(),
});

export const dapps = pgTable("dapps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  logoUrl: text("logo_url").notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
  isAdmin: true,
});

export const insertNetworkSchema = createInsertSchema(networks).pick({
  name: true,
  chainId: true,
  rpcUrl: true,
  symbol: true,
  blockExplorerUrl: true,
  isDefault: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  hash: true,
  from: true,
  to: true,
  value: true,
  networkId: true,
  status: true,
});

export const insertDappSchema = createInsertSchema(dapps).pick({
  name: true,
  url: true,
  description: true,
  category: true,
  logoUrl: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertNetwork = z.infer<typeof insertNetworkSchema>;
export type Network = typeof networks.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertDapp = z.infer<typeof insertDappSchema>;
export type Dapp = typeof dapps.$inferSelect;
