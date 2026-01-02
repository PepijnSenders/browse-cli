# Phase 11: Website

## Objectives

- Simple, elegant GitHub Pages site
- Fast loading, minimal dependencies
- Command reference and installation
- Mobile-friendly design

## Design Principles

- **Single page** — Everything above the fold or one scroll
- **Dark mode first** — Matches terminal aesthetic
- **No JavaScript required** — Static HTML/CSS only (JS optional for theme toggle)
- **Fast** — < 100KB total, loads in < 1s

## Site Structure

```
docs/
├── index.html
├── styles.css
├── demo.gif
└── favicon.ico
```

## Page Sections

```
┌─────────────────────────────────────┐
│            HERO                     │
│  X CLI - Fast CLI for X (Twitter)   │
│  [Install] [GitHub] [Docs]          │
├─────────────────────────────────────┤
│          INSTALLATION               │
│  brew install · npm · download      │
├─────────────────────────────────────┤
│             DEMO                    │
│        [Terminal GIF]               │
├─────────────────────────────────────┤
│           FEATURES                  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │Posts│ │Users│ │Grok │ │More │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
├─────────────────────────────────────┤
│          QUICK START                │
│  x auth login                       │
│  x post "Hello!"                    │
│  x timeline home                    │
├─────────────────────────────────────┤
│            FOOTER                   │
│  MIT · GitHub · Made with Bun       │
└─────────────────────────────────────┘
```

## HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>X CLI - Fast CLI for X (Twitter)</title>
  <meta name="description" content="A fast, type-safe CLI for X (Twitter) with OAuth 2.0, Grok AI, and beautiful terminal output.">
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="favicon.ico">
</head>
<body>
  <!-- Hero -->
  <header class="hero">
    <h1>X CLI</h1>
    <p class="tagline">Fast, type-safe CLI for X (Twitter)</p>
    <div class="cta">
      <a href="#install" class="btn primary">Install</a>
      <a href="https://github.com/YOUR_USERNAME/x-cli" class="btn secondary">GitHub</a>
    </div>
  </header>

  <!-- Install -->
  <section id="install" class="install">
    <h2>Installation</h2>
    <div class="install-options">
      <div class="install-option">
        <h3>Homebrew</h3>
        <pre><code>brew tap YOUR_USERNAME/x-cli
brew install x-cli</code></pre>
      </div>
      <div class="install-option">
        <h3>npm</h3>
        <pre><code>npm install -g x-cli</code></pre>
      </div>
      <div class="install-option">
        <h3>Download</h3>
        <a href="https://github.com/YOUR_USERNAME/x-cli/releases">View Releases</a>
      </div>
    </div>
  </section>

  <!-- Demo -->
  <section class="demo">
    <img src="demo.gif" alt="X CLI Demo" loading="lazy">
  </section>

  <!-- Features -->
  <section class="features">
    <h2>Features</h2>
    <div class="feature-grid">
      <div class="feature">
        <h3>Posts & Timelines</h3>
        <p>Create, read, search, and engage with posts. View home, user, and mention timelines.</p>
      </div>
      <div class="feature">
        <h3>Users & Social</h3>
        <p>Follow, block, mute. View followers and following. Manage your social graph.</p>
      </div>
      <div class="feature">
        <h3>Grok AI</h3>
        <p>Summarize threads, analyze content, draft posts, and get suggested replies.</p>
      </div>
      <div class="feature">
        <h3>Lists & DMs</h3>
        <p>Create and manage lists. Send and receive direct messages.</p>
      </div>
    </div>
  </section>

  <!-- Quick Start -->
  <section class="quickstart">
    <h2>Quick Start</h2>
    <pre><code><span class="comment"># Authenticate</span>
x auth login

<span class="comment"># Post something</span>
x post create "Hello from x-cli!"

<span class="comment"># View your timeline</span>
x timeline home

<span class="comment"># Ask Grok</span>
x grok "summarize @elonmusk"</code></pre>
  </section>

  <!-- Footer -->
  <footer>
    <p>MIT License · <a href="https://github.com/YOUR_USERNAME/x-cli">GitHub</a> · Built with <a href="https://bun.sh">Bun</a></p>
  </footer>
</body>
</html>
```

## CSS Styles

```css
/* styles.css */

