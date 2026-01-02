# Phase 9: Release & Distribution

## Objectives

- Automated GitHub releases with binaries
- Homebrew tap for macOS/Linux installation
- CI/CD workflow for publishing
- Version management and changelogs

## GitHub Releases

### Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            target: linux-x64
          - os: macos-latest
            target: darwin-x64
          - os: macos-latest
            target: darwin-arm64
          - os: windows-latest
            target: win-x64

    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2

      - run: bun install
      - run: bun run build --target=${{ matrix.target }}

      - name: Package binary
        run: |
          mkdir -p dist
          tar -czvf dist/x-cli-${{ matrix.target }}.tar.gz \
            -C dist x

      - uses: actions/upload-artifact@v4
        with:
          name: x-cli-${{ matrix.target }}
          path: dist/x-cli-${{ matrix.target }}.tar.gz

  release:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/download-artifact@v4
        with:
          path: artifacts

      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          files: artifacts/**/*.tar.gz
          generate_release_notes: true
          draft: false
          prerelease: ${{ contains(github.ref, 'beta') || contains(github.ref, 'alpha') }}
```

### Build Targets

| Platform | Architecture | Binary Name |
|----------|--------------|-------------|
| Linux | x64 | `x-cli-linux-x64.tar.gz` |
| macOS | x64 | `x-cli-darwin-x64.tar.gz` |
| macOS | ARM64 | `x-cli-darwin-arm64.tar.gz` |
| Windows | x64 | `x-cli-win-x64.zip` |

### Build Script

```json
// package.json
{
  "scripts": {
    "build": "bun build src/index.ts --compile --outfile dist/x",
    "build:linux": "bun build src/index.ts --compile --target=bun-linux-x64 --outfile dist/x",
    "build:darwin": "bun build src/index.ts --compile --target=bun-darwin-arm64 --outfile dist/x",
    "build:win": "bun build src/index.ts --compile --target=bun-windows-x64 --outfile dist/x.exe"
  }
}
```

## Homebrew Tap

### Tap Repository Structure

```
homebrew-x-cli/
├── Formula/
│   └── x-cli.rb
├── README.md
└── .github/
    └── workflows/
        └── test.yml
```

### Formula

```ruby
# Formula/x-cli.rb
class XCli < Formula
  desc "Fast, type-safe CLI for X (Twitter)"
  homepage "https://github.com/YOUR_USERNAME/x-cli"
  version "1.0.0"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/YOUR_USERNAME/x-cli/releases/download/v#{version}/x-cli-darwin-arm64.tar.gz"
      sha256 "DARWIN_ARM64_SHA256"
    end
    on_intel do
      url "https://github.com/YOUR_USERNAME/x-cli/releases/download/v#{version}/x-cli-darwin-x64.tar.gz"
      sha256 "DARWIN_X64_SHA256"
    end
  end

  on_linux do
    url "https://github.com/YOUR_USERNAME/x-cli/releases/download/v#{version}/x-cli-linux-x64.tar.gz"
    sha256 "LINUX_X64_SHA256"
  end

  def install
    bin.install "x"
  end

  def caveats
    <<~EOS
      To get started:
        x auth login

      For shell completions:
        x completion bash > $(brew --prefix)/etc/bash_completion.d/x
        x completion zsh > $(brew --prefix)/share/zsh/site-functions/_x
    EOS
  end

  test do
    assert_match "x-cli", shell_output("#{bin}/x --version")
  end
end
```

### Installation

```bash
# Add tap
brew tap YOUR_USERNAME/x-cli

# Install
brew install x-cli

# Upgrade
brew upgrade x-cli
```

### Auto-Update Formula

```yaml
# .github/workflows/update-formula.yml
name: Update Homebrew Formula

