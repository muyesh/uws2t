# Window 3Split Extension Release Guide

This guide explains how to build, package, and release the Window 3Split GNOME Shell extension.

## Prerequisites

### Required Tools

Make sure you have the following tools installed:

```bash
# Ubuntu/Debian
sudo apt install gettext glib2.0-dev-bin zip

# Fedora/RHEL
sudo dnf install gettext glib2-devel zip

# Arch Linux
sudo pacman -S gettext glib2 zip
```

### Optional Tools

For enhanced validation:
- `python3` - JSON syntax validation
- `node` - JavaScript syntax validation
- `xmllint` - XML schema validation

## Quick Start

### 1. Build and Package

```bash
# Full build with packaging
make package

# Or step by step
make build      # Compile translations and schemas
make validate   # Validate the package
```

### 2. Automated Release

```bash
# Interactive release (recommended for first time)
./release.sh

# Patch version bump
./release.sh --patch

# Minor version bump
./release.sh --minor

# Major version bump
./release.sh --major

# Specific version
./release.sh --version 1.2.3
```

## Build System

### Makefile Targets

| Target | Description |
|--------|-------------|
| `all` | Full build (default) |
| `build` | Compile translations and schemas |
| `compile-translations` | Build .mo files from .po files |
| `compile-schemas` | Compile GSettings schemas |
| `package` | Create distribution zip package |
| `install` | Install extension locally |
| `uninstall` | Uninstall extension |
| `validate` | Validate package contents |
| `reload` | Reload extension (disable/enable) |
| `clean` | Remove generated .mo files |
| `clean-all` | Remove all generated files |
| `stats` | Show translation statistics |
| `info` | Show package information |

### Translation Management

```bash
# Extract translatable strings
make extract-strings

# Update translation files
make update-po

# Compile translations
make compile-translations

# Show translation statistics
make stats
```

## Release Process

### 1. Preparation

1. **Update translations** if needed:
   ```bash
   make extract-strings
   make update-po
   # Edit .po files as needed
   ```

2. **Test the extension** locally:
   ```bash
   make install
   gnome-extensions enable window-3split@fumitaka.github.io
   # Test functionality
   ```

3. **Check for uncommitted changes**:
   ```bash
   git status
   git add .
   git commit -m "Prepare for release"
   ```

### 2. Version Management

The extension uses semantic versioning (MAJOR.MINOR.PATCH):

- **PATCH** (x.y.Z): Bug fixes, translations
- **MINOR** (x.Y.0): New features, backwards compatible
- **MAJOR** (X.0.0): Breaking changes

Version is stored in `metadata.json`:
```json
{
  "version": "1.2.3"
}
```

### 3. Automated Release

Use the release script for automated building:

```bash
# Interactive mode
./release.sh

# Automated patch release
./release.sh --patch

# Skip tests (not recommended)
./release.sh --patch --skip-tests

# Skip packaging (for testing)
./release.sh --patch --skip-package
```

### 4. Manual Release

If you prefer manual control:

```bash
# 1. Update version in metadata.json
vim metadata.json

# 2. Build and package
make clean-all
make package

# 3. Validate package
make validate
# or
./validate.sh

# 4. Test package
unzip -l dist/window-3split@fumitaka.github.io-v*.zip
```

## Package Validation

### Automatic Validation

```bash
# Validate latest package
./validate.sh

# Validate specific package
./validate.sh dist/window-3split@fumitaka.github.io-v1.2.3.zip
```

### Manual Validation Checklist

- [ ] All required files present
- [ ] metadata.json has valid JSON syntax
- [ ] UUID matches expected value
- [ ] Version follows semantic versioning
- [ ] GSettings schemas compiled
- [ ] Translation files (.mo) present
- [ ] No debug code (console.log, etc.)
- [ ] No temporary/backup files
- [ ] Proper file permissions

## Distribution

### 1. Local Installation

```bash
# Install for testing
make install

# Enable extension
gnome-extensions enable window-3split@fumitaka.github.io

# Check status
gnome-extensions list --enabled | grep window-3split
```

### 2. GNOME Extensions Website

1. Go to [extensions.gnome.org](https://extensions.gnome.org)
2. Sign in with your account
3. Upload the zip package from `dist/` directory
4. Fill in the extension details
5. Submit for review

### 3. GitHub Releases

```bash
# Tag the release
git tag v1.2.3
git push origin v1.2.3

# Create GitHub release
# Upload the zip file as an asset
```

### 4. Manual Distribution

The zip package in `dist/` can be distributed directly:
- Email attachment
- File sharing services
- Direct download from website

## Troubleshooting

### Build Issues

**Problem**: `msgfmt: command not found`
```bash
# Solution: Install gettext
sudo apt install gettext
```

**Problem**: `glib-compile-schemas: command not found`
```bash
# Solution: Install glib development tools
sudo apt install glib2.0-dev-bin
```

**Problem**: Translation files not found
```bash
# Solution: Compile translations first
make compile-translations
```

### Package Issues

**Problem**: Package validation fails
```bash
# Check what's wrong
./validate.sh

# Common fixes:
make clean-all
make build
```

**Problem**: Extension not loading
```bash
# Check GNOME Shell logs
journalctl -f -o cat /usr/bin/gnome-shell

# Restart GNOME Shell (X11 only)
Alt+F2, type 'r', press Enter
```

### Installation Issues

**Problem**: Extension not appearing in list
```bash
# Check installation directory
ls ~/.local/share/gnome-shell/extensions/

# Reinstall
make uninstall
make install
```

**Problem**: Settings not working
```bash
# Check if schemas are installed
ls ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io/schemas/

# Recompile schemas
make compile-schemas
make install
```

## Development Workflow

### Daily Development

```bash
# Make changes to code
vim extension.js

# Test changes
make reload

# Check logs if needed
journalctl -f -o cat /usr/bin/gnome-shell
```

### Before Committing

```bash
# Update translations if strings changed
make extract-strings
make update-po

# Test build
make clean-all
make build

# Validate
./validate.sh
```

### Release Preparation

```bash
# Full release process
./release.sh --patch

# Or manual process
make clean-all
make package
./validate.sh
```

## File Structure

```
window-3split@fumitaka.github.io/
├── extension.js              # Main extension code
├── prefs.js                  # Preferences dialog
├── metadata.json             # Extension metadata
├── convenience.js            # Utility functions
├── schemas/                  # GSettings schemas
│   ├── *.gschema.xml        # Schema definition
│   └── gschemas.compiled    # Compiled schemas
├── locale/                   # Compiled translations
│   └── */LC_MESSAGES/*.mo   # Binary translation files
├── po/                       # Translation sources
│   ├── *.po                 # Translation files
│   └── *.pot                # Translation template
├── Makefile                  # Build system
├── release.sh               # Release automation
├── validate.sh              # Package validation
└── RELEASE_GUIDE.md         # This file
```

## Best Practices

1. **Always test locally** before releasing
2. **Use semantic versioning** consistently
3. **Update translations** when adding new strings
4. **Validate packages** before distribution
5. **Keep release notes** for major changes
6. **Test on clean systems** when possible
7. **Follow GNOME extension guidelines**

## Support

- Check logs: `journalctl -f -o cat /usr/bin/gnome-shell`
- Test in safe mode: Disable other extensions
- Validate package: `./validate.sh`
- Clean rebuild: `make clean-all && make package`
