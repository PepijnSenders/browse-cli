# Tests

This directory contains test files and documentation for the Session Scraper project.

## Test Files

### Automated Tests

- **`cli.test.ts`** - Unit tests for CLI utilities
  - Number parsing (K/M suffixes)
  - Human-like delays
  - Error detection
  - Exit codes
  - URL validation
  - Username normalization
  - And more

Run with:
```bash
bun test
```

### Manual Tests

- **`manual-test.sh`** - Interactive CLI test script
  - Tests basic CLI functionality
  - Verifies Playwriter connection
  - Tests browser commands
  - Validates JSON output
  - Tests error handling

Run with:
```bash
./tests/manual-test.sh
```

### Documentation

- **`skill-testing.md`** - Comprehensive skill testing guide
  - Prerequisites and setup
  - 20+ test scenarios
  - Error handling tests
  - Edge cases
  - Integration tests
  - Test results template

## Running Tests

### 1. Automated Unit Tests

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Watch mode
bun test --watch
```

### 2. Type Checking

```bash
bun run typecheck
```

### 3. Manual CLI Tests

```bash
# Build first
bun run build

# Run manual tests
./tests/manual-test.sh
```

### 4. Claude Code Skill Tests

Follow the guide in `skill-testing.md`:

1. Build the CLI: `bun run build`
2. Install skill: `cp skill/scrape.md ~/.claude/skills/`
3. Open Claude Code
4. Test scenarios from `skill-testing.md`

## Test Coverage

### Current Coverage

- ✅ Number parsing (Twitter K/M format)
- ✅ Error detection and classification
- ✅ Exit code definitions
- ✅ URL validation (LinkedIn, Twitter)
- ✅ Username normalization
- ✅ Count limits enforcement
- ✅ JSON output format
- ✅ Duration parsing (LinkedIn)
- ✅ Timeout configuration
- ✅ Size limits

### Planned Coverage

- [ ] Twitter scraper integration tests (requires auth)
- [ ] LinkedIn scraper integration tests (requires auth)
- [ ] Browser automation tests (requires Playwriter)
- [ ] Screenshot generation tests
- [ ] Navigation tests
- [ ] Pagination tests

## Test Strategy

### Unit Tests (Automated)

Test individual functions and utilities in isolation:
- Parse functions
- Error handlers
- Validators
- Formatters

These run quickly and don't require external dependencies.

### Integration Tests (Manual)

Test complete workflows:
- CLI command execution
- Browser connection
- Page scraping
- Platform-specific scraping

These require:
- Playwriter extension
- Chrome browser
- Logged-in accounts

### End-to-End Tests (Manual with Claude Code)

Test the complete user experience:
- Skill interpretation
- Command execution
- Error handling
- Output formatting

Follow `skill-testing.md` for scenarios.

## CI/CD Integration

### GitHub Actions

The project uses GitHub Actions for CI:

```yaml
# .github/workflows/ci.yml
- run: bun install
- run: bun run typecheck
- run: bun test
```

This runs on:
- Every push to `main`
- Every pull request
- Before releases

### Pre-commit Checks

Consider adding pre-commit hooks:

```bash
# .husky/pre-commit
bun run typecheck
bun test
```

## Writing New Tests

### Adding Unit Tests

1. Create or update test file in `tests/`
2. Use Bun's test framework:
   ```typescript
   import { test, expect } from 'bun:test';

   test('description', () => {
     expect(actual).toBe(expected);
   });
   ```
3. Run: `bun test`

### Adding Manual Test Scenarios

1. Update `skill-testing.md`
2. Add new test case with:
   - User input
   - Expected behavior
   - Success criteria
3. Document in results template

### Adding Integration Tests

1. Document setup requirements
2. Create test script or procedure
3. Note any dependencies (auth, extensions, etc.)

## Troubleshooting Tests

### Test Failures

If tests fail:

1. Check if CLI is built: `bun run build`
2. Verify dependencies: `bun install`
3. Check Node/Bun version compatibility
4. Review error messages carefully

### Manual Test Issues

If manual tests fail:

1. **Connection errors**: Enable Playwriter on a Chrome tab
2. **Auth errors**: Log in to target platform
3. **Timeout errors**: Increase timeout with `--timeout`
4. **Not found errors**: Verify URL/username is correct

### Skill Test Issues

If skill tests fail:

1. Verify skill is loaded: `/help` in Claude Code
2. Check CLI is in PATH or use full path
3. Review error messages for exit codes
4. Consult `skill-testing.md` error handling section

## Test Data

### Mock Data

For unit tests, use realistic mock data:

```typescript
const mockProfile = {
  username: 'testuser',
  displayName: 'Test User',
  bio: 'Test bio',
  followersCount: 1000,
  followingCount: 500,
  verified: false,
};
```

### Test Accounts

For integration tests, you may want to use:
- Test Twitter account (public profile)
- Test LinkedIn account (public profile)
- Sample websites (example.com, etc.)

**Never commit real credentials or tokens!**

## Continuous Testing

### When to Run Tests

- Before committing changes
- After updating selectors
- After platform UI changes
- Before releases
- When bugs are reported

### Monitoring Platform Changes

Twitter and LinkedIn frequently update their UI:

1. Monitor for broken selectors
2. Update scrapers as needed
3. Re-run tests after updates
4. Document selector changes

## Contributing Tests

When contributing:

1. Add tests for new features
2. Update existing tests if behavior changes
3. Document test scenarios
4. Ensure all tests pass before PR
5. Update this README if adding new test types

## Test Reports

### Generating Reports

```bash
# Run tests with output
bun test | tee test-results.txt

# Generate coverage report
bun test --coverage
```

### Reporting Issues

When reporting test failures:

1. Include full error message
2. Note environment (OS, Node version, etc.)
3. Describe steps to reproduce
4. Include test output/logs
5. Mention if it's a regression

## Resources

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [Playwright Documentation](https://playwright.dev/)
- [Commander.js Documentation](https://github.com/tj/commander.js)
- [Playwriter Extension](https://github.com/anthropics/playwriter)

## Questions?

If you have questions about tests:

1. Review `skill-testing.md` for skill-specific guidance
2. Check test file comments for utility test details
3. Open an issue on GitHub
4. Consult project documentation in `specs/`
