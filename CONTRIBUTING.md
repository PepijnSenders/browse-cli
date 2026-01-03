# Contributing to browse-cli

Thanks for your interest in contributing to browse-cli!

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) (runtime and package manager)
- Chrome browser
- Node.js >= 18.0.0

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/PepijnSenders/browse-cli
   cd browse-cli
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Build the project:
   ```bash
   bun run build
   ```

4. Load the extension in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/` folder

5. Link for local testing:
   ```bash
   npm link
   ```

### Development Commands

```bash
bun run dev        # Run in development mode
bun run build      # Build for production
bun run typecheck  # Type check with TypeScript
bun test           # Run tests
bun run lint       # Lint code
bun run format     # Format code
```

## Project Structure

```
browse-cli/
├── src/
│   ├── cli.ts           # CLI entry point
│   ├── daemon.ts        # WebSocket relay server
│   ├── scrape.ts        # Core scraping logic
│   └── utils/
│       ├── errors.ts    # Error handling
│       ├── parse.ts     # Parsing utilities
│       └── html-parser.ts # HTML to markdown conversion
├── extension/
│   ├── manifest.json    # Chrome extension manifest
│   └── background.js    # Extension service worker
├── skill/
│   └── browse/
│       └── SKILL.md     # Claude Code skill definition
└── tests/               # Test files
```

## Code Style

- TypeScript with strict mode enabled
- 2-space indentation
- Single quotes for strings
- No semicolons (enforced by linter)

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and type checking:
   ```bash
   bun test
   bun run typecheck
   ```
5. Commit your changes with a descriptive message
6. Push to your fork
7. Open a Pull Request

## Reporting Issues

When reporting issues, please include:

- Your operating system
- Node.js and Bun versions
- Chrome version
- Steps to reproduce the issue
- Expected vs actual behavior

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
