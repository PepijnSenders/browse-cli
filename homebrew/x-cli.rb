# typed: false
# frozen_string_literal: true

class XCli < Formula
  desc "A fast, type-safe CLI for X (Twitter)"
  homepage "https://github.com/PepijnSenders/x-cli"
  version "0.1.0"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/PepijnSenders/x-cli/releases/download/v#{version}/x-cli-darwin-arm64.tar.gz"
      sha256 "PLACEHOLDER_SHA256_DARWIN_ARM64"
    end
    on_intel do
      url "https://github.com/PepijnSenders/x-cli/releases/download/v#{version}/x-cli-darwin-x64.tar.gz"
      sha256 "PLACEHOLDER_SHA256_DARWIN_X64"
    end
  end

  on_linux do
    on_intel do
      url "https://github.com/PepijnSenders/x-cli/releases/download/v#{version}/x-cli-linux-x64.tar.gz"
      sha256 "PLACEHOLDER_SHA256_LINUX_X64"
    end
  end

  def install
    bin.install "x"
  end

  test do
    assert_match "x-cli", shell_output("#{bin}/x --version")
  end
end
