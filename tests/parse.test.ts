import { describe, test, expect } from 'bun:test';
import { parseNumber, parseRelativeDate, cleanText, truncateText } from '../src/utils/parse';

describe('parseNumber', () => {
  test('parses plain numbers', () => {
    expect(parseNumber('123')).toBe(123);
    expect(parseNumber('0')).toBe(0);
  });

  test('parses numbers with commas', () => {
    expect(parseNumber('1,234')).toBe(1234);
    expect(parseNumber('1,234,567')).toBe(1234567);
  });

  test('parses K suffix', () => {
    expect(parseNumber('12K')).toBe(12000);
    expect(parseNumber('12.5K')).toBe(12500);
    expect(parseNumber('1k')).toBe(1000);
  });

  test('parses M suffix', () => {
    expect(parseNumber('1M')).toBe(1000000);
    expect(parseNumber('1.2M')).toBe(1200000);
    expect(parseNumber('2.5m')).toBe(2500000);
  });

  test('parses B suffix', () => {
    expect(parseNumber('1B')).toBe(1000000000);
    expect(parseNumber('2.5b')).toBe(2500000000);
  });

  test('handles invalid input', () => {
    expect(parseNumber('')).toBe(0);
    expect(parseNumber('abc')).toBe(0);
    // @ts-expect-error testing invalid input
    expect(parseNumber(null)).toBe(0);
  });
});

describe('parseRelativeDate', () => {
  test('parses seconds', () => {
    const result = parseRelativeDate('30s');
    expect(result).not.toBeNull();
    const date = new Date(result!);
    const now = new Date();
    expect(now.getTime() - date.getTime()).toBeGreaterThan(25000);
    expect(now.getTime() - date.getTime()).toBeLessThan(35000);
  });

  test('parses minutes', () => {
    const result = parseRelativeDate('5m');
    expect(result).not.toBeNull();
  });

  test('parses hours', () => {
    const result = parseRelativeDate('2h');
    expect(result).not.toBeNull();
  });

  test('parses days', () => {
    const result = parseRelativeDate('1d');
    expect(result).not.toBeNull();
  });

  test('parses absolute dates', () => {
    const result = parseRelativeDate('Jan 15, 2023');
    expect(result).not.toBeNull();
    expect(result).toContain('2023');
  });

  test('handles invalid input', () => {
    expect(parseRelativeDate('')).toBeNull();
    expect(parseRelativeDate('invalid')).toBeNull();
    // @ts-expect-error testing invalid input
    expect(parseRelativeDate(null)).toBeNull();
  });
});

describe('cleanText', () => {
  test('normalizes whitespace', () => {
    expect(cleanText('hello   world')).toBe('hello world');
    expect(cleanText('hello\t\tworld')).toBe('hello world');
  });

  test('normalizes newlines', () => {
    expect(cleanText('hello\n\n\nworld')).toBe('hello\nworld');
  });

  test('trims', () => {
    expect(cleanText('  hello  ')).toBe('hello');
  });

  test('handles invalid input', () => {
    expect(cleanText('')).toBe('');
    // @ts-expect-error testing invalid input
    expect(cleanText(null)).toBe('');
  });
});

describe('truncateText', () => {
  test('truncates long text', () => {
    expect(truncateText('hello world', 8)).toBe('hello...');
  });

  test('leaves short text unchanged', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });

  test('handles exact length', () => {
    expect(truncateText('hello', 5)).toBe('hello');
  });

  test('handles invalid input', () => {
    expect(truncateText('', 10)).toBe('');
    // @ts-expect-error testing invalid input
    expect(truncateText(null, 10)).toBe('');
  });
});
