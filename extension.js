const {GObject, Meta, Gio, Shell, GLib} = imports.gi;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const MessageTray = imports.ui.messageTray;

const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

let _;

class UltraWideSnapperTwoThirdsExtension {
    constructor() {
        this._settings = null;
        this._keybindings = [];
        _ = Convenience.initTranslations();
    }

    /**
     * Method to check debug settings
     * @returns {boolean} True if debug mode is enabled, false otherwise
     */
    _isDebugEnabled() {
        return this._settings && this._settings.get_boolean('debug');
    }

    /**
     * Standard logging functionality for GNOME Shell extensions
     * Logs messages with timestamp and level information when debug mode is enabled
     * @param {string} message - The message to log
     * @param {string} level - The log level (INFO, DEBUG, ERROR)
     */
    _log(message, level = 'INFO') {
        if (!this._isDebugEnabled()) {
            return;
        }
        const timestamp = new Date().toISOString();
        log(`[UltraWideSnapperTwoThirds][${level}] ${timestamp}: ${message}`);
    }

    /**
     * Log debug messages
     * @param {string} message - Debug message to log
     */
    _logDebug(message) {
        if (!this._isDebugEnabled()) {
            return;
        }
        this._log(message, 'DEBUG');
    }

    /**
     * Log error messages
     * @param {string} message - Error message to log
     */
    _logError(message) {
        if (!this._isDebugEnabled()) {
            return;
        }
        this._log(message, 'ERROR');
    }

    /**
     * Enable the extension
     * This method is called when the extension is activated
     * It initializes settings and sets up keybindings
     */
    enable() {
        this._log('Enabling UltraWideSnapperTwoThirds Extension');
        
        try {
            // Get extension metadata for proper initialization
            this._extension = ExtensionUtils.getCurrentExtension();
            
            // Initialize settings using local schema
            // This ensures the extension uses its own GSettings schema
            this._settings = ExtensionUtils.getSettings(
                'org.gnome.shell.extensions.uws2t',
                this._extension
            );
            this._log('Settings initialization completed');
            
            // Add keybindings for window management functions
            this._addKeybindings();
            this._log('Keybinding setup completed');
        } catch (error) {
            this._logError('Error occurred while enabling extension: ' + error);
        }
    }

    /**
     * Disable the extension
     * This method is called when the extension is deactivated
     * It cleans up keybindings and settings
     */
    disable() {
        this._logDebug('Disabling UltraWideSnapperTwoThirds Extension');
        
        // Remove all registered keybindings to prevent conflicts
        this._removeKeybindings();
        
        // Clear settings reference to prevent memory leaks
        this._settings = null;
    }

    /**
     * Add all keybindings for window management functions
     * Each keybinding is registered with GNOME Shell's window manager
     */
    _addKeybindings() {
        // Function 1: Left-aligned 2/3 width window
        // Places the active window on the left side occupying 2/3 of screen width
        this._addKeybinding('left-two-thirds', '<Ctrl><Super>Left', () => {
            this._logDebug('Left 2/3 function called');
            this._displayWindowInfo(2/3, 'left');
            this._resizeWindow(2/3, 'left');
        });

        // Function 2: Right-aligned 2/3 width window
        // Places the active window on the right side occupying 2/3 of screen width
        this._addKeybinding('right-two-thirds', '<Ctrl><Shift><Super>Right', () => {
            this._logDebug('Right 2/3 function called');
            this._displayWindowInfo(2/3, 'right');
            this._resizeWindow(2/3, 'right');
        });

        // Function 3: Right-aligned 1/3 width window
        // Places the active window on the right side occupying 1/3 of screen width
        this._addKeybinding('right-one-third', '<Ctrl><Super>Right', () => {
            this._logDebug('Right 1/3 function called');
            this._displayWindowInfo(1/3, 'right');
            this._resizeWindow(1/3, 'right');
        });

        // Function 4: Left-aligned 1/3 width window
        // Places the active window on the left side occupying 1/3 of screen width
        this._addKeybinding('left-one-third', '<Ctrl><Shift><Super>Left', () => {
            this._logDebug('Left 1/3 function called');
            this._displayWindowInfo(1/3, 'left');
            this._resizeWindow(1/3, 'left');
        });
    }

