class Browse < Formula
  desc "Scrape any webpage to markdown using your browser session"
  homepage "https://github.com/PepijnSenders/browse-cli"
  version "1.0.4"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/PepijnSenders/browse-cli/releases/download/v#{version}/browse-darwin-arm64.tar.gz"
      sha256 "2a3f5ca48ae3fa46f6dccdfb2ed86963fb64bb4832c04601a703eb560b5c40a5"
    end
    on_intel do
      url "https://github.com/PepijnSenders/browse-cli/releases/download/v#{version}/browse-darwin-x64.tar.gz"
      sha256 "816d8085cda85b1eff457893805a7f8c11f1904bc253ff0bc2462eb04668a843"
    end
  end

  on_linux do
    on_intel do
      url "https://github.com/PepijnSenders/browse-cli/releases/download/v#{version}/browse-linux-x64.tar.gz"
      sha256 "61ae6c77066539760987dce372303cfc06b003b7512aeaaca4be219e3ad2d670"
    end
  end

  def install
    # The tarball extracts to browse-{platform}/
    # Find the binary and extension
    bin.install Dir["browse-*/browse"].first => "browse"

    # Install extension for Chrome
    pkgshare.install Dir["browse-*/extension"].first => "extension"
    pkgshare.install Dir["browse-*/skills"].first => "skills"
  end

  def caveats
    <<~EOS
      To use browse, install the Chrome extension:

      1. Open chrome://extensions in Chrome
      2. Enable "Developer mode" (top right)
      3. Click "Load unpacked"
      4. Select: #{pkgshare}/extension

      Then start the daemon:
        browse init

      And scrape any page:
        browse https://example.com
    EOS
  end

  test do
    assert_match "browse", shell_output("#{bin}/browse --help")
    assert_match version.to_s, shell_output("#{bin}/browse --version")
  end
end
