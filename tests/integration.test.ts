/**
 * Integration Tests for MCP Server
 */

import { describe, test, expect } from 'bun:test';
import { tools } from '../src/tools/index';

describe('MCP Server Integration', () => {
  describe('Tool Registration', () => {
    test('all expected tools are registered', () => {
      const toolNames = tools.map(t => t.name);

      // Browser tools
      expect(toolNames).toContain('navigate');
      expect(toolNames).toContain('get_page_info');
      expect(toolNames).toContain('list_pages');
      expect(toolNames).toContain('switch_page');
      expect(toolNames).toContain('take_screenshot');

      // Generic tools
      expect(toolNames).toContain('scrape_page');
      expect(toolNames).toContain('execute_script');

      // Twitter tools
      expect(toolNames).toContain('scrape_twitter_profile');
      expect(toolNames).toContain('scrape_twitter_timeline');
      expect(toolNames).toContain('scrape_twitter_post');
      expect(toolNames).toContain('scrape_twitter_search');

      // LinkedIn tools
      expect(toolNames).toContain('scrape_linkedin_profile');
      expect(toolNames).toContain('scrape_linkedin_posts');
      expect(toolNames).toContain('scrape_linkedin_search');
    });

    test('tools have valid MCP schema structure', () => {
      for (const tool of tools) {
        expect(tool.name).toBeDefined();
        expect(typeof tool.name).toBe('string');
        expect(tool.description).toBeDefined();
        expect(typeof tool.description).toBe('string');
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
      }
    });

    test('navigate tool has correct schema', () => {
      const navigateTool = tools.find(t => t.name === 'navigate');
      expect(navigateTool).toBeDefined();
      expect(navigateTool!.inputSchema.properties.url).toBeDefined();
      expect(navigateTool!.inputSchema.required).toContain('url');
    });

    test('scrape_twitter_profile has correct schema', () => {
      const tool = tools.find(t => t.name === 'scrape_twitter_profile');
      expect(tool).toBeDefined();
      expect(tool!.inputSchema.properties.username).toBeDefined();
      expect(tool!.inputSchema.required).toContain('username');
    });

    test('scrape_linkedin_profile has correct schema', () => {
      const tool = tools.find(t => t.name === 'scrape_linkedin_profile');
      expect(tool).toBeDefined();
      expect(tool!.inputSchema.properties.url).toBeDefined();
      expect(tool!.inputSchema.required).toContain('url');
    });

    test('scrape_linkedin_search has optional type parameter', () => {
      const tool = tools.find(t => t.name === 'scrape_linkedin_search');
      expect(tool).toBeDefined();
      expect(tool!.inputSchema.properties.type).toBeDefined();
      expect(tool!.inputSchema.properties.type.enum).toContain('people');
      expect(tool!.inputSchema.properties.type.enum).toContain('companies');
      expect(tool!.inputSchema.properties.type.enum).toContain('posts');
    });
  });

  describe('Tool Count', () => {
    test('has expected number of tools', () => {
      // 5 browser + 2 generic + 4 twitter + 3 linkedin + 2 instagram + 3 reddit = 19
      expect(tools.length).toBe(19);
    });
  });
});

describe('Error Response Format', () => {
  test('error responses have correct MCP structure', () => {
    const { formatErrorResponse } = require('../src/errors');
    const response = formatErrorResponse(new Error('Test error'));

    expect(response).toHaveProperty('content');
    expect(response).toHaveProperty('isError', true);
    expect(Array.isArray(response.content)).toBe(true);
    expect(response.content.length).toBeGreaterThan(0);
    expect(response.content[0]).toHaveProperty('type', 'text');
    expect(response.content[0]).toHaveProperty('text');
  });
});
