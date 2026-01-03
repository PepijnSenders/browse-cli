# Test Results - [Date]

## Environment

- **Date:** [YYYY-MM-DD]
- **Tester:** [Your Name]
- **OS:** [macOS 14.1 / Windows 11 / Ubuntu 22.04]
- **Node version:** [v20.x.x]
- **Bun version:** [1.x.x]
- **Chrome version:** [120.x.x]
- **Playwriter version:** [0.x.x]
- **CLI version:** [version from package.json]

## Test Summary

| Category | Total | Passed | Failed | Skipped |
|----------|-------|--------|--------|---------|
| Automated Unit Tests | X | X | X | X |
| Manual CLI Tests | X | X | X | X |
| Skill Tests | 20 | X | X | X |
| **Total** | **X** | **X** | **X** | **X** |

## Automated Tests

### Unit Tests (bun test)

**Command:** `bun test`

**Result:** [PASS / FAIL]

**Output:**
```
[Paste test output here]
```

**Notes:**
- [Any observations about test performance, warnings, etc.]

### Type Checking

**Command:** `bun run typecheck`

**Result:** [PASS / FAIL]

**Output:**
```
[Paste output here]
```

**Notes:**
- [Any type errors or warnings]

## Manual CLI Tests

### Test: Basic Commands

**Command:** `./tests/manual-test.sh`

**Result:** [PASS / FAIL]

**Notes:**
- [Observations from running the manual test script]

## Claude Code Skill Tests

### Setup

- [ ] Skill installed at: `~/.claude/skills/scrape.md`
- [ ] Skill appears in `/help`
- [ ] Playwriter enabled on test tab
- [ ] Logged in to Twitter: [YES / NO]
- [ ] Logged in to LinkedIn: [YES / NO]

---

### Test 1: Basic Twitter Profile Request

**User Input:** `/scrape @elonmusk twitter`

**Expected:** Profile information displayed

**Result:** [PASS / FAIL]

**Actual Command Executed:**
```bash
[Command that Claude ran]
```

**Output:**
```
[Claude's response]
```

**Notes:**
- [Any issues, observations, or deviations from expected behavior]

**Screenshot:** [If applicable]

---

### Test 2: Twitter Timeline with Count

**User Input:** `/scrape last 50 tweets from @anthroploic`

**Expected:** 50 tweets from timeline

**Result:** [PASS / FAIL]

**Actual Command:**
```bash
[Command executed]
```

**Output:**
```
[Response summary]
```

**Notes:**

---

### Test 3: LinkedIn Profile

**User Input:** `/scrape https://linkedin.com/in/satyanadella`

**Expected:** Profile information

**Result:** [PASS / FAIL]

**Actual Command:**
```bash
[Command executed]
```

**Output:**
```
[Response summary]
```

**Notes:**

---

### Test 4: Ambiguous Request

**User Input:** `/scrape satyanadella`

**Expected:** Claude asks for clarification (Twitter or LinkedIn?)

**Result:** [PASS / FAIL]

**Claude's Response:**
```
[Full response]
```

**Notes:**
- Did Claude correctly identify ambiguity?
- Was the clarification request clear?

---

### Test 5: Generic Page Scraping

**User Input:** `/scrape this page`

**Expected:** Content from current page

**Result:** [PASS / FAIL]

**Actual Command:**
```bash
[Command executed]
```

**Output:**
```
[Response summary]
```

**Notes:**

---

### Test 6: Twitter Search

**User Input:** `/scrape search twitter for "AI agents" with at least 100 retweets`

**Expected:** Search results with operator applied

**Result:** [PASS / FAIL]

**Actual Command:**
```bash
[Command executed]
```

**Output:**
```
[Response summary]
```

**Notes:**
- Were search operators correctly applied?

---

### Test 7: Screenshot Request

**User Input:** `/scrape take a full page screenshot`

**Expected:** Screenshot saved

**Result:** [PASS / FAIL]

**Actual Command:**
```bash
[Command executed]
```

**Output:**
```
[Response]
```

**Notes:**

---

### Test 8: Navigation and Scraping

**User Input:** `/scrape go to news.ycombinator.com and get all article titles`

**Expected:** Two-step process: navigate then extract

**Result:** [PASS / FAIL]

**Commands Executed:**
```bash
[Command 1]
[Command 2]
```

**Output:**
```
[Response summary]
```

