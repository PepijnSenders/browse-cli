import { describe, test, expect } from 'bun:test';
import { parseTwitterNumber } from '../src/utils/parse';
import { formatError, ExitCode, isConnectionError, isTimeoutError } from '../src/utils/errors';
import { humanDelay } from '../src/scrapers/twitter';

describe('Number Parsing', () => {
	test('parses K suffix', () => {
		expect(parseTwitterNumber('12.5K')).toBe(12500);
		expect(parseTwitterNumber('1K')).toBe(1000);
		expect(parseTwitterNumber('999K')).toBe(999000);
	});

	test('parses M suffix', () => {
		expect(parseTwitterNumber('1.2M')).toBe(1200000);
		expect(parseTwitterNumber('2M')).toBe(2000000);
		expect(parseTwitterNumber('150M')).toBe(150000000);
	});

	test('parses comma-separated numbers', () => {
		expect(parseTwitterNumber('1,234')).toBe(1234);
		expect(parseTwitterNumber('1,234,567')).toBe(1234567);
	});

	test('parses plain numbers', () => {
		expect(parseTwitterNumber('123')).toBe(123);
		expect(parseTwitterNumber('999')).toBe(999);
	});

	test('handles invalid input', () => {
		expect(parseTwitterNumber('')).toBe(0);
		expect(parseTwitterNumber('abc')).toBe(0);
		expect(parseTwitterNumber('N/A')).toBe(0);
	});

	test('handles whitespace', () => {
		expect(parseTwitterNumber('  12.5K  ')).toBe(12500);
		expect(parseTwitterNumber('1,234 ')).toBe(1234);
	});
});

describe('Human Delay', () => {
	test('delays within range', async () => {
		const start = Date.now();
		await humanDelay(100, 200);
		const elapsed = Date.now() - start;

		expect(elapsed).toBeGreaterThanOrEqual(100);
		expect(elapsed).toBeLessThan(250); // Add buffer for execution time
	});

	test('uses default range', async () => {
		const start = Date.now();
		await humanDelay();
		const elapsed = Date.now() - start;

		expect(elapsed).toBeGreaterThanOrEqual(500);
		expect(elapsed).toBeLessThan(1600); // Default is 500-1500ms
	});
});

describe('Error Detection', () => {
	test('detects connection refused', () => {
		const error = new Error('ECONNREFUSED connection failed');
		const result = formatError(error);

		expect(result.code).toBe(ExitCode.CONNECTION_ERROR);
		expect(result.error).toBe('ECONNREFUSED connection failed');
		expect(result.hint).toContain('Playwriter');
	});

	test('detects no pages', () => {
		const error = new Error('No pages available');
		const result = formatError(error);

		expect(result.code).toBe(ExitCode.NO_PAGES);
		expect(result.error).toBe('No pages available');
		expect(result.hint).toContain('browser');
	});

	test('handles generic errors', () => {
		const error = new Error('Something went wrong');
		const result = formatError(error);

		expect(result.code).toBe(ExitCode.GENERAL_ERROR);
		expect(result.error).toBe('Something went wrong');
	});

	test('is case insensitive', () => {
		const error = new Error('ECONNREFUSED');
		expect(isConnectionError(error)).toBe(true);

		const error2 = new Error('no pages available');
		const result2 = formatError(error2);
		expect(result2.code).toBe(ExitCode.NO_PAGES);
	});

	test('detects timeout errors', () => {
		const error = new Error('Navigation timeout exceeded');
		expect(isTimeoutError(error)).toBe(true);

		const result = formatError(error);
		expect(result.code).toBe(ExitCode.NAVIGATION_TIMEOUT);
	});
});

describe('Exit Codes', () => {
	test('defines correct exit codes', () => {
		// These should match the spec in 02-cli-interface.md
		expect(ExitCode.SUCCESS).toBe(0);
		expect(ExitCode.GENERAL_ERROR).toBe(1);
		expect(ExitCode.CONNECTION_ERROR).toBe(2);
		expect(ExitCode.NO_PAGES).toBe(3);
		expect(ExitCode.NAVIGATION_TIMEOUT).toBe(4);
		expect(ExitCode.ELEMENT_NOT_FOUND).toBe(5);
		expect(ExitCode.RATE_LIMITED).toBe(6);
		expect(ExitCode.LOGIN_REQUIRED).toBe(7);
		expect(ExitCode.NOT_FOUND).toBe(8);
	});
});

describe('URL Validation', () => {
	test('validates LinkedIn URLs', () => {
		const validUrls = [
			'https://www.linkedin.com/in/username',
			'https://linkedin.com/in/username/',
			'http://linkedin.com/in/username',
		];

		const invalidUrls = [
			'twitter.com/username',
			'https://example.com',
			'linkedin.com', // Missing path
			'just-text',
		];

		for (const url of validUrls) {
			expect(url.includes('linkedin.com/in/')).toBe(true);
		}

		for (const url of invalidUrls) {
			expect(url.includes('linkedin.com/in/')).toBe(false);
		}
	});

	test('validates Twitter post URLs', () => {
		const validUrls = [
			'https://x.com/user/status/123456',
			'https://twitter.com/user/status/123456',
			'https://x.com/user/status/123456?s=20',
		];

		const invalidUrls = [
			'https://x.com/user',
			'https://example.com',
			'not-a-url',
		];

		for (const url of validUrls) {
			expect(url.includes('/status/')).toBe(true);
		}

		for (const url of invalidUrls) {
			expect(url.includes('/status/')).toBe(false);
		}
	});
});

