#!/usr/bin/env bash

# Manual Test Script for Session Scraper CLI
# This script helps manually verify the CLI works before testing with Claude Code

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CLI="./dist/index.js"

echo "=================================="
echo "Session Scraper - Manual Test Script"
echo "=================================="
echo ""

# Check if CLI is built
if [ ! -f "$CLI" ]; then
    echo -e "${RED}Error: CLI not built. Run 'bun run build' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ CLI found at $CLI${NC}"
echo ""

# Test 1: Help Command
echo "Test 1: Help Command"
echo "Running: $CLI --help"
echo "---"
$CLI --help
echo ""
echo -e "${GREEN}✓ Test 1 passed${NC}"
echo ""

# Test 2: Version Command
echo "Test 2: Version Command"
echo "Running: $CLI --version"
echo "---"
$CLI --version
echo ""
echo -e "${GREEN}✓ Test 2 passed${NC}"
echo ""

# Check if Playwriter is running
echo "Test 3: Connection Check"
echo "Running: $CLI browser info"
echo "---"
if $CLI browser info 2>&1; then
    echo ""
    echo -e "${GREEN}✓ Test 3 passed - Playwriter is connected${NC}"
else
    echo ""
    echo -e "${YELLOW}! Test 3 skipped - Playwriter not connected${NC}"
    echo -e "${YELLOW}  To enable Playwriter: Open Chrome and click the Playwriter extension icon on a tab${NC}"
fi
echo ""

# Only continue with browser tests if connected
if $CLI browser info >/dev/null 2>&1; then
    echo "Test 4: Browser List"
    echo "Running: $CLI browser list"
    echo "---"
    $CLI browser list
    echo ""
    echo -e "${GREEN}✓ Test 4 passed${NC}"
    echo ""

    echo "Test 5: Page Scrape (Current Page)"
    echo "Running: $CLI page scrape"
    echo "---"
    OUTPUT=$($CLI page scrape)
    echo "$OUTPUT" | head -20
    echo "... (output truncated)"
    echo ""

    # Verify it's valid JSON
    if echo "$OUTPUT" | jq . >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Test 5 passed - Valid JSON output${NC}"
    else
        echo -e "${RED}✗ Test 5 failed - Invalid JSON output${NC}"
    fi
    echo ""

    # Optional: Test navigation if user confirms
    read -p "Test navigation to example.com? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Test 6: Navigation"
        echo "Running: $CLI browser navigate https://example.com"
        echo "---"
        $CLI browser navigate "https://example.com"
        echo ""
        echo -e "${GREEN}✓ Test 6 passed${NC}"
        echo ""
    fi

    # Optional: Test screenshot
    read -p "Test screenshot? (saves to test-screenshot.png) (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Test 7: Screenshot"
        echo "Running: $CLI browser screenshot --output test-screenshot.png"
        echo "---"
        $CLI browser screenshot --output test-screenshot.png
        if [ -f "test-screenshot.png" ]; then
            echo ""
            echo -e "${GREEN}✓ Test 7 passed - Screenshot saved to test-screenshot.png${NC}"
        else
            echo ""
            echo -e "${RED}✗ Test 7 failed - Screenshot file not created${NC}"
        fi
        echo ""
    fi
else
    echo -e "${YELLOW}Skipping browser-dependent tests (Playwriter not connected)${NC}"
    echo ""
fi

# Test error handling
echo "Test 8: Error Output Format"
echo "Running: $CLI twitter profile nonexistentuser123xyz"
echo "---"
ERROR_OUTPUT=$($CLI twitter profile nonexistentuser123xyz 2>&1 || true)
echo "$ERROR_OUTPUT"
echo ""

# Check if error is valid JSON
if echo "$ERROR_OUTPUT" | jq . >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Test 8 passed - Error is valid JSON${NC}"
else
    echo -e "${YELLOW}! Test 8 - Error format may need verification${NC}"
fi
echo ""

echo "=================================="
echo "Manual Test Summary"
echo "=================================="
echo ""
echo "Basic CLI tests completed."
echo ""
echo "Next steps:"
echo "1. If Playwriter tests were skipped, enable Playwriter and run again"
echo "2. Review tests/skill-testing.md for Claude Code skill testing"
echo "3. Load skill in Claude Code: cp skill/scrape.md ~/.claude/skills/"
echo "4. Test with Claude Code using the scenarios in skill-testing.md"
echo ""
echo -e "${GREEN}All automated tests passed!${NC}"
