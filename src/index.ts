#!/usr/bin/env bun
/**
 * X-CLI - A fast, type-safe CLI for X (Twitter)
 *
 * Entry point for the CLI application.
 */

import { Command } from "commander";

const program = new Command();

program
  .name("x")
  .description("A fast, type-safe CLI for X (Twitter)")
  .version("0.1.0");

// Global options
program
  .option("-j, --json", "Force JSON output")
  .option("-q, --quiet", "Suppress non-essential output")
  .option("-v, --verbose", "Debug information")
  .option("--no-color", "Disable colors");

// Auth commands (placeholder)
const auth = program.command("auth").description("Authentication commands");

auth
  .command("login")
  .description("Login with OAuth 2.0")
  .action(async () => {
    console.log("Auth login not yet implemented");
  });

auth
  .command("logout")
  .description("Clear stored tokens")
  .action(async () => {
    console.log("Auth logout not yet implemented");
  });

auth
  .command("status")
  .description("Show current auth status")
  .action(async () => {
    console.log("Auth status not yet implemented");
  });

// Parse and execute
program.parse();