on:
  release:
    types: [published]

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          repository: YOUR_USERNAME/homebrew-x-cli
          token: ${{ secrets.HOMEBREW_TAP_TOKEN }}

      - name: Update formula
        run: |
          VERSION=${GITHUB_REF#refs/tags/v}

          # Download and compute SHA256
          for target in darwin-arm64 darwin-x64 linux-x64; do
            curl -sL "https://github.com/YOUR_USERNAME/x-cli/releases/download/v${VERSION}/x-cli-${target}.tar.gz" \
              | sha256sum | cut -d' ' -f1 > /tmp/${target}.sha256
          done

          # Update formula
          sed -i "s/version \".*\"/version \"${VERSION}\"/" Formula/x-cli.rb
          sed -i "s/DARWIN_ARM64_SHA256/$(cat /tmp/darwin-arm64.sha256)/" Formula/x-cli.rb
          sed -i "s/DARWIN_X64_SHA256/$(cat /tmp/darwin-x64.sha256)/" Formula/x-cli.rb
          sed -i "s/LINUX_X64_SHA256/$(cat /tmp/linux-x64.sha256)/" Formula/x-cli.rb

      - name: Commit and push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add Formula/x-cli.rb
          git commit -m "Update x-cli to ${GITHUB_REF#refs/tags/}"
          git push
```

## Version Management

### Semantic Versioning

```
MAJOR.MINOR.PATCH[-PRERELEASE]

1.0.0        # Stable release
1.1.0        # New features
1.1.1        # Bug fixes
2.0.0-beta.1 # Breaking changes preview
```

### Release Script

```bash
#!/bin/bash
# scripts/release.sh

set -e

VERSION=$1

if [[ ! $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+\.[0-9]+)?$ ]]; then
  echo "Usage: ./scripts/release.sh <version>"
  echo "Example: ./scripts/release.sh 1.0.0"
  exit 1
fi

# Update version
jq ".version = \"$VERSION\"" package.json > tmp.json && mv tmp.json package.json

# Update CHANGELOG
echo "## v$VERSION - $(date +%Y-%m-%d)" | cat - CHANGELOG.md > tmp && mv tmp CHANGELOG.md

# Commit and tag
git add package.json CHANGELOG.md
git commit -m "chore: release v$VERSION"
git tag "v$VERSION"

echo "Ready to push. Run:"
echo "  git push origin main --tags"
```

## CHANGELOG

### Format

```markdown
# Changelog

## v1.1.0 - 2025-01-15

### Added
- `x grok analyze` command for content analysis
- Shell completions for fish

### Changed
- Improved rate limit handling

### Fixed
- Auth token refresh loop issue

## v1.0.0 - 2025-01-01

### Added
- Initial release
- Full X API v2 support
- OAuth 2.0 PKCE authentication
- Grok AI integration
```

## CI/CD Pipeline

### Full Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2

      - run: bun install
      - run: bun run typecheck
      - run: bun test --coverage
      - run: bunx 0xc

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2

      - run: bun install
      - run: bun run build

      - name: Check binary size
        run: |
          SIZE=$(stat -f%z dist/x 2>/dev/null || stat -c%s dist/x)
          if [ $SIZE -gt 10485760 ]; then
            echo "Binary too large: ${SIZE} bytes (max 10MB)"
            exit 1
          fi
```

## npm Publishing (Optional)

```yaml
# .github/workflows/npm.yml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2

      - run: bun install
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Verification Checklist

### GitHub Releases
- [ ] Release workflow triggers on tags
- [ ] Binaries build for all platforms
- [ ] Artifacts upload successfully
- [ ] Release notes generate correctly
- [ ] SHA256 checksums included

### Homebrew Tap
- [ ] Formula installs successfully
- [ ] `brew test x-cli` passes
- [ ] Shell completions instructions work
- [ ] Auto-update workflow triggers

### Version Management
- [ ] `x --version` shows correct version
- [ ] CHANGELOG follows format
- [ ] Release script works
- [ ] Tags push correctly

### CI/CD
- [ ] Tests run on all PRs
- [ ] Build size check works
- [ ] npm publish works (if enabled)
