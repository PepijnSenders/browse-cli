#!/usr/bin/env node

/**
 * Session Scraper MCP Server
 *
 * MCP server that enables AI agents to scrape data from websites using your
 * existing browser session. Supports Twitter, LinkedIn, and generic pages.
 *
 * Uses Playwriter extension to connect to Chrome via CDP relay server.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools/index.js';

/**
 * Main entry point for the MCP server
 */
async function main() {
  // Create MCP server instance
  const server = new Server(
    {
      name: 'session-scraper',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register all tools with the server
  registerTools(server);

  // Set up error handling for the server
  server.onerror = (error) => {
    console.error('[MCP Error]', error);
  };

  // Graceful shutdown handling
  process.on('SIGINT', async () => {
    console.error('\n[MCP] Shutting down gracefully...');
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('\n[MCP] Shutting down gracefully...');
    await server.close();
    process.exit(0);
  });

  // Create stdio transport and connect
  const transport = new StdioServerTransport();

  try {
    await server.connect(transport);
    console.error('[MCP] Session Scraper server started');
    console.error('[MCP] Waiting for Playwriter connection...');
  } catch (error) {
    console.error('[MCP] Failed to start server:', error);
    process.exit(1);
  }
}

// Run the server
main().catch((error) => {
  console.error('[MCP] Fatal error:', error);
  process.exit(1);
});