    /**
     * Add a single keybinding to GNOME Shell's window manager
     * @param {string} name - The keybinding name (must match GSettings schema)
     * @param {string} shortcut - Default shortcut (fallback if not set in preferences)
     * @param {Function} callback - Function to execute when keybinding is triggered
     */
    _addKeybinding(name, shortcut, callback) {
        try {
            // Register keybinding with GNOME Shell's window manager
            // The actual shortcut is read from GSettings, not the shortcut parameter
            Main.wm.addKeybinding(
                name,                           // Keybinding identifier
                this._settings,                 // GSettings object containing user preferences
                Meta.KeyBindingFlags.NONE,      // No special flags
                Shell.ActionMode.NORMAL,        // Active in normal shell mode
                callback                        // Function to call when triggered
            );
            this._keybindings.push(name);
            this._logDebug(`Added keybinding: ${name}`);
        } catch (error) {
            this._logError(`Failed to add keybinding ${name}: ${error}`);
        }
    }

    /**
     * Remove all registered keybindings
     * This is called during extension disable to clean up properly
     */
    _removeKeybindings() {
        this._keybindings.forEach(name => {
            try {
                // Unregister keybinding from GNOME Shell's window manager
                Main.wm.removeKeybinding(name);
            } catch (error) {
                this._logError(`Failed to remove keybinding ${name}: ${error}`);
            }
        });
        // Clear the keybindings array
        this._keybindings = [];
    }

    /**
     * Show notification to user (only in debug mode)
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     */
    _showNotification(title, message) {
        if (!this._isDebugEnabled()) {
            return;
        }
        // Use GNOME Shell's notification system
        Main.notify(title, message);
    }

    /**
     * Display window information for debugging purposes (resize functionality disabled)
     * This method analyzes the current window and logs detailed information
     * @param {number} widthRatio - Target width ratio (1/3 or 2/3)
     * @param {string} position - Target position ('left' or 'right')
     */
    _displayWindowInfo(widthRatio, position) {
        // Get the currently focused window
        const window = global.display.focus_window;
        if (!window) {
            this._logDebug('No focused window found');
            this._showNotification(_('Error'), _('No focused window found'));
            return;
        }

        // Log window resize capability and detailed information
        this._logDebug(`Window resize capability: ${window.allows_resize()}`);
        this._logDebug(`Window type: ${window.get_window_type()}`);
        this._logDebug(`Maximized state: ${window.get_maximized()}`);

        // Additional information for non-resizable windows
        if (!window.allows_resize()) {
            // Log detailed information about why the window cannot be resized
            this._logDebug(`Window class: ${window.get_wm_class()}`);
            this._logDebug(`Window title: ${window.get_title()}`);
            this._logDebug(`Fullscreen state: ${window.is_fullscreen()}`);
            this._logDebug(`Modal state: ${window.is_modal()}`);
            try {
                // Attempt to get size constraints that might prevent resizing
                const minSize = window.get_min_size();
                const maxSize = window.get_max_size();
                this._logDebug(`Min size constraint: ${minSize ? minSize.width + 'x' + minSize.height : 'none'}`);
                this._logDebug(`Max size constraint: ${maxSize ? maxSize.width + 'x' + maxSize.height : 'none'}`);
            } catch (error) {
                this._logDebug(`Failed to get size constraint info: ${error}`);
            }
            this._showNotification(_('Error'), _('This window cannot be resized'));
            return;
        }

        try {
            // Get monitor information for the window's current display
            const monitorIndex = window.get_monitor();
            const workArea = window.get_work_area_for_monitor(monitorIndex);
            const windowRect = window.get_frame_rect();
            
            // Calculate target dimensions based on work area
            const oneThirdWidth = Math.floor(workArea.width / 3);
            const twoThirdsWidth = Math.floor(workArea.width * 2 / 3);
            const targetWidth = widthRatio === 1/3 ? oneThirdWidth : twoThirdsWidth;
            
            // Calculate target position coordinates
            const leftX = workArea.x;  // Left edge of work area
            const rightX = workArea.x + workArea.width - targetWidth;  // Right-aligned position
            const targetX = position === 'left' ? leftX : rightX;
            const targetY = workArea.y;  // Top of work area
            
            // Output detailed information to log
            this._log(`=== Window Info (${position === 'left' ? 'Left' : 'Right'} ${widthRatio === 1/3 ? '1/3' : '2/3'}) ===`);
            this._log(`Current target window: ${windowRect.width}x${windowRect.height}`);
            this._log(`Current work area: ${workArea.width}x${workArea.height}`);
            this._log(`Calculated 1/3 width: ${oneThirdWidth}px`);
            this._log(`Calculated 2/3 width: ${twoThirdsWidth}px`);
            this._log(`Left position start: (${leftX}, ${targetY})`);
            this._log(`Right position start: (${rightX}, ${targetY})`);
            this._log(`Target placement position: (${targetX}, ${targetY})`);
            this._log(`Target size: ${targetWidth}x${workArea.height}`);
            
            // Display summary information via notification
            const positionText = position === 'left' ? _('Left') : _('Right');
            const ratioText = widthRatio === 1/3 ? '1/3' : '2/3';
            const infoMessage = `${positionText} ${ratioText}\n` +
                              `${_('Window')}: ${windowRect.width}x${windowRect.height}\n` +
                              `${_('Work Area')}: ${workArea.width}x${workArea.height}\n` +
                              `${_('Position')}: (${targetX}, ${targetY})`;
            
            this._showNotification(_('Window Information'), infoMessage);

        } catch (error) {
            this._logError('Failed to get window information: ' + error);
            this._showNotification(_('Error'), _('Failed to get window information'));
        }
    }

