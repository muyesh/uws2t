const {GObject, Meta, Gio, Shell, GLib} = imports.gi;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const MessageTray = imports.ui.messageTray;

const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

let _;

class Window3SplitExtension {
    constructor() {
        this._settings = null;
        this._keybindings = [];
        _ = Convenience.initTranslations();
    }

    // GNOME Shell拡張機能標準のロギング機能
    _log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        log(`[UltraWideSnapperTwoThirds][${level}] ${timestamp}: ${message}`);
    }

    _logDebug(message) {
        this._log(message, 'DEBUG');
    }

    _logError(message) {
        this._log(message, 'ERROR');
    }

    enable() {
        this._log('Enabling UltraWideSnapperTwoThirds Extension');
        
        try {
            // 拡張機能のメタデータを取得
            this._extension = ExtensionUtils.getCurrentExtension();
            
            // ローカルスキーマを使用して設定を初期化
            this._settings = ExtensionUtils.getSettings(
                'org.gnome.shell.extensions.uws2t',
                this._extension
            );
            this._log('Settings initialization completed');
            
            // キーバインディングを追加
            this._addKeybindings();
            this._log('Keybinding setup completed');
        } catch (error) {
            this._logError('Error occurred while enabling extension: ' + error);
        }
    }

    disable() {
        this._logDebug('Disabling UltraWideSnapperTwoThirds Extension');
        
        // キーバインディングを削除
        this._removeKeybindings();
        
        // 設定をクリア
        this._settings = null;
    }

    _addKeybindings() {
        // 機能1: 左寄せ2/3
        this._addKeybinding('left-two-thirds', '<Ctrl><Super>Left', () => {
            this._logDebug('Left 2/3 function called');
            this._displayWindowInfo(2/3, 'left');
            this._resizeWindow(2/3, 'left');
        });

        // 機能2: 右寄せ2/3
        this._addKeybinding('right-two-thirds', '<Ctrl><Shift><Super>Right', () => {
            this._logDebug('Right 2/3 function called');
            this._displayWindowInfo(2/3, 'right');
            this._resizeWindow(2/3, 'right');
        });

        // 機能3: 右寄せ1/3
        this._addKeybinding('right-one-third', '<Ctrl><Super>Right', () => {
            this._logDebug('Right 1/3 function called');
            this._displayWindowInfo(1/3, 'right');
            this._resizeWindow(1/3, 'right');
        });

        // 機能4: 左寄せ1/3
        this._addKeybinding('left-one-third', '<Ctrl><Shift><Super>Left', () => {
            this._logDebug('Left 1/3 function called');
            this._displayWindowInfo(1/3, 'left');
            this._resizeWindow(1/3, 'left');
        });
    }

    _addKeybinding(name, shortcut, callback) {
        try {
            Main.wm.addKeybinding(
                name,
                this._settings,
                Meta.KeyBindingFlags.NONE,
                Shell.ActionMode.NORMAL,
                callback
            );
            this._keybindings.push(name);
            this._logDebug(`Added keybinding: ${name}`);
        } catch (error) {
            this._logError(`Failed to add keybinding ${name}: ${error}`);
        }
    }

    _removeKeybindings() {
        this._keybindings.forEach(name => {
            try {
                Main.wm.removeKeybinding(name);
            } catch (error) {
                this._logError(`Failed to remove keybinding ${name}: ${error}`);
            }
        });
        this._keybindings = [];
    }

    _showNotification(title, message) {
        Main.notify(title, message);
    }

    // ウィンドウ情報を表示する新しいメソッド（リサイズは無効化）
    _displayWindowInfo(widthRatio, position) {
        // アクティブなウィンドウを取得
        const window = global.display.focus_window;
        if (!window) {
            this._logDebug('No focused window found');
            this._showNotification(_('Error'), _('No focused window found'));
            return;
        }

        // ウィンドウのリサイズ可能性と詳細情報をログ出力
        this._logDebug(`Window resize capability: ${window.allows_resize()}`);
        this._logDebug(`Window type: ${window.get_window_type()}`);
        this._logDebug(`Maximized state: ${window.get_maximized()}`);

        // リサイズ不可の場合の追加情報
        if (!window.allows_resize()) {
            this._logDebug(`Window class: ${window.get_wm_class()}`);
            this._logDebug(`Window title: ${window.get_title()}`);
            this._logDebug(`Fullscreen state: ${window.is_fullscreen()}`);
            this._logDebug(`Modal state: ${window.is_modal()}`);
            try {
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
            // モニター情報を取得
            const monitorIndex = window.get_monitor();
            const workArea = window.get_work_area_for_monitor(monitorIndex);
            const windowRect = window.get_frame_rect();
            
            // 計算値
            const oneThirdWidth = Math.floor(workArea.width / 3);
            const twoThirdsWidth = Math.floor(workArea.width * 2 / 3);
            const targetWidth = widthRatio === 1/3 ? oneThirdWidth : twoThirdsWidth;
            
            // 位置計算
            const leftX = workArea.x;
            const rightX = workArea.x + workArea.width - targetWidth;
            const targetX = position === 'left' ? leftX : rightX;
            const targetY = workArea.y;
            
            // ログに詳細情報を出力
            this._log(`=== Window Info (${position === 'left' ? 'Left' : 'Right'} ${widthRatio === 1/3 ? '1/3' : '2/3'}) ===`);
            this._log(`Current target window: ${windowRect.width}x${windowRect.height}`);
            this._log(`Current work area: ${workArea.width}x${workArea.height}`);
            this._log(`Calculated 1/3 width: ${oneThirdWidth}px`);
            this._log(`Calculated 2/3 width: ${twoThirdsWidth}px`);
            this._log(`Left position start: (${leftX}, ${targetY})`);
            this._log(`Right position start: (${rightX}, ${targetY})`);
            this._log(`Target placement position: (${targetX}, ${targetY})`);
            this._log(`Target size: ${targetWidth}x${workArea.height}`);
            
            // 通知で要約情報を表示
            const positionText = position === 'left' ? '左寄せ' : '右寄せ';
            const ratioText = widthRatio === 1/3 ? '1/3' : '2/3';
            const infoMessage = `${positionText}${ratioText}\n` +
                              `ウィンドウ: ${windowRect.width}x${windowRect.height}\n` +
                              `作業領域: ${workArea.width}x${workArea.height}\n` +
                              `配置位置: (${targetX}, ${targetY})`;
            
            this._showNotification(_('Window Information'), infoMessage);

        } catch (error) {
            this._logError('Failed to get window information: ' + error);
            this._showNotification(_('Error'), _('Failed to get window information'));
        }
    }

    // ウィンドウのリサイズと配置を行うメソッド
    _resizeWindow(widthRatio, position) {
        // アクティブなウィンドウを取得
        const window = global.display.focus_window;
        if (!window) {
            this._logDebug('_resizeWindow: No focused window found');
            return;
        }

        // ステップ1: 初回リサイズ可能性チェック
        if (!window.allows_resize()) {
            this._logDebug("Step 1: Window is not resizable, terminating process");
            return;
        }
        this._logDebug("Step 1: Window resize capability check completed");

        // ステップ2: 最大化状態の確認と解除
        const maximized = window.get_maximized();
        if (maximized !== Meta.MaximizeFlags.NONE) {
            this._logDebug(`Step 2: Maximized state detected (${maximized}), executing unmaximize`);
            window.unmaximize(Meta.MaximizeFlags.BOTH);
            
            // 最大化解除後の再チェック
            if (!window.allows_resize()) {
                this._logDebug("Step 2: Still not resizable after unmaximize, terminating process");
                return;
            }
            this._logDebug("Step 2: Resize capability check after unmaximize completed");
        } else {
            this._logDebug("Step 2: Window is not maximized");
        }

        // ステップ3: ウィンドウの配置とリサイズ
        try {
            // 位置とサイズの計算
            const monitorIndex = window.get_monitor();
            const workArea = window.get_work_area_for_monitor(monitorIndex);
            const targetWidth = widthRatio === 1/3 ? Math.floor(workArea.width / 3) : Math.floor(workArea.width * 2 / 3);
            const targetX = position === 'left' ? workArea.x : workArea.x + workArea.width - targetWidth;

            // リサイズ実行
            window.move_resize_frame(false, targetX, workArea.y, targetWidth, workArea.height);
            this._logDebug(`Step 3: Window placement completed - Position(${targetX}, ${workArea.y}) Size(${targetWidth}x${workArea.height})`);
        } catch (error) {
            this._logError(`Step 3: Failed to place window: ${error}`);
        }
    }

}

let extension = null;

function init() {
    return new Window3SplitExtension();
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
