# Skill Testing Guide - Phase 7.2

This document outlines the testing procedures for the `/scrape` skill with Claude Code.

## Prerequisites

Before testing, ensure:

1. Playwriter extension is installed and active in Chrome
2. Chrome has at least one tab with Playwriter enabled (click the extension icon)
3. You are logged in to Twitter/X and/or LinkedIn if testing authenticated content
4. The CLI is built and accessible: `bun run build`
5. Test the CLI works independently before testing with Claude Code

## Test Setup

### 1. Install CLI Locally

```bash
# From project root
bun run build

# Test CLI is working
./dist/index.js --help
```

### 2. Load Skill in Claude Code

The skill file is located at `skill/scrape.md`. To test it with Claude Code:

**Option A: Copy to User Skills Directory**
```bash
mkdir -p ~/.claude/skills
cp skill/scrape.md ~/.claude/skills/scrape.md
```

**Option B: Reference from Project**
Create a symlink:
```bash
ln -s "$(pwd)/skill/scrape.md" ~/.claude/skills/scrape.md
```

**Option C: Plugin Installation (when ready)**
```bash
# This will work once the plugin is published
/plugin install session-scraper
```

### 3. Verify Skill is Loaded

In Claude Code, check:
```
/help
```

The `/scrape` skill should appear in the list of available skills.

## Test Scenarios

### Test 1: Basic Twitter Profile Request

**User Input:**
```
/scrape @elonmusk twitter
```

**Expected Behavior:**
1. Claude interprets this as a Twitter profile request
2. Removes the `@` symbol from the username
3. Executes: `session-scraper twitter profile elonmusk`
4. Parses JSON output and presents key information:
   - Display name and handle
   - Bio
   - Follower/following counts
   - Verification status

**Success Criteria:**
- Command executes successfully
- Output is parsed and formatted for readability
- No errors or warnings

### Test 2: Twitter Timeline with Count

**User Input:**
```
/scrape last 50 tweets from @anthroploic
```

**Expected Behavior:**
1. Claude interprets count from natural language: "last 50 tweets"
2. Removes `@` symbol
3. Executes: `session-scraper twitter timeline anthroploic --count 50`
4. Presents tweets in a readable format

**Success Criteria:**
- Correct count parameter (50)
- Username normalized correctly
- Output formatted appropriately

### Test 3: LinkedIn Profile

**User Input:**
```
/scrape https://linkedin.com/in/satyanadella
```

**Expected Behavior:**
1. Claude detects LinkedIn URL
2. Executes: `session-scraper linkedin profile "https://linkedin.com/in/satyanadella"`
3. Presents profile information:
   - Name and headline
   - Location
   - Experience summary
   - Education
   - Skills

**Success Criteria:**
- URL properly quoted in command
- Profile information extracted and formatted
- No errors

### Test 4: Ambiguous Request

**User Input:**
```
/scrape satyanadella
```

**Expected Behavior:**
1. Claude recognizes ambiguity (could be Twitter or LinkedIn)
2. Asks user for clarification:
   - "Would you like me to scrape Satya Nadella's Twitter profile or LinkedIn profile?"

**Success Criteria:**
- Claude asks for clarification instead of guessing
- Provides clear options
- Waits for user response before executing

### Test 5: Generic Page Scraping

**User Input:**
```
/scrape this page
```
(When user has a page open in their browser)

**Expected Behavior:**
1. Claude interprets as generic page scrape
2. Executes: `session-scraper page scrape`
3. Presents extracted content (text, links, images)

**Success Criteria:**
- Command executes on current page
- Content is extracted and formatted
- Output is not overwhelming

### Test 6: Twitter Search

**User Input:**
```
/scrape search twitter for "AI agents" with at least 100 retweets
```

**Expected Behavior:**
1. Claude constructs search query with operators
2. Executes: `session-scraper twitter search "AI agents min_retweets:100" --count 20`
3. Presents search results

**Success Criteria:**
- Search operators correctly applied
- Results formatted appropriately
- Reasonable default count

### Test 7: Screenshot Request

**User Input:**
```
/scrape take a full page screenshot
```

**Expected Behavior:**
1. Claude executes: `session-scraper browser screenshot --full-page --output screenshot.png`
2. Confirms screenshot saved
3. May offer to show or analyze it

**Success Criteria:**
- Screenshot command includes --full-page
- Output file is created
- Claude acknowledges success

### Test 8: Navigation and Scraping

**User Input:**
```
/scrape go to news.ycombinator.com and get all article titles
```

**Expected Behavior:**
1. Claude breaks down into steps:
   - Navigate: `session-scraper browser navigate "https://news.ycombinator.com"`
   - Extract: `session-scraper page script "return [...document.querySelectorAll('.titleline > a')].map(a => ({title: a.textContent, url: a.href}))"`
2. Presents articles in a readable list

**Success Criteria:**
- Two commands executed sequentially
- Navigation completes before scraping
- Results formatted as list

## Error Handling Tests

### Test 9: Connection Error (Playwriter Not Running)

**Setup:** Ensure Playwriter is NOT enabled on any tab

**User Input:**
```
/scrape @elonmusk twitter
```

**Expected Behavior:**
1. CLI returns exit code 2
2. Claude detects the error
3. Claude explains to user:
   - "The Playwriter extension isn't running. Please click the Playwriter extension icon in Chrome to enable it on a tab."

**Success Criteria:**
- Error detected and exit code checked
- Helpful message provided to user
- No confusing technical details

### Test 10: Login Required

**Setup:** Not logged in to Twitter/LinkedIn

**User Input:**
```
/scrape @elonmusk twitter
```

