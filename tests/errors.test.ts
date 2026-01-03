import { describe, test, expect } from 'bun:test';
import {
  ExitCode,
  getExitCode,
  getErrorHint,
  formatError,
  ScraperError,
  isConnectionError,
  isTimeoutError,
  getErrorMessage,
} from '../src/utils/errors';

describe('ExitCode', () => {
  test('has correct values', () => {
    expect(ExitCode.SUCCESS).toBe(0);
    expect(ExitCode.GENERAL_ERROR).toBe(1);
    expect(ExitCode.CONNECTION_ERROR).toBe(2);
    expect(ExitCode.NO_PAGES).toBe(3);
  });
});

describe('getExitCode', () => {
  test('maps error types to exit codes', () => {
    expect(getExitCode('not_found')).toBe(ExitCode.NOT_FOUND);
    expect(getExitCode('rate_limited')).toBe(ExitCode.RATE_LIMITED);
    expect(getExitCode('login_required')).toBe(ExitCode.LOGIN_REQUIRED);
    expect(getExitCode('connection_error')).toBe(ExitCode.CONNECTION_ERROR);
    expect(getExitCode('no_pages')).toBe(ExitCode.NO_PAGES);
  });
});

describe('getErrorHint', () => {
  test('returns hints for error types', () => {
    expect(getErrorHint('not_found')).toContain('does not exist');
    expect(getErrorHint('rate_limited')).toContain('Wait');
    expect(getErrorHint('login_required')).toContain('logged in');
    expect(getErrorHint('connection_error')).toContain('Browse extension');
  });
});

describe('formatError', () => {
  test('formats Error objects', () => {
    const error = new Error('Test error');
    const result = formatError(error);
    expect(result.error).toBe('Test error');
    expect(result.code).toBe(ExitCode.GENERAL_ERROR);
  });

  test('formats string errors', () => {
    const result = formatError('Test error');
    expect(result.error).toBe('Test error');
  });

  test('detects timeout errors', () => {
    const error = new Error('Connection timed out');
    const result = formatError(error);
    expect(result.code).toBe(ExitCode.NAVIGATION_TIMEOUT);
    expect(result.hint).toContain('timeout');
  });

  test('detects connection errors', () => {
    const error = new Error('ECONNREFUSED');
    const result = formatError(error);
    expect(result.code).toBe(ExitCode.CONNECTION_ERROR);
  });
});

describe('ScraperError', () => {
  test('creates error with type', () => {
    const error = new ScraperError('Not found', 'not_found');
    expect(error.message).toBe('Not found');
    expect(error.type).toBe('not_found');
    expect(error.name).toBe('ScraperError');
  });

  test('converts to JSON', () => {
    const error = new ScraperError('Rate limited', 'rate_limited');
    const json = error.toJSON();
    expect(json.error).toBe('Rate limited');
    expect(json.code).toBe(ExitCode.RATE_LIMITED);
    expect(json.hint).toBeDefined();
  });
});

describe('isConnectionError', () => {
  test('detects connection errors', () => {
    expect(isConnectionError(new Error('ECONNREFUSED'))).toBe(true);
    expect(isConnectionError(new Error('connection refused'))).toBe(true);
    expect(isConnectionError(new Error('extension not connected'))).toBe(true);
  });

  test('returns false for other errors', () => {
    expect(isConnectionError(new Error('Not found'))).toBe(false);
    expect(isConnectionError(new Error('timeout'))).toBe(false);
  });
});

describe('isTimeoutError', () => {
  test('detects timeout errors', () => {
    expect(isTimeoutError(new Error('timeout'))).toBe(true);
    expect(isTimeoutError(new Error('Connection timed out'))).toBe(true);
  });

  test('returns false for other errors', () => {
    expect(isTimeoutError(new Error('Not found'))).toBe(false);
    expect(isTimeoutError(new Error('connection error'))).toBe(false);
  });
});

describe('getErrorMessage', () => {
  test('extracts message from Error', () => {
    expect(getErrorMessage(new Error('Test'))).toBe('Test');
  });

  test('handles string errors', () => {
    expect(getErrorMessage('Test')).toBe('Test');
  });

  test('handles objects with message', () => {
    expect(getErrorMessage({ message: 'Test' })).toBe('Test');
  });

  test('handles unknown types', () => {
    expect(getErrorMessage(null)).toBe('An unknown error occurred');
    expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
  });
});
