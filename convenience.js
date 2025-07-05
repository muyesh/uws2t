const {GLib, Gio} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

/**
 * Initialize Gettext to load translations
 * @param {string} domain - Translation domain
 */
function initTranslations(domain) {
    const extension = ExtensionUtils.getCurrentExtension();
    
    domain = domain || extension.metadata['gettext-domain'];
    
    // If no domain is set, use the extension UUID
    if (!domain) {
        domain = extension.uuid;
    }
    
    const localeDir = extension.dir.get_child('locale');
    
    if (localeDir.query_exists(null)) {
        imports.gettext.bindtextdomain(domain, localeDir.get_path());
    } else {
        imports.gettext.bindtextdomain(domain, '/usr/share/locale');
    }
    
    imports.gettext.textdomain(domain);
    
    return imports.gettext.gettext;
}

/**
 * Get the translation function
 * @param {string} domain - Translation domain
 * @returns {function} Translation function
 */
function gettext(domain) {
    return initTranslations(domain);
}

/**
 * Convenience function for translations
 * @param {string} str - String to translate
 * @returns {string} Translated string
 */
function _(str) {
    return imports.gettext.gettext(str);
}

/**
 * Get settings for the extension
 * @param {string} schema - Schema ID
 * @returns {Gio.Settings} Settings object
 */
function getSettings(schema) {
    const extension = ExtensionUtils.getCurrentExtension();
    
    schema = schema || extension.metadata['settings-schema'];
    
    const GioSSS = Gio.SettingsSchemaSource;
    
    let schemaDir = extension.dir.get_child('schemas');
    let schemaSource;
    
    if (schemaDir.query_exists(null)) {
        schemaSource = GioSSS.new_from_directory(
            schemaDir.get_path(),
            GioSSS.get_default(),
            false
        );
    } else {
        schemaSource = GioSSS.get_default();
    }
    
    let schemaObj = schemaSource.lookup(schema, true);
    
    if (!schemaObj) {
        throw new Error(`Schema ${schema} could not be found for extension ${extension.metadata.uuid}`);
    }
    
    return new Gio.Settings({settings_schema: schemaObj});
}