:root {
  --bg: #0d1117;
  --surface: #161b22;
  --border: #30363d;
  --text: #e6edf3;
  --text-muted: #8b949e;
  --accent: #58a6ff;
  --accent-hover: #79b8ff;
  --code-bg: #1c2128;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

/* Hero */
.hero {
  text-align: center;
  padding: 6rem 2rem;
  background: linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%);
}

.hero h1 {
  font-size: 4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.tagline {
  font-size: 1.25rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.btn.primary {
  background: var(--accent);
  color: var(--bg);
}

.btn.primary:hover {
  background: var(--accent-hover);
}

.btn.secondary {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn.secondary:hover {
  border-color: var(--text-muted);
}

/* Sections */
section {
  max-width: 900px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

section h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

/* Install */
.install-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.install-option {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
}

.install-option h3 {
  font-size: 1rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.install-option pre {
  background: var(--code-bg);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.install-option code {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.875rem;
}

.install-option a {
  color: var(--accent);
  text-decoration: none;
}

.install-option a:hover {
  text-decoration: underline;
}

/* Demo */
.demo {
  text-align: center;
}

.demo img {
  max-width: 100%;
  border-radius: 8px;
  border: 1px solid var(--border);
}

/* Features */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.feature {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
}

.feature h3 {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.feature p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Quick Start */
.quickstart pre {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  overflow-x: auto;
}

.quickstart code {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.9rem;
  line-height: 1.8;
}

.quickstart .comment {
  color: var(--text-muted);
}

/* Footer */
footer {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

footer a {
  color: var(--accent);
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}

/* Mobile */
@media (max-width: 600px) {
  .hero h1 {
    font-size: 2.5rem;
  }

  .cta {
    flex-direction: column;
    align-items: center;
  }

  section {
    padding: 3rem 1rem;
  }
}
```

## GitHub Pages Setup

### Enable Pages

1. Go to repo **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main`, folder: `/docs`
4. Save

### Custom Domain (Optional)

```
docs/CNAME
```

```
x-cli.example.com
```

### Deployment Workflow

```yaml
# .github/workflows/pages.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Assets

### Favicon

Generate a simple favicon:
- 32x32 PNG with "X" letter
- Use dark background (#0d1117) with white text
- Convert to .ico

### Demo GIF

```bash
# Record terminal
asciinema rec demo.cast

# Demo script
x auth status
x timeline home --limit 3
x post create "Testing x-cli!"
x grok "what's trending?"

# Convert to GIF
agg demo.cast docs/demo.gif \
  --theme monokai \
  --font-size 14 \
  --cols 80 \
  --rows 20
```

### Open Graph Image

Create a 1200x630 PNG for social sharing:

```html
<meta property="og:image" content="https://YOUR_USERNAME.github.io/x-cli/og.png">
<meta property="og:title" content="X CLI">
<meta property="og:description" content="Fast, type-safe CLI for X (Twitter)">
```

## SEO

### Meta Tags

```html
<head>
  <!-- Primary -->
  <title>X CLI - Fast CLI for X (Twitter)</title>
  <meta name="description" content="A fast, type-safe CLI for X (Twitter) with OAuth 2.0, Grok AI, and beautiful terminal output.">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://YOUR_USERNAME.github.io/x-cli/">
  <meta property="og:title" content="X CLI">
  <meta property="og:description" content="Fast, type-safe CLI for X (Twitter)">
  <meta property="og:image" content="https://YOUR_USERNAME.github.io/x-cli/og.png">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="X CLI">
  <meta name="twitter:description" content="Fast, type-safe CLI for X (Twitter)">
  <meta name="twitter:image" content="https://YOUR_USERNAME.github.io/x-cli/og.png">
</head>
```

## Verification Checklist

### Design
- [ ] Loads in < 1s
- [ ] Total size < 100KB
- [ ] Mobile responsive
- [ ] Dark mode looks good
- [ ] No JavaScript errors (if JS used)

### Content
- [ ] Installation instructions clear
- [ ] Demo GIF shows key features
- [ ] Quick start is copy-pasteable
- [ ] All links work

### SEO
- [ ] Title and description set
- [ ] Open Graph tags present
- [ ] Twitter card configured
- [ ] Favicon shows

### GitHub Pages
- [ ] Pages enabled in settings
- [ ] Site deploys on push
- [ ] HTTPS enforced
- [ ] Custom domain works (if configured)
