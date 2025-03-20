import { pgTable, serial, text, integer, boolean, timestamp, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const dapps = pgTable("dapps", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	url: text().notNull(),
	description: text().notNull(),
	category: text().notNull(),
	logoUrl: text("logo_url").notNull(),
});

export const networks = pgTable("networks", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	chainId: integer("chain_id").notNull(),
	rpcUrl: text("rpc_url").notNull(),
	symbol: text().notNull(),
	blockExplorerUrl: text("block_explorer_url").notNull(),
	isDefault: boolean("is_default").default(false),
});

export const transactions = pgTable("transactions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	hash: text().notNull(),
	from: text().notNull(),
	to: text().notNull(),
	value: text().notNull(),
	networkId: integer("network_id").notNull(),
	status: text().notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	walletAddress: text("wallet_address"),
	isAdmin: boolean("is_admin").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);
