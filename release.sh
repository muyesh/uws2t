#!/bin/bash

# UltraWideSnapperTwoThirds Extension Release Script
# This script automates the release process for the extension

set -e  # Exit on error

# Functions for colored messages
print_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Configuration
EXTENSION_UUID="uws2t@muyesh.github.io"
CURRENT_VERSION=$(grep '"version"' metadata.json | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

print_info "UltraWideSnapperTwoThirds Extension Release Tool"
print_info "Current version: $CURRENT_VERSION"
echo

# Argument processing
RELEASE_TYPE=""
NEW_VERSION=""
SKIP_TESTS=false
SKIP_PACKAGE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --major)
            RELEASE_TYPE="major"
            shift
            ;;
        --minor)
            RELEASE_TYPE="minor"
            shift
            ;;
        --patch)
            RELEASE_TYPE="patch"
            shift
            ;;
        --version)
            NEW_VERSION="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-package)
            SKIP_PACKAGE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo
            echo "Options:"
            echo "  --major         Major version bump (x.0.0)"
            echo "  --minor         Minor version bump (x.y.0)"
            echo "  --patch         Patch version bump (x.y.z)"
            echo "  --version VER   Specify exact version"
            echo "  --skip-tests    Skip validation tests"
            echo "  --skip-package  Skip package creation"
            echo "  --help, -h      Show this help"
            echo
            echo "Examples:"
            echo "  $0 --patch                # Patch version bump"
            echo "  $0 --version 1.2.0        # Update to version 1.2.0"
            echo "  $0 --minor --skip-tests   # Minor bump, skip tests"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Version calculation function
calculate_version() {
    local current="$1"
    local type="$2"
    
    # Parse version components
    local major=$(echo "$current" | cut -d. -f1)
    local minor=$(echo "$current" | cut -d. -f2)
    local patch=$(echo "$current" | cut -d. -f3)
    
    case "$type" in
        "major")
            echo "$((major + 1)).0.0"
            ;;
        "minor")
            echo "$major.$((minor + 1)).0"
            ;;
        "patch")
            echo "$major.$minor.$((patch + 1))"
            ;;
        *)
            echo "$current"
            ;;
    esac
}

# Determine version
if [[ -n "$NEW_VERSION" ]]; then
    print_info "Specified version: $NEW_VERSION"
elif [[ -n "$RELEASE_TYPE" ]]; then
    NEW_VERSION=$(calculate_version "$CURRENT_VERSION" "$RELEASE_TYPE")
    print_info "$RELEASE_TYPE version bump: $CURRENT_VERSION -> $NEW_VERSION"
else
    print_warning "No version bump type specified"
    echo "Current version: $CURRENT_VERSION"
    echo
    echo "Please choose:"
    echo "1) Patch (bug fixes): $(calculate_version "$CURRENT_VERSION" "patch")"
    echo "2) Minor (new features): $(calculate_version "$CURRENT_VERSION" "minor")"
    echo "3) Major (breaking changes): $(calculate_version "$CURRENT_VERSION" "major")"
    echo "4) Custom"
    echo "5) Keep current version"
    echo
    read -p "Choice (1-5): " choice
    
    case $choice in
        1)
            NEW_VERSION=$(calculate_version "$CURRENT_VERSION" "patch")
            ;;
        2)
            NEW_VERSION=$(calculate_version "$CURRENT_VERSION" "minor")
            ;;
        3)
            NEW_VERSION=$(calculate_version "$CURRENT_VERSION" "major")
            ;;
        4)
            read -p "Enter new version: " NEW_VERSION
            ;;
        5)
            NEW_VERSION="$CURRENT_VERSION"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
fi

print_info "Release version: $NEW_VERSION"
echo

# Confirmation
if [[ "$NEW_VERSION" != "$CURRENT_VERSION" ]]; then
    read -p "Update version from $CURRENT_VERSION to $NEW_VERSION? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        print_info "Release cancelled"
        exit 0
    fi
fi

# Pre-flight checks
print_info "Running pre-flight checks..."

# Git status check
if command -v git >/dev/null 2>&1 && [[ -d .git ]]; then
    if [[ -n $(git status --porcelain) ]]; then
        print_warning "Uncommitted changes detected"
        git status --short
        echo
        read -p "Continue anyway? (y/N): " continue_with_changes
        if [[ ! "$continue_with_changes" =~ ^[Yy]$ ]]; then
            print_info "Release cancelled"
            exit 0
        fi
    fi
fi

# Check required tools
print_info "Checking required tools..."
missing_tools=()

if ! command -v msgfmt >/dev/null 2>&1; then
    missing_tools+=("msgfmt (gettext)")
fi

if ! command -v glib-compile-schemas >/dev/null 2>&1; then
    missing_tools+=("glib-compile-schemas")
fi

if ! command -v zip >/dev/null 2>&1; then
    missing_tools+=("zip")
fi

if [[ ${#missing_tools[@]} -gt 0 ]]; then
    print_error "Missing required tools:"
    for tool in "${missing_tools[@]}"; do
        echo "  - $tool"
    done
    echo
    print_info "Install on Ubuntu/Debian:"
    echo "  sudo apt install gettext glib2.0-dev-bin zip"
    exit 1
fi

# Update version
if [[ "$NEW_VERSION" != "$CURRENT_VERSION" ]]; then
    print_info "Updating version in metadata.json..."
    sed -i "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" metadata.json
    print_success "Version updated to $NEW_VERSION"
fi

# Run tests
if [[ "$SKIP_TESTS" == false ]]; then
    print_info "Running validation tests..."
    
    # JSON syntax check
    if command -v python3 >/dev/null 2>&1; then
        if ! python3 -m json.tool metadata.json >/dev/null 2>&1; then
            print_error "metadata.json syntax error"
            exit 1
        fi
        print_success "metadata.json syntax check passed"
    fi
    
    # Check required files
    required_files=("extension.js" "prefs.js" "metadata.json" "convenience.js")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            print_error "Required file not found: $file"
            exit 1
        fi
    done
    print_success "Required files check passed"
fi

# Build and package
if [[ "$SKIP_PACKAGE" == false ]]; then
    print_info "Building extension..."
    if ! make clean-all >/dev/null 2>&1; then
        print_warning "Cleanup had errors but continuing"
    fi
    
    if ! make build; then
        print_error "Build failed"
        exit 1
    fi
    print_success "Build completed"
    
    print_info "Creating distribution package..."
    if ! make package; then
        print_error "Package creation failed"
        exit 1
    fi
    print_success "Package created"
    
    print_info "Validating package..."
    if ! make validate; then
        print_error "Package validation failed"
        exit 1
    fi
    print_success "Package validation passed"
fi

# Show results
echo
print_success "Release preparation completed!"
echo
print_info "Release Information:"
echo "  Version: $NEW_VERSION"
echo "  UUID: $EXTENSION_UUID"

if [[ "$SKIP_PACKAGE" == false ]]; then
    PACKAGE_FILE="dist/${EXTENSION_UUID}-v${NEW_VERSION}.zip"
    if [[ -f "$PACKAGE_FILE" ]]; then
        PACKAGE_SIZE=$(du -h "$PACKAGE_FILE" | cut -f1)
        echo "  Package: $PACKAGE_FILE ($PACKAGE_SIZE)"
    fi
fi

echo
print_info "Next steps:"
echo "1. Test the package in a test environment"
echo "2. Commit and push to GitHub (if applicable)"
echo "3. Upload to GNOME Extensions website"
echo
print_info "Local installation command:"
echo "  make install"
echo
print_info "Uninstall command:"
echo "  make uninstall"