**Notes:**

---

## Error Handling Tests

### Test 9: Connection Error (Playwriter Not Running)

**Setup:** Disabled Playwriter

**User Input:** `/scrape @elonmusk twitter`

**Expected:** Helpful error message about Playwriter

**Result:** [PASS / FAIL]

**Claude's Response:**
```
[Full response]
```

**Notes:**
- Did Claude detect exit code 2?
- Was the error message helpful?

---

### Test 10: Login Required

**Setup:** Not logged in

**User Input:** `/scrape @elonmusk twitter`

**Expected:** Message to log in

**Result:** [PASS / FAIL / SKIP]

**Claude's Response:**
```
[Response]
```

**Notes:**

---

### Test 11: Profile Not Found

**User Input:** `/scrape @nonexistentuser12345xyz twitter`

**Expected:** Profile does not exist message

**Result:** [PASS / FAIL]

**Claude's Response:**
```
[Response]
```

**Notes:**

---

### Test 12: Rate Limited

**Setup:** Made many rapid requests

**User Input:** Multiple profile requests in quick succession

**Expected:** Rate limit message with wait advice

**Result:** [PASS / FAIL / SKIP]

**Claude's Response:**
```
[Response]
```

**Notes:**

---

## Edge Cases

### Test 13: Very Long Timeline

**User Input:** `/scrape get 100 tweets from @elonmusk`

**Expected:** 100 tweets (may take time)

**Result:** [PASS / FAIL / SKIP]

**Notes:**

---

### Test 14: LinkedIn Search with Filters

**User Input:** `/scrape search linkedin for "senior engineer" companies`

**Expected:** Company search results

**Result:** [PASS / FAIL / SKIP]

**Notes:**

---

### Test 15: Custom JavaScript Execution

**User Input:** `/scrape run this javascript: return document.querySelectorAll('img').length`

**Expected:** Count of images

**Result:** [PASS / FAIL / SKIP]

**Notes:**

---

## Integration Tests

### Test 16: Multi-Step Workflow

**User Input:** `/scrape find @paulg on twitter, get his latest 10 tweets, and tell me what he's talking about`

**Expected:** Profile check, timeline fetch, analysis

**Result:** [PASS / FAIL / SKIP]

**Notes:**

---

### Test 17: Tab Switching

**User Input:** `/scrape list all tabs, switch to tab 2, and scrape that page`

**Expected:** List, switch, scrape in sequence

**Result:** [PASS / FAIL / SKIP]

**Notes:**

---

## Performance Tests

### Test 18: Timeout Handling

**User Input:** Navigate to very slow website

**Expected:** Timeout detected with helpful suggestion

**Result:** [PASS / FAIL / SKIP]

**Notes:**

---

## Documentation Tests

### Test 19: Help Understanding

**User Input:** `How do I use the scrape skill?`

**Expected:** Clear explanation with examples

**Result:** [PASS / FAIL]

**Notes:**

---

### Test 20: Command Suggestions

**User Input:** `I want to get twitter data but don't know what's available`

**Expected:** List of commands with descriptions

**Result:** [PASS / FAIL]

**Notes:**

---

## Issues Found

### Issue 1: [Title]

**Severity:** [Critical / High / Medium / Low]

**Description:**
[Detailed description of the issue]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots/Logs:**
```
[Include relevant logs or screenshots]
```

**Workaround:**
[If any workaround exists]

---

### Issue 2: [Title]

[Same format as above]

---

## Recommendations

### High Priority

- [ ] [Critical fixes or improvements]

### Medium Priority

- [ ] [Important but not blocking]

### Low Priority

- [ ] [Nice to have improvements]

### Documentation Updates

- [ ] [Docs that need updating based on test results]

## Overall Assessment

**Skill Readiness:** [Ready for Release / Needs Work / Significant Issues]

**Summary:**
[Overall assessment of the skill's functionality and user experience]

**Strengths:**
- [What works well]

**Weaknesses:**
- [What needs improvement]

**User Experience:**
- [Comments on ease of use, clarity, etc.]

## Next Steps

1. [Action item 1]
2. [Action item 2]
3. [Action item 3]

## Tester Sign-off

**Tester:** [Your Name]
**Date:** [YYYY-MM-DD]
**Status:** [Approved / Approved with Comments / Needs Revision]

**Comments:**
[Final comments or notes]
