# Homebrew Tap Setup

This directory contains the Homebrew formula for browse-cli. To publish it:

## 1. Create the Tap Repository

Create a new GitHub repository named `homebrew-tap`:

```bash
gh repo create homebrew-tap --public --description "Homebrew formulae for PepijnSenders packages"
```

## 2. Set Up the Repository

```bash
git clone https://github.com/PepijnSenders/homebrew-tap
cd homebrew-tap
mkdir -p Formula
```

## 3. Update the Formula SHA256

After publishing to npm, get the SHA256:

```bash
curl -sL https://registry.npmjs.org/browse-cli/-/browse-cli-1.0.0.tgz | shasum -a 256
```

Update `browse.rb` with the actual SHA256.

## 4. Copy and Commit

```bash
cp /path/to/browse-cli/homebrew/browse.rb Formula/
git add Formula/browse.rb
git commit -m "Add browse formula v1.0.0"
git push origin main
```

## 5. Test Installation

```bash
brew tap pepijnsenders/tap
brew install browse
```

## Updating the Formula

When releasing a new version:

1. Update the `url` with the new version
2. Update the `sha256` (get it with `curl -sL <url> | shasum -a 256`)
3. Commit and push

## Users Install With

```bash
brew tap pepijnsenders/tap
brew install browse
```
