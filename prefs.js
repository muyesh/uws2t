const {Gtk, Gdk, GObject, Gio} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

let _;

function init() {
    _ = Convenience.initTranslations();
}

function buildPrefsWidget() {
    let settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.uws2t');
    
    let widget = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 10,
        margin_top: 20,
        margin_bottom: 20,
        margin_start: 20,
        margin_end: 20,
    });

    // Title section
    let titleLabel = new Gtk.Label({
        label: '<b>' + _('Keyboard Shortcut Settings') + '</b>',
        use_markup: true,
        halign: Gtk.Align.START,
    });
    widget.append(titleLabel);

    // Description section
    let descLabel = new Gtk.Label({
        label: _('Configure shortcut keys for each function'),
        halign: Gtk.Align.START,
        margin_bottom: 10,
    });
    widget.append(descLabel);

    // Keybinding configuration settings
    let keybindings = [
        {key: 'left-two-thirds', label: _('Left 2/3'), desc: _('Place window on the left side with 2/3 width')},
        {key: 'right-two-thirds', label: _('Right 2/3'), desc: _('Place window on the right side with 2/3 width')},
        {key: 'right-one-third', label: _('Right 1/3'), desc: _('Place window on the right side with 1/3 width')},
        {key: 'left-one-third', label: _('Left 1/3'), desc: _('Place window on the left side with 1/3 width')},
    ];

    keybindings.forEach(binding => {
        let row = createKeybindingRow(settings, binding.key, binding.label, binding.desc);
        widget.append(row);
    });

    // Debug settings section
    let debugSeparator = new Gtk.Separator({
        orientation: Gtk.Orientation.HORIZONTAL,
        margin_top: 20,
        margin_bottom: 10,
    });
    widget.append(debugSeparator);

    let debugTitleLabel = new Gtk.Label({
        label: '<b>' + _('Debug Settings') + '</b>',
        use_markup: true,
        halign: Gtk.Align.START,
    });
    widget.append(debugTitleLabel);

    let debugRow = createDebugRow(settings);
    widget.append(debugRow);

    return widget;
}

function createKeybindingRow(settings, key, label, description) {
    let row = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 10,
        margin_bottom: 10,
    });

    // Label section
    let labelBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 2,
        hexpand: true,
    });

    let titleLabel = new Gtk.Label({
        label: label,
        halign: Gtk.Align.START,
        use_markup: true,
    });

    let descLabel = new Gtk.Label({
        label: description,
        halign: Gtk.Align.START,
        wrap: true,
    });

    labelBox.append(titleLabel);
    labelBox.append(descLabel);

    // Shortcut display
    let shortcutLabel = new Gtk.Label({
        halign: Gtk.Align.END,
        valign: Gtk.Align.CENTER,
    });

    // Settings button
    let button = new Gtk.Button({
        label: _('Set'),
        valign: Gtk.Align.CENTER,
    });

    // Display current settings
    updateShortcutLabel(settings, key, shortcutLabel);

    // Button click event handler
    button.connect('clicked', () => {
        console.log(`Button clicked for key: ${key}`);
        showKeybindingDialog(button, settings, key, shortcutLabel);
    });

    // Settings change event handler
    settings.connect(`changed::${key}`, () => {
        updateShortcutLabel(settings, key, shortcutLabel);
    });

    row.append(labelBox);
    row.append(shortcutLabel);
    row.append(button);

    return row;
}

function updateShortcutLabel(settings, key, label) {
    let shortcuts = settings.get_strv(key);
    if (shortcuts.length > 0) {
        label.set_text(shortcuts[0]);
    } else {
        label.set_text(_('Not Set'));
    }
}

function showKeybindingDialog(parent, settings, key, label) {
    console.log(`showKeybindingDialog called for key: ${key}`);
    
    try {
        // Get parent window (GTK 4 compatible)
        let parentWindow = parent.get_root();
        console.log(`Parent window: ${parentWindow}`);
        
        // Create safer dialog
        let dialog = new Gtk.Window({
            title: _('Set Shortcut Key'),
            transient_for: parentWindow,
            modal: true,
            default_width: 400,
            default_height: 200,
        });
        console.log(`Dialog created: ${dialog}`);

        // Create dialog content
        let box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 12,
            margin_top: 12,
            margin_bottom: 12,
            margin_start: 12,
            margin_end: 12,
        });

        let instructionLabel = new Gtk.Label({
            label: _('Press the new shortcut key'),
            wrap: true,
        });
        box.append(instructionLabel);

        let shortcutLabel = new Gtk.Label({
            label: _('Not Set'),
            halign: Gtk.Align.CENTER,
        });
        box.append(shortcutLabel);

        // Button box
        let buttonBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 6,
            halign: Gtk.Align.END,
        });

        let cancelButton = new Gtk.Button({
            label: _('Cancel'),
        });

        let clearButton = new Gtk.Button({
            label: _('Clear'),
        });

        let okButton = new Gtk.Button({
            label: _('Set'),
        });

        buttonBox.append(cancelButton);
        buttonBox.append(clearButton);
        buttonBox.append(okButton);
        box.append(buttonBox);

        dialog.set_child(box);

        let newShortcut = '';

        // GTK 4 key event handling
        let keyController = new Gtk.EventControllerKey();
        dialog.add_controller(keyController);
        
        keyController.connect('key-pressed', (controller, keyval, keycode, state) => {
            console.log(`Key pressed: ${keyval}, state: ${state}`);
            let mask = state & Gtk.accelerator_get_default_mod_mask();
            
            // Allow normal processing for Escape and Return keys
            if (mask === 0 && (keyval === Gdk.KEY_Escape || keyval === Gdk.KEY_Return)) {
                return false;
            }

            // Handle combination of modifier keys and normal keys
            if (keyval !== 0 && mask !== 0) {
                newShortcut = Gtk.accelerator_name(keyval, mask);
                shortcutLabel.set_text(newShortcut);
                console.log(`New shortcut: ${newShortcut}`);
                return true;
            }

            return false;
        });

        // Button events
        cancelButton.connect('clicked', () => {
            dialog.destroy();
        });

        clearButton.connect('clicked', () => {
            settings.set_strv(key, []);
            dialog.destroy();
        });

        okButton.connect('clicked', () => {
            if (newShortcut) {
                settings.set_strv(key, [newShortcut]);
            }
            dialog.destroy();
        });

        // Display dialog
        dialog.present();
        console.log('Dialog presented');
        
    } catch (error) {
        console.error(`Error in showKeybindingDialog: ${error}`);
    }
}

function createDebugRow(settings) {
    let row = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 10,
        margin_bottom: 10,
    });

    // Label section
    let labelBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 2,
        hexpand: true,
    });

    let titleLabel = new Gtk.Label({
        label: _('Enable Debug Mode'),
        halign: Gtk.Align.START,
        use_markup: true,
    });

    let descLabel = new Gtk.Label({
        label: _('Show debug logs and notifications'),
        halign: Gtk.Align.START,
        wrap: true,
    });

    labelBox.append(titleLabel);
    labelBox.append(descLabel);

    // Checkbox
    let debugSwitch = new Gtk.Switch({
        valign: Gtk.Align.CENTER,
    });

    // Reflect current settings
    debugSwitch.set_active(settings.get_boolean('debug'));

    // Switch state change event handler
    debugSwitch.connect('notify::active', () => {
        settings.set_boolean('debug', debugSwitch.get_active());
    });

    // Settings change event handler
    settings.connect('changed::debug', () => {
        debugSwitch.set_active(settings.get_boolean('debug'));
    });

    row.append(labelBox);
    row.append(debugSwitch);

    return row;
}
