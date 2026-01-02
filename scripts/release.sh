#!/bin/bash
# Release script for x-cli
# Usage: ./scripts/release.sh <version>
# Example: ./scripts/release.sh 1.0.0

set -e

VERSION=$1

if [[ -z "$VERSION" ]]; then
  echo "Usage: ./scripts/release.sh <version>"
  echo "Example: ./scripts/release.sh 1.0.0"
  exit 1
fi

if [[ ! $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+\.[0-9]+)?$ ]]; then
  echo "Error: Invalid version format"
  echo "Expected: MAJOR.MINOR.PATCH or MAJOR.MINOR.PATCH-PRERELEASE.N"
  echo "Example: 1.0.0 or 2.0.0-beta.1"
  exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
  echo "Error: Uncommitted changes detected"
  echo "Please commit or stash your changes first"
  exit 1
fi

# Check we're on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" != "main" ]]; then
  echo "Warning: Not on main branch (currently on $BRANCH)"
  read -p "Continue anyway? [y/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "Releasing v$VERSION..."

# Update version in package.json
if command -v jq &> /dev/null; then
  jq ".version = \"$VERSION\"" package.json > tmp.json && mv tmp.json package.json
else
  # Fallback to sed if jq not available
  sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" package.json
  rm -f package.json.bak
fi

# Update CHANGELOG.md - add new version header
DATE=$(date +%Y-%m-%d)
sed -i.bak "s/## \[Unreleased\]/## [Unreleased]\n\n## [$VERSION] - $DATE/" CHANGELOG.md
rm -f CHANGELOG.md.bak

# Add changelog link
if grep -q "\[Unreleased\]:" CHANGELOG.md; then
  # Update existing links
  sed -i.bak "s|\[Unreleased\]:.*|[Unreleased]: https://github.com/ps/x-cli/compare/v$VERSION...HEAD|" CHANGELOG.md
  sed -i.bak "/\[$VERSION\]:/d" CHANGELOG.md
  echo "[$VERSION]: https://github.com/ps/x-cli/releases/tag/v$VERSION" >> CHANGELOG.md
  rm -f CHANGELOG.md.bak
fi

# Run tests
echo "Running tests..."
bun run typecheck
bun test

# Build
echo "Building..."
bun run build

# Commit changes
git add package.json CHANGELOG.md
git commit -m "chore: release v$VERSION"

# Create tag
git tag -a "v$VERSION" -m "Release v$VERSION"

echo ""
echo "Release v$VERSION prepared!"
echo ""
echo "To publish:"
echo "  git push origin main --tags"
echo ""
echo "This will trigger the GitHub Actions release workflow."
