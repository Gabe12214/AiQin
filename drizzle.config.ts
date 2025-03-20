import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

export default defineConfig({
  schema: "./shared/schema.ts", // Update if needed
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:azazy@localhost:5432/yourdatabase", // Your database URL
  },
});
