# Building MarkDeck TUI Binaries

This document explains how to build native binaries for the MarkDeck TUI (Terminal User Interface).

## Overview

The MarkDeck TUI can be packaged as self-contained native executables for Linux, macOS, and Windows using [pkg](https://github.com/yao-pkg/pkg). These binaries embed a Node.js runtime and require **no external dependencies** on the target machine.

## Supported Platforms

- **Linux**: x64
- **macOS**: x64 (Intel), ARM64 (Apple Silicon)
- **Windows**: x64

## Prerequisites

- Node.js 20.x or later
- npm (comes with Node.js)

## Building Locally

### Build All Binaries

To build binaries for all supported platforms:

```bash
npm run build:tui:all
```

This command:
1. Compiles the TypeScript source (`npm run build:tui`)
2. Bundles the code with esbuild (`packages/tui/bundle.mjs`)
3. Creates platform-specific binaries with pkg

### Build Step by Step

If you want to run each step individually:

```bash
# 1. Build the TUI TypeScript code
npm run build:tui

# 2. Bundle for pkg
cd packages/tui
npm run bundle

# 3. Build binaries
npm run build:bin
```

### Build for Specific Platform

To build for a specific platform only:

```bash
cd packages/tui

# Linux only
npx pkg dist/bundle/cli.cjs --compress Brotli -t node20-linux-x64 -o dist/bin/markdeck-linux-x64

# macOS Intel only
npx pkg dist/bundle/cli.cjs --compress Brotli -t node20-macos-x64 -o dist/bin/markdeck-macos-x64

# macOS ARM64 only
npx pkg dist/bundle/cli.cjs --compress Brotli -t node20-macos-arm64 -o dist/bin/markdeck-macos-arm64

# Windows only
npx pkg dist/bundle/cli.cjs --compress Brotli -t node20-win-x64 -o dist/bin/markdeck-win-x64.exe
```

## Output Location

Built binaries are placed in `packages/tui/dist/bin/`:

```
packages/tui/dist/bin/
├── markdeck-linux-x64
├── markdeck-macos-x64
├── markdeck-macos-arm64
└── markdeck-win-x64.exe
```

**Note**: These files are excluded from git via `.gitignore`.

## Binary Size

Expected binary sizes (with Brotli compression):
- Linux: ~50-60 MB
- macOS: ~50-60 MB
- Windows: ~50-60 MB

The binaries are compressed using Brotli to reduce size while maintaining fast startup times.

## Testing Binaries

### Linux/macOS

```bash
# Make executable
chmod +x packages/tui/dist/bin/markdeck-linux-x64

# Test version
./packages/tui/dist/bin/markdeck-linux-x64 --version

# Test with STATUS.md
./packages/tui/dist/bin/markdeck-linux-x64 STATUS.md
```

### Windows

```powershell
# Test version
.\packages\tui\dist\bin\markdeck-win-x64.exe --version

# Test with STATUS.md
.\packages\tui\dist\bin\markdeck-win-x64.exe STATUS.md
```

## CI/CD: Automated Builds

Binaries are automatically built and published via GitHub Actions:

### On Tagged Releases (`v*`)

When you push a tag starting with `v` (e.g., `v0.2.0`):

```bash
git tag v0.2.0
git push origin v0.2.0
```

The workflow will:
1. Build binaries for all platforms
2. Generate SHA256 checksums
3. Create a GitHub Release
4. Attach all binaries and checksums to the release

### Nightly Builds

Nightly builds run automatically at 3 AM UTC via cron schedule:
- Binaries are built but **not** published as a release
- Available as workflow artifacts for testing
- Useful for catching integration issues early

### Manual Trigger

You can manually trigger a build via GitHub Actions:
1. Go to Actions tab
2. Select "Build and Release Binaries" workflow
3. Click "Run workflow"
4. Binaries will be available as artifacts (no release created)

## Build Process Details

### 1. TypeScript Compilation

The TUI source code is written in TypeScript and compiled to JavaScript using the TypeScript compiler:

```bash
# In packages/tui/
tsc --project tsconfig.json
```

### 2. Bundling with esbuild

The compiled JavaScript is bundled into a single CommonJS file using esbuild:

- **Format**: CommonJS (required by pkg)
- **Target**: Node.js 20
- **Bundling**: All dependencies are bundled (no external modules)
- **Version injection**: The package version is injected at build time via esbuild's `define` option

This step produces `packages/tui/dist/bundle/cli.cjs`.

### 3. Binary Creation with pkg

The bundled file is packaged into native executables:

- **Tool**: [@yao-pkg/pkg](https://github.com/yao-pkg/pkg) (maintained fork of vercel/pkg)
- **Node version**: 20
- **Compression**: Brotli (balances size and startup time)
- **Assets**: The ESM bundle is included as an asset for dynamic loading

## Troubleshooting

### "Module not found" errors

If you see module errors when running the binary:
- Ensure all dependencies are bundled (check `bundle.mjs`)
- Verify no external modules are referenced
- Check that assets are properly included in the pkg config

### "Permission denied" on Linux/macOS

Make the binary executable:

```bash
chmod +x markdeck-*
```

### Binary doesn't start

Check:
1. The binary is for your platform (e.g., ARM64 vs x64)
2. You have execute permissions
3. Your OS allows running unsigned binaries (macOS Gatekeeper, Windows SmartScreen)

On macOS, you may need to:

```bash
xattr -d com.apple.quarantine markdeck-macos-*
```

### Version shows as "undefined"

The version is injected during bundling. If it shows as undefined:
- Rebuild from scratch: `npm run build:tui:all`
- Check that `bundle.mjs` successfully reads `package.json`

## Development

### Updating the Build Process

Key files:
- `packages/tui/bundle.mjs` - Bundling script
- `packages/tui/package.json` - pkg configuration and scripts
- `.github/workflows/release-binaries.yml` - CI/CD workflow

### Adding New Platforms

To add support for additional platforms:

1. Check [pkg targets](https://github.com/yao-pkg/pkg#targets) for available options
2. Update `packages/tui/package.json` pkg.targets
3. Update the GitHub Actions workflow matrix
4. Test on the target platform

## Resources

- [pkg documentation](https://github.com/yao-pkg/pkg)
- [esbuild documentation](https://esbuild.github.io/)
- [Node.js Binary Compilation](https://nodejs.org/api/single-executable-applications.html)