**Expected Behavior:**
1. CLI returns exit code 7
2. Claude detects login requirement
3. Claude explains:
   - "You need to be logged in to Twitter. Please open Twitter in your browser and log in, then try again."

**Success Criteria:**
- Exit code 7 detected
- Clear instructions provided
- Platform-specific message

### Test 11: Profile Not Found

**User Input:**
```
/scrape @nonexistentuser12345xyz twitter
```

**Expected Behavior:**
1. CLI returns exit code 8
2. Claude explains:
   - "The profile @nonexistentuser12345xyz does not exist on Twitter."

**Success Criteria:**
- Exit code 8 detected
- Clear message about non-existent profile
- No suggestion to retry (profile won't exist)

### Test 12: Rate Limited

**Setup:** Make many rapid requests to trigger rate limiting

**User Input:**
```
/scrape @user1 twitter
/scrape @user2 twitter
/scrape @user3 twitter
... (repeat rapidly)
```

**Expected Behavior:**
1. CLI returns exit code 6
2. Claude explains:
   - "You've hit the rate limit. Please wait a few minutes before trying again."

**Success Criteria:**
- Exit code 6 detected
- Advice to wait provided
- No immediate retry attempted

## Edge Cases

### Test 13: Very Long Timeline

**User Input:**
```
/scrape get 100 tweets from @elonmusk
```

**Expected Behavior:**
1. Executes: `session-scraper twitter timeline elonmusk --count 100`
2. May take significant time
3. Claude acknowledges it might take a while
4. Formats output appropriately (not overwhelming)

**Success Criteria:**
- Maximum count respected (100 for Twitter)
- Takes time without timeout
- Output manageable

### Test 14: LinkedIn Search with Filters

**User Input:**
```
/scrape search linkedin for "senior engineer" companies
```

**Expected Behavior:**
1. Interprets --type as "companies"
2. Executes: `session-scraper linkedin search "senior engineer" --type companies --count 10`

**Success Criteria:**
- Type parameter correctly set to "companies"
- Reasonable default count
- Results formatted appropriately

### Test 15: Custom JavaScript Execution

**User Input:**
```
/scrape run this javascript: return document.querySelectorAll('img').length
```

**Expected Behavior:**
1. Executes: `session-scraper page script "return document.querySelectorAll('img').length"`
2. Returns the count of images on current page

**Success Criteria:**
- JavaScript properly quoted and escaped
- Result returned and explained
- No security warnings

## Integration Tests

### Test 16: Multi-Step Workflow

**User Input:**
```
/scrape find @paulg on twitter, get his latest 10 tweets, and tell me what he's talking about
```

**Expected Behavior:**
1. Step 1: Profile verification
2. Step 2: `session-scraper twitter timeline paulg --count 10`
3. Step 3: Claude analyzes tweet content and summarizes themes

**Success Criteria:**
- Commands executed in logical order
- Data passed between steps
- Final summary provided

### Test 17: Tab Switching

**User Input:**
```
/scrape list all tabs, switch to tab 2, and scrape that page
```

**Expected Behavior:**
1. `session-scraper browser list`
2. `session-scraper browser switch 2`
3. `session-scraper page scrape`

**Success Criteria:**
- All three commands executed in sequence
- Correct tab selected
- Page content from tab 2 returned

## Performance Tests

### Test 18: Timeout Handling

**User Input:**
```
/scrape navigate to a very slow website
```

**Expected Behavior:**
1. Command times out after default 30 seconds
2. CLI returns exit code 4
3. Claude suggests increasing timeout:
   - "The page took too long to load. Try again, or I can increase the timeout using --timeout 60000."

**Success Criteria:**
- Timeout detected (exit code 4)
- Helpful suggestion provided
- Option to retry with longer timeout

## Documentation Verification

### Test 19: Help Understanding

**User Input:**
```
How do I use the scrape skill?
```

**Expected Behavior:**
1. Claude explains the skill capabilities
2. Mentions prerequisites (Playwriter, login)
3. Provides examples

**Success Criteria:**
- Clear explanation
- Accurate information
- Helpful examples

### Test 20: Command Suggestions

**User Input:**
```
I want to get twitter data but don't know what's available
```

**Expected Behavior:**
1. Claude lists Twitter commands:
   - Profile, timeline, post, search
2. Explains what each does
3. Provides examples

**Success Criteria:**
- All commands mentioned
- Accurate descriptions
- Practical examples

## Test Results Template

Use this template to document test results:

```markdown
## Test Results - [Date]

### Environment
- OS: [macOS/Windows/Linux]
- Node version: [version]
- Bun version: [version]
- Chrome version: [version]
- Playwriter version: [version]

### Test 1: Basic Twitter Profile Request
- Status: [PASS/FAIL]
- Notes: [any observations]
- Screenshot: [if applicable]

### Test 2: Twitter Timeline with Count
- Status: [PASS/FAIL]
- Notes: [any observations]

[... continue for all tests]

### Summary
- Total Tests: 20
- Passed: [count]
- Failed: [count]
- Issues Found: [list any bugs or problems]

### Recommendations
[Any improvements or fixes needed]
```

## Continuous Testing

When to re-test:

1. After updating the skill file
2. After CLI changes
3. After platform UI changes (Twitter/LinkedIn selectors may change)
4. Before releases
5. When users report issues

## Automated Testing Notes

While most skill testing requires manual interaction with Claude Code, some aspects can be automated:

1. **CLI Unit Tests:** Test individual commands work correctly
2. **Exit Code Tests:** Verify proper exit codes for error conditions
3. **JSON Output Tests:** Verify output format is valid JSON
4. **Selector Tests:** Test that selectors find expected elements

See `tests/cli.test.ts` for automated tests.
