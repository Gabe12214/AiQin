CREATE TABLE "dapps" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"logo_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "networks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"chain_id" integer NOT NULL,
	"rpc_url" text NOT NULL,
	"symbol" text NOT NULL,
	"block_explorer_url" text NOT NULL,
	"is_default" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"hash" text NOT NULL,
	"from" text NOT NULL,
	"to" text NOT NULL,
	"value" text NOT NULL,
	"network_id" integer NOT NULL,
	"status" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"wallet_address" text,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