    /**
     * Resize and position the window according to specified parameters
     * This method handles the actual window manipulation
     * @param {number} widthRatio - Target width ratio (1/3 or 2/3)
     * @param {string} position - Target position ('left' or 'right')
     */
    _resizeWindow(widthRatio, position) {
        // Get the currently focused window
        const window = global.display.focus_window;
        if (!window) {
            this._logDebug('_resizeWindow: No focused window found');
            return;
        }

        // Step 1: Initial resize capability check
        // Some windows (like system dialogs) cannot be resized
        if (!window.allows_resize()) {
            this._logDebug("Step 1: Window is not resizable, terminating process");
            return;
        }
        this._logDebug("Step 1: Window resize capability check completed");

        // Step 2: Check and handle maximized state
        // Maximized windows need to be unmaximized before resizing
        const maximized = window.get_maximized();
        if (maximized !== Meta.MaximizeFlags.NONE) {
            this._logDebug(`Step 2: Maximized state detected (${maximized}), executing unmaximize`);
            window.unmaximize(Meta.MaximizeFlags.BOTH);
            
            // Re-check resize capability after unmaximizing
            // Some windows may become non-resizable after state changes
            if (!window.allows_resize()) {
                this._logDebug("Step 2: Still not resizable after unmaximize, terminating process");
                return;
            }
            this._logDebug("Step 2: Resize capability check after unmaximize completed");
        } else {
            this._logDebug("Step 2: Window is not maximized");
        }

        // Step 3: Calculate and apply window positioning and resizing
        try {
            // Calculate position and size based on work area
            const monitorIndex = window.get_monitor();
            const workArea = window.get_work_area_for_monitor(monitorIndex);
            const targetWidth = widthRatio === 1/3 ? Math.floor(workArea.width / 3) : Math.floor(workArea.width * 2 / 3);
            const targetX = position === 'left' ? workArea.x : workArea.x + workArea.width - targetWidth;

            // Execute resize and move operation
            // move_resize_frame handles both positioning and sizing in one operation
            window.move_resize_frame(false, targetX, workArea.y, targetWidth, workArea.height);
            this._logDebug(`Step 3: Window placement completed - Position(${targetX}, ${workArea.y}) Size(${targetWidth}x${workArea.height})`);
        } catch (error) {
            this._logError(`Step 3: Failed to place window: ${error}`);
        }
    }

}

let extension = null;

function init() {
    return new UltraWideSnapperTwoThirdsExtension();
}

function enable() {
    extension = init();
    extension.enable();
}

function disable() {
    if (extension) {
        extension.disable();
        extension = null;
    }
}
