#!/bin/bash
# Update Homebrew formula with SHA256 hashes from release artifacts
# Usage: ./scripts/update-homebrew.sh <version>

set -e

VERSION="${1:-$(jq -r .version package.json)}"
FORMULA="homebrew/x-cli.rb"
BASE_URL="https://github.com/ps/x-cli/releases/download/v${VERSION}"

echo "Updating Homebrew formula for version ${VERSION}..."

# Function to get SHA256 from URL
get_sha256() {
  local url="$1"
  curl -sL "$url" | shasum -a 256 | cut -d' ' -f1
}

# Update version in formula
sed -i '' "s/version \".*\"/version \"${VERSION}\"/" "$FORMULA"

# Get SHA256 for each platform
echo "Fetching SHA256 for darwin-arm64..."
SHA_DARWIN_ARM64=$(get_sha256 "${BASE_URL}/x-cli-darwin-arm64.tar.gz")
echo "  $SHA_DARWIN_ARM64"

echo "Fetching SHA256 for darwin-x64..."
SHA_DARWIN_X64=$(get_sha256 "${BASE_URL}/x-cli-darwin-x64.tar.gz")
echo "  $SHA_DARWIN_X64"

echo "Fetching SHA256 for linux-x64..."
SHA_LINUX_X64=$(get_sha256 "${BASE_URL}/x-cli-linux-x64.tar.gz")
echo "  $SHA_LINUX_X64"

# Update SHA256 placeholders in formula
sed -i '' "s/PLACEHOLDER_SHA256_DARWIN_ARM64/${SHA_DARWIN_ARM64}/" "$FORMULA"
sed -i '' "s/PLACEHOLDER_SHA256_DARWIN_X64/${SHA_DARWIN_X64}/" "$FORMULA"
sed -i '' "s/PLACEHOLDER_SHA256_LINUX_X64/${SHA_LINUX_X64}/" "$FORMULA"

echo "Formula updated successfully!"
echo ""
echo "To install locally:"
echo "  brew install --formula homebrew/x-cli.rb"
echo ""
echo "To publish to a tap:"
echo "  1. Create a repo: homebrew-x-cli"
echo "  2. Copy homebrew/x-cli.rb to Formula/x-cli.rb"
echo "  3. Users install with: brew tap ps/x-cli && brew install x-cli"
