import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Fallback for build time if env var is missing
    url: process.env.DATABASE_URL || "postgres://dummy:dummy@localhost:5432/dummy",
  },
});
