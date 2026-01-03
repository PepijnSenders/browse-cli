/**
 * Unit Tests for Utility Functions
 */

import { describe, test, expect } from 'bun:test';
import { parseTwitterNumber } from '../src/scrapers/twitter';
import { parseConnectionDegree, parseDuration, parseFollowerCount } from '../src/scrapers/linkedin';
import { detectErrorType, formatErrorResponse, ErrorCode } from '../src/errors';

describe('Twitter Utils', () => {
  describe('parseTwitterNumber', () => {
    test('parses plain numbers', () => {
      expect(parseTwitterNumber('123')).toBe(123);
      expect(parseTwitterNumber('1234567')).toBe(1234567);
    });

    test('parses numbers with commas', () => {
      expect(parseTwitterNumber('1,234')).toBe(1234);
      expect(parseTwitterNumber('1,234,567')).toBe(1234567);
    });

    test('parses K suffix', () => {
      expect(parseTwitterNumber('1K')).toBe(1000);
      expect(parseTwitterNumber('1.5K')).toBe(1500);
      expect(parseTwitterNumber('12.3K')).toBe(12300);
    });

    test('parses M suffix', () => {
      expect(parseTwitterNumber('1M')).toBe(1000000);
      expect(parseTwitterNumber('1.5M')).toBe(1500000);
      expect(parseTwitterNumber('12.3M')).toBe(12300000);
    });

    test('handles empty/invalid input', () => {
      expect(parseTwitterNumber('')).toBe(0);
      expect(parseTwitterNumber('   ')).toBe(0);
      expect(parseTwitterNumber('invalid')).toBe(0);
    });
  });
});

describe('LinkedIn Utils', () => {
  describe('parseConnectionDegree', () => {
    test('parses 1st degree', () => {
      expect(parseConnectionDegree('1st')).toBe('1st');
      expect(parseConnectionDegree('1st degree connection')).toBe('1st');
    });

    test('parses 2nd degree', () => {
      expect(parseConnectionDegree('2nd')).toBe('2nd');
      expect(parseConnectionDegree('2nd degree')).toBe('2nd');
    });

    test('parses 3rd degree', () => {
      expect(parseConnectionDegree('3rd')).toBe('3rd');
      expect(parseConnectionDegree('3rd degree connection')).toBe('3rd');
    });

    test('handles out of network', () => {
      expect(parseConnectionDegree('Out of Network')).toBe('Out of Network');
      expect(parseConnectionDegree('unknown')).toBe('Out of Network');
    });
  });

  describe('parseDuration', () => {
    test('parses date range with duration', () => {
      const result = parseDuration('Jan 2020 - Present · 4 yrs 2 mos');
      expect(result.start).toBe('Jan 2020');
      expect(result.end).toBe('Present');
      expect(result.total).toBe('4 yrs 2 mos');
    });

    test('parses date range without duration', () => {
      const result = parseDuration('Jan 2020 - Dec 2022');
      expect(result.start).toBe('Jan 2020');
      expect(result.end).toBe('Dec 2022');
      expect(result.total).toBe('');
    });

    test('handles single date', () => {
      const result = parseDuration('Jan 2020');
      expect(result.start).toBe('Jan 2020');
      expect(result.end).toBe('Present');
    });
  });

  describe('parseFollowerCount', () => {
    test('parses plain numbers', () => {
      expect(parseFollowerCount('1234 followers')).toBe(1234);
    });

    test('parses numbers with commas', () => {
      expect(parseFollowerCount('1,234 followers')).toBe(1234);
    });

    test('parses K suffix', () => {
      expect(parseFollowerCount('1.2K followers')).toBe(1200);
    });

    test('parses M suffix', () => {
      expect(parseFollowerCount('1.5M followers')).toBe(1500000);
    });

    test('handles invalid input', () => {
      expect(parseFollowerCount('')).toBe(0);
      expect(parseFollowerCount('no number here')).toBe(0);
    });
  });
});

describe('Error Handling', () => {
  describe('detectErrorType', () => {
    test('detects connection errors', () => {
      const error = detectErrorType('ECONNREFUSED');
      expect(error.code).toBe(ErrorCode.EXTENSION_NOT_CONNECTED);
      expect(error.recoveryHint).toBeDefined();
    });

    test('detects no pages available', () => {
      const error = detectErrorType('No pages available');
      expect(error.code).toBe(ErrorCode.NO_PAGES_AVAILABLE);
    });

    test('detects timeout errors', () => {
      const error = detectErrorType('Navigation timeout');
      expect(error.code).toBe(ErrorCode.NAVIGATION_TIMEOUT);
    });

    test('detects rate limit errors', () => {
      const error = detectErrorType('Rate limit exceeded');
      expect(error.code).toBe(ErrorCode.RATE_LIMITED);
    });

    test('detects login required', () => {
      const error = detectErrorType('Please sign in to continue');
      expect(error.code).toBe(ErrorCode.LOGIN_REQUIRED);
    });

    test('detects profile not found', () => {
      const error = detectErrorType('Page not found');
      expect(error.code).toBe(ErrorCode.PROFILE_NOT_FOUND);
    });

    test('detects suspended accounts', () => {
      const error = detectErrorType('Account suspended');
      expect(error.code).toBe(ErrorCode.ACCOUNT_SUSPENDED);
    });

    test('handles unknown errors', () => {
      const error = detectErrorType('Some random error');
      expect(error.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('formatErrorResponse', () => {
    test('formats error with recovery hint', () => {
      const response = formatErrorResponse(new Error('No pages available'));
      expect(response.isError).toBe(true);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toContain('No pages available');
      expect(response.content[0].text).toContain('How to fix');
    });

    test('formats string errors', () => {
      const response = formatErrorResponse('Connection refused');
      expect(response.isError).toBe(true);
    });
  });
});
