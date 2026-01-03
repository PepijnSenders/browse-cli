/**
 * MCP Server command
 */

import { Command } from "commander";
import { startMCPServer } from "../mcp/index.js";

/**
 * Create mcp command to start the MCP server
 */
export function createMCPCommand(): Command {
  return new Command("mcp")
    .description("Start MCP server for Claude integration")
    .action(async () => {
      await startMCPServer();
    });
}
