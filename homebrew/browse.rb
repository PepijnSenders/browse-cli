class Browse < Formula
  desc "Scrape any webpage to markdown using your browser session"
  homepage "https://github.com/PepijnSenders/browse-cli"
  url "https://registry.npmjs.org/@pep/browse-cli/-/browse-cli-1.0.3.tgz"
  sha256 "c8a58e4a16183ffd07a7c63b2cea1cd00b2ae130daaecf387fb18644616ff020"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  def caveats
    <<~EOS
      To use browse, you need to install the Chrome extension:

      1. Open chrome://extensions in Chrome
      2. Enable "Developer mode" (top right)
      3. Click "Load unpacked"
      4. Select: #{opt_libexec}/lib/node_modules/@pep/browse-cli/extension

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