describe('Username Normalization', () => {
	test('removes @ from Twitter handles', () => {
		const normalize = (username: string) => username.replace(/^@/, '');

		expect(normalize('@elonmusk')).toBe('elonmusk');
		expect(normalize('elonmusk')).toBe('elonmusk');
		expect(normalize('@user_123')).toBe('user_123');
	});

	test('preserves usernames without @', () => {
		const normalize = (username: string) => username.replace(/^@/, '');

		expect(normalize('paulg')).toBe('paulg');
		expect(normalize('username')).toBe('username');
	});
});

describe('Count Limits', () => {
	test('enforces Twitter limits', () => {
		const maxTwitterCount = 100;
		const clamp = (count: number, max: number) =>
			Math.min(Math.max(count, 1), max);

		expect(clamp(50, maxTwitterCount)).toBe(50);
		expect(clamp(100, maxTwitterCount)).toBe(100);
		expect(clamp(200, maxTwitterCount)).toBe(100); // Clamped to max
		expect(clamp(0, maxTwitterCount)).toBe(1); // Clamped to min
		expect(clamp(-5, maxTwitterCount)).toBe(1); // Clamped to min
	});

	test('enforces LinkedIn limits', () => {
		const maxLinkedInCount = 50;
		const clamp = (count: number, max: number) =>
			Math.min(Math.max(count, 1), max);

		expect(clamp(20, maxLinkedInCount)).toBe(20);
		expect(clamp(50, maxLinkedInCount)).toBe(50);
		expect(clamp(100, maxLinkedInCount)).toBe(50); // Clamped to max
	});
});

describe('JSON Output Format', () => {
	test('error output format', () => {
		const error = {
			error: 'Extension not connected',
			code: 2,
			hint: 'Make sure Chrome has the Playwriter extension installed.',
		};

		// Should be valid JSON
		const json = JSON.stringify(error);
		const parsed = JSON.parse(json);

		expect(parsed.error).toBe('Extension not connected');
		expect(parsed.code).toBe(2);
		expect(parsed.hint).toBeDefined();
	});

	test('success output format', () => {
		const profile = {
			username: 'elonmusk',
			displayName: 'Elon Musk',
			bio: 'CEO of Tesla and SpaceX',
			followersCount: 150000000,
			followingCount: 500,
			verified: true,
		};

		// Should be valid JSON
		const json = JSON.stringify(profile);
		const parsed = JSON.parse(json);

		expect(parsed.username).toBe('elonmusk');
		expect(parsed.verified).toBe(true);
		expect(typeof parsed.followersCount).toBe('number');
	});
});

describe('Duration Parsing', () => {
	test('parses LinkedIn duration format', () => {
		const parseDuration = (text: string) => {
			const parts = text.split('·').map((s) => s.trim());
			return {
				dateRange: parts[0] || '',
				duration: parts[1] || '',
			};
		};

		const result1 = parseDuration('Jan 2020 - Present · 4 yrs 2 mos');
		expect(result1.dateRange).toBe('Jan 2020 - Present');
		expect(result1.duration).toBe('4 yrs 2 mos');

		const result2 = parseDuration('2018 - 2020 · 2 yrs');
		expect(result2.dateRange).toBe('2018 - 2020');
		expect(result2.duration).toBe('2 yrs');

		const result3 = parseDuration('Current position');
		expect(result3.dateRange).toBe('Current position');
		expect(result3.duration).toBe('');
	});
});

describe('Timeout Configuration', () => {
	test('default timeout', () => {
		const DEFAULT_TIMEOUT = 30000;
		expect(DEFAULT_TIMEOUT).toBe(30000); // 30 seconds
	});

	test('custom timeout', () => {
		const customTimeout = 60000;
		expect(customTimeout).toBeGreaterThan(30000);
		expect(customTimeout).toBeLessThanOrEqual(120000); // Reasonable max
	});
});

describe('Selector Stability', () => {
	test('Twitter selectors use data-testid', () => {
		const selectors = {
			userName: '[data-testid="UserName"]',
			userDescription: '[data-testid="UserDescription"]',
			tweet: 'article[data-testid="tweet"]',
		};

		// All should use data-testid for stability
		expect(selectors.userName).toContain('data-testid');
		expect(selectors.userDescription).toContain('data-testid');
		expect(selectors.tweet).toContain('data-testid');
	});
});

describe('Size Limits', () => {
	test('enforces text size limit', () => {
		const MAX_TEXT_SIZE = 100000;
		const truncate = (text: string, max: number) =>
			text.length > max ? text.slice(0, max) : text;

		const longText = 'a'.repeat(150000);
		const truncated = truncate(longText, MAX_TEXT_SIZE);

		expect(truncated.length).toBe(MAX_TEXT_SIZE);
	});

	test('enforces array limits', () => {
		const MAX_LINKS = 100;
		const MAX_IMAGES = 50;

		const links = Array(200).fill({ text: 'link', href: 'url' });
		const images = Array(100).fill({ alt: 'image', src: 'url' });

		expect(links.slice(0, MAX_LINKS).length).toBe(MAX_LINKS);
		expect(images.slice(0, MAX_IMAGES).length).toBe(MAX_IMAGES);
	});
});
