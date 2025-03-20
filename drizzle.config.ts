import { defineConfig } from "drizzle-kit";
import dotenv, { config, configDotenv } from "dotenv";
import assert, { strict } from "node:assert";
import PropTypes, { string } from "prop-types";
import Undici, { buildConnector, connect } from "undici-types";
import { Connection } from "pg";
import { connected } from "node:process";
import connectPgSimple from "connect-pg-simple";
import { createConnection } from "node:net";
import { isBooleanObject } from "node:util/types";
import { default_type } from "mime";

dotenv.config(); // Load environment variables

if (!process.env.DATABASE_URL) {
  throw new Error("postgresql://postgres:azazy@localhost:5432/yourdatabase.");
}

export default defineConfig({
  schema: "./shared/schema.ts", // Update path if needed
  out: "./migrations",
  dialect: "postgresql", // This was missing
  string: "pg", // Ensure this is correct for PostgreSQL
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
});
