#!/bin/bash

# UltraWideSnapperTwoThirds Extension Package Validation Script
# This script validates the extension package for common issues

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
TEMP_DIR=$(mktemp -d)
VALIDATION_ERRORS=0
VALIDATION_WARNINGS=0

cleanup() {
    rm -rf "$TEMP_DIR"
}

trap cleanup EXIT

print_info "UltraWideSnapperTwoThirds Extension Package Validator"
echo

# Check if package exists
PACKAGE_FILE=""
if [[ $# -eq 1 ]]; then
    PACKAGE_FILE="$1"
elif [[ -d "dist" ]]; then
    # Find the latest package
    PACKAGE_FILE=$(find dist -name "${EXTENSION_UUID}-v*.zip" | sort -V | tail -1)
fi

if [[ -z "$PACKAGE_FILE" || ! -f "$PACKAGE_FILE" ]]; then
    print_error "Package file not found"
    echo "Usage: $0 [package.zip]"
    echo "Or run 'make package' first to create a package"
    exit 1
fi

print_info "Validating package: $PACKAGE_FILE"
echo

# Extract package
print_info "Extracting package..."
if ! unzip -q "$PACKAGE_FILE" -d "$TEMP_DIR"; then
    print_error "Failed to extract package"
    exit 1
fi

EXTRACT_DIR="$TEMP_DIR/$EXTENSION_UUID"
if [[ ! -d "$EXTRACT_DIR" ]]; then
    print_error "Package structure invalid - missing extension directory"
    exit 1
fi

cd "$EXTRACT_DIR"

# Validation functions
validate_required_files() {
    print_info "Checking required files..."
    
    local required_files=(
        "metadata.json"
        "extension.js"
        "prefs.js"
        "convenience.js"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            print_error "Required file missing: $file"
            ((VALIDATION_ERRORS++))
        else
            print_success "Found: $file"
        fi
    done
}

validate_metadata() {
    print_info "Validating metadata.json..."
    
    if [[ ! -f "metadata.json" ]]; then
        return
    fi
    
    # JSON syntax check
    if command -v python3 >/dev/null 2>&1; then
        if ! python3 -m json.tool metadata.json >/dev/null 2>&1; then
            print_error "metadata.json has invalid JSON syntax"
            ((VALIDATION_ERRORS++))
            return
        fi
    fi
    
    # Check required fields
    local required_fields=("uuid" "name" "description" "shell-version")
    for field in "${required_fields[@]}"; do
        if ! grep -q "\"$field\"" metadata.json; then
            print_error "metadata.json missing required field: $field"
            ((VALIDATION_ERRORS++))
        fi
    done
    
    # Check UUID matches
    local uuid=$(grep '"uuid"' metadata.json | sed 's/.*"uuid"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    if [[ "$uuid" != "$EXTENSION_UUID" ]]; then
        print_error "UUID mismatch: expected $EXTENSION_UUID, got $uuid"
        ((VALIDATION_ERRORS++))
    fi
    
    # Check version format
    local version=$(grep '"version"' metadata.json | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    if [[ -n "$version" ]]; then
        if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            print_warning "Version format should be semantic (x.y.z): $version"
            ((VALIDATION_WARNINGS++))
        fi
    fi
    
    print_success "metadata.json validation passed"
}

validate_schemas() {
    print_info "Validating GSettings schemas..."
    
    if [[ ! -d "schemas" ]]; then
        print_warning "No schemas directory found"
        ((VALIDATION_WARNINGS++))
        return
    fi
    
    # Check for schema XML file
    local schema_file="schemas/org.gnome.shell.extensions.uws2t.gschema.xml"
    if [[ ! -f "$schema_file" ]]; then
        print_error "Schema XML file not found: $schema_file"
        ((VALIDATION_ERRORS++))
    else
        print_success "Found schema XML file"
        
        # Validate XML syntax
        if command -v xmllint >/dev/null 2>&1; then
            if ! xmllint --noout "$schema_file" 2>/dev/null; then
                print_error "Schema XML file has invalid syntax"
                ((VALIDATION_ERRORS++))
            else
                print_success "Schema XML syntax is valid"
            fi
        fi
    fi
    
    # Check for compiled schemas
    if [[ ! -f "schemas/gschemas.compiled" ]]; then
        print_error "Compiled schemas not found: schemas/gschemas.compiled"
        ((VALIDATION_ERRORS++))
    else
        print_success "Found compiled schemas"
    fi
}

validate_translations() {
    print_info "Validating translations..."
    
    if [[ ! -d "locale" ]]; then
        print_warning "No locale directory found"
        ((VALIDATION_WARNINGS++))
        return
    fi
    
    local locale_count=0
    for locale_dir in locale/*/; do
        if [[ -d "$locale_dir" ]]; then
            local lang=$(basename "$locale_dir")
            local mo_file="$locale_dir/LC_MESSAGES/uws2t.mo"
            
            if [[ -f "$mo_file" ]]; then
                print_success "Found translation: $lang"
                ((locale_count++))
                
                # Check if .mo file is valid
                if command -v msgfmt >/dev/null 2>&1; then
                    if ! msgfmt --check-format "$mo_file" 2>/dev/null; then
                        print_warning "Translation file may have issues: $mo_file"
                        ((VALIDATION_WARNINGS++))
                    fi
                fi
            else
                print_warning "Missing .mo file for locale: $lang"
                ((VALIDATION_WARNINGS++))
            fi
        fi
    done
    
    if [[ $locale_count -eq 0 ]]; then
        print_warning "No translation files found"
        ((VALIDATION_WARNINGS++))
    else
        print_success "Found $locale_count translation(s)"
    fi
}

validate_javascript() {
    print_info "Validating JavaScript files..."
    
    local js_files=("extension.js" "prefs.js" "convenience.js")
    
    for js_file in "${js_files[@]}"; do
        if [[ -f "$js_file" ]]; then
            # Basic syntax check using node if available
            if command -v node >/dev/null 2>&1; then
                if ! node -c "$js_file" 2>/dev/null; then
                    print_error "JavaScript syntax error in: $js_file"
                    ((VALIDATION_ERRORS++))
                else
                    print_success "JavaScript syntax OK: $js_file"
                fi
            fi
            
            # Check for common patterns
            if grep -q "console.log" "$js_file"; then
                print_warning "Debug console.log found in: $js_file"
                ((VALIDATION_WARNINGS++))
            fi
            
            # Check for proper imports/exports
            if [[ "$js_file" == "extension.js" ]]; then
                if ! grep -q "class.*Extension" "$js_file" && ! grep -q "function.*init" "$js_file"; then
                    print_warning "extension.js should define Extension class or init function"
                    ((VALIDATION_WARNINGS++))
                fi
            fi
        fi
    done
}

validate_package_structure() {
    print_info "Validating package structure..."
    
    # Check for unnecessary files
    local unwanted_patterns=("*.swp" "*.tmp" "*~" ".DS_Store" "Thumbs.db" "*.orig")
    for pattern in "${unwanted_patterns[@]}"; do
        if find . -name "$pattern" | grep -q .; then
            print_warning "Found unwanted files matching: $pattern"
            find . -name "$pattern"
            ((VALIDATION_WARNINGS++))
        fi
    done
    
    # Check file permissions
    if find . -type f -executable | grep -v -E '\.(sh|py)$' | grep -q .; then
        print_warning "Found executable files that shouldn't be executable:"
        find . -type f -executable | grep -v -E '\.(sh|py)$'
        ((VALIDATION_WARNINGS++))
    fi
    
    print_success "Package structure validation completed"
}

# Run all validations
validate_required_files
validate_metadata
validate_schemas
validate_translations
validate_javascript
validate_package_structure

# Summary
echo
print_info "Validation Summary:"
echo "  Package: $(basename "$PACKAGE_FILE")"
echo "  Size: $(du -h "$PACKAGE_FILE" | cut -f1)"
echo "  Errors: $VALIDATION_ERRORS"
echo "  Warnings: $VALIDATION_WARNINGS"

if [[ $VALIDATION_ERRORS -eq 0 ]]; then
    if [[ $VALIDATION_WARNINGS -eq 0 ]]; then
        print_success "Package validation passed with no issues!"
    else
        print_warning "Package validation passed with $VALIDATION_WARNINGS warning(s)"
    fi
    echo
    print_info "Package is ready for distribution"
    exit 0
else
    print_error "Package validation failed with $VALIDATION_ERRORS error(s)"
    echo
    print_info "Please fix the errors before distributing the package"
    exit 1
fi
