# Makefile for UltraWideSnapperTwoThirds Extension Build and Release Management

DOMAIN = uws2t
LANGUAGES = en ja zh_CN zh_TW zh_HK vi ko
POTFILE = po/$(DOMAIN).pot
POFILES = $(foreach lang,$(LANGUAGES),po/$(lang).po)
MOFILES = $(foreach lang,$(LANGUAGES),locale/$(lang)/LC_MESSAGES/$(DOMAIN).mo)

# Extension info
EXTENSION_UUID = uws2t@muyesh.github.io
VERSION = $(shell grep '"version"' metadata.json | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' || echo "0.1.0")

# Build directories
BUILD_DIR = build
PACKAGE_DIR = $(BUILD_DIR)/$(EXTENSION_UUID)
DIST_DIR = dist

# Files to include in package
EXTENSION_FILES = extension.js prefs.js metadata.json convenience.js
SCHEMA_FILES = schemas/org.gnome.shell.extensions.uws2t.gschema.xml schemas/gschemas.compiled
LOCALE_FILES = $(shell find locale -name "*.mo" 2>/dev/null)

# Default target - full build
all: build

# Generate .mo files from .po files
locale/%/LC_MESSAGES/$(DOMAIN).mo: po/%.po
	@mkdir -p $(dir $@)
	msgfmt -o $@ $<
	@echo "Generated $@"

# Update .po files from .pot template
update-po: $(POTFILE)
	@for lang in $(LANGUAGES); do \
		if [ -f po/$$lang.po ]; then \
			echo "Updating po/$$lang.po"; \
			msgmerge --update po/$$lang.po $(POTFILE); \
		else \
			echo "Creating po/$$lang.po"; \
			msginit --locale=$$lang --input=$(POTFILE) --output=po/$$lang.po --no-translator; \
		fi; \
	done

# Extract translatable strings to create .pot template
extract-strings:
	@echo "Extracting translatable strings..."
	xgettext --from-code=UTF-8 \
		--language=JavaScript \
		--keyword=_ \
		--output=$(POTFILE) \
		--package-name="$(DOMAIN)" \
		--package-version="1.0" \
		--copyright-holder="THE PACKAGE'S COPYRIGHT HOLDER" \
		prefs.js extension.js

# Clean generated files
clean:
	rm -rf locale/*/LC_MESSAGES/$(DOMAIN).mo
	@echo "Cleaned generated .mo files"

# Install translation files (for development)
install-translations: $(MOFILES)
	@echo "Translation files are ready in locale/ directory"

# Show translation statistics
stats:
	@echo "Translation statistics:"
	@for lang in $(LANGUAGES); do \
		if [ -f po/$$lang.po ]; then \
			echo -n "$$lang: "; \
			msgfmt --statistics po/$$lang.po 2>&1 | grep -o '[0-9]* translated' || echo "0 translated"; \
		fi; \
	done

# Build extension (compile translations and schemas)
build: compile-translations compile-schemas
	@echo "Build completed successfully"

# Compile translations only
compile-translations: $(MOFILES)
	@echo "All translation files compiled"

# Compile GSettings schemas
compile-schemas:
	@echo "Compiling GSettings schemas..."
	@if [ -f schemas/org.gnome.shell.extensions.uws2t.gschema.xml ]; then \
		glib-compile-schemas schemas/; \
		echo "Schemas compiled successfully"; \
	else \
		echo "Warning: Schema file not found"; \
	fi

# Create distribution package
package: build
	@echo "Creating distribution package..."
	@rm -rf $(BUILD_DIR) $(DIST_DIR)
	@mkdir -p $(PACKAGE_DIR) $(DIST_DIR)
	
	# Copy extension files
	@cp $(EXTENSION_FILES) $(PACKAGE_DIR)/
	
	# Copy schema files
	@mkdir -p $(PACKAGE_DIR)/schemas
	@cp $(SCHEMA_FILES) $(PACKAGE_DIR)/schemas/
	
	# Copy locale files
	@if [ -n "$(LOCALE_FILES)" ]; then \
		cp -r locale $(PACKAGE_DIR)/; \
		echo "Copied locale files"; \
	else \
		echo "Warning: No locale files found"; \
	fi
	
	# Create zip package
	@cd $(BUILD_DIR) && zip -r ../$(DIST_DIR)/$(EXTENSION_UUID)-v$(VERSION).zip $(EXTENSION_UUID)
	@echo "Package created: $(DIST_DIR)/$(EXTENSION_UUID)-v$(VERSION).zip"

# Install extension locally
install: build
	@echo "Installing extension locally..."
	@INSTALL_DIR=~/.local/share/gnome-shell/extensions/$(EXTENSION_UUID); \
	mkdir -p "$$INSTALL_DIR"; \
	cp $(EXTENSION_FILES) "$$INSTALL_DIR/"; \
	mkdir -p "$$INSTALL_DIR/schemas"; \
	cp $(SCHEMA_FILES) "$$INSTALL_DIR/schemas/"; \
	if [ -n "$(LOCALE_FILES)" ]; then \
		cp -r locale "$$INSTALL_DIR/"; \
	fi; \
	echo "Extension installed to $$INSTALL_DIR"
	@echo "Run 'gnome-extensions enable $(EXTENSION_UUID)' to enable the extension"

# Uninstall extension
uninstall:
	@echo "Uninstalling extension..."
	@gnome-extensions disable $(EXTENSION_UUID) 2>/dev/null || true
	@rm -rf ~/.local/share/gnome-shell/extensions/$(EXTENSION_UUID)
	@echo "Extension uninstalled"

# Validate package
validate: package
	@echo "Validating package..."
	@cd $(BUILD_DIR)/$(EXTENSION_UUID) && \
	if [ ! -f metadata.json ]; then echo "ERROR: metadata.json missing"; exit 1; fi && \
	if [ ! -f extension.js ]; then echo "ERROR: extension.js missing"; exit 1; fi && \
	if [ ! -f schemas/gschemas.compiled ]; then echo "ERROR: compiled schemas missing"; exit 1; fi && \
	echo "Package validation passed"

# Clean all generated files
clean-all: clean
	@rm -rf $(BUILD_DIR) $(DIST_DIR)
	@rm -f schemas/gschemas.compiled
	@echo "All generated files cleaned"

# Development reload (disable and re-enable extension)
reload:
	@echo "Reloading extension..."
	@gnome-extensions disable $(EXTENSION_UUID) 2>/dev/null || true
	@sleep 1
	@gnome-extensions enable $(EXTENSION_UUID)
	@echo "Extension reloaded"

# Show package info
info:
	@echo "Extension Information:"
	@echo "  UUID: $(EXTENSION_UUID)"
	@echo "  Version: $(VERSION)"
	@echo "  Languages: $(LANGUAGES)"
	@echo "  Build directory: $(BUILD_DIR)"
	@echo "  Package directory: $(PACKAGE_DIR)"
	@echo "  Distribution directory: $(DIST_DIR)"

# Help target
help:
	@echo "Available targets:"
	@echo "  all                  - Full build (compile translations and schemas)"
	@echo "  build                - Build extension (compile translations and schemas)"
	@echo "  compile-translations - Build all .mo files from .po files"
	@echo "  compile-schemas      - Compile GSettings schemas"
	@echo "  package              - Create distribution zip package"
	@echo "  install              - Install extension locally"
	@echo "  uninstall            - Uninstall extension"
	@echo "  validate             - Validate package contents"
	@echo "  reload               - Reload extension (disable/enable)"
	@echo "  update-po            - Update .po files from .pot template"
	@echo "  extract-strings      - Extract translatable strings to .pot file"
	@echo "  clean                - Remove generated .mo files"
	@echo "  clean-all            - Remove all generated files"
	@echo "  stats                - Show translation statistics"
	@echo "  info                 - Show package information"
	@echo "  help                 - Show this help message"

.PHONY: all build compile-translations compile-schemas package install uninstall validate clean-all reload info update-po extract-strings clean install-translations stats help
