#!/usr/bin/env node
"use strict";

const { exec } = require("child_process");
const path = require("path");

const dbPath = path.join(__dirname, "packages/database");

console.log("Running Prisma migrations...");

exec("npx prisma db push --accept-data-loss", {
  cwd: dbPath,
  stdio: "inherit",
}, (error, stdout, stderr) => {
  if (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
  console.log("✅ Migration complete!");
  process.exit(0);
});
