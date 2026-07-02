import St from 'gi://St';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Gdk from 'gi://Gdk';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Gtk from 'gi://Gtk';
import WebKit from 'gi://WebKit';

export default class TaskDockExtension extends Extension {
    enable() {
        this._button = new PanelMenu.Button(0.0, this.metadata.name, false);
        
        // Create icon for the panel button
        const icon = new St.Icon({
            icon_name: 'view-list-bullet-symbolic',
            style_class: 'system-status-icon'
        });
        
        this._button.add_child(icon);
        this._button.connect('button-press-event', () => {
            this._openWidget();
            return true;
        });
        
        // Add to top panel at position 1 (near the system status area)
        Main.panel.addToStatusArea(this.uuid, this._button, 1);
        
        this._window = null;
    }

    disable() {
        if (this._window) {
            this._window.destroy();
        }
        this._button?.destroy();
        this._button = null;
    }

    _openWidget() {
        if (this._window) {
            if (this._window.is_visible()) {
                this._window.hide();
            } else {
                this._window.present();
            }
            return;
        }

        const extensionPath = this.path;
        const indexPath = `file://${extensionPath}/index.html`;

        // Create a new window
        this._window = new Gtk.ApplicationWindow({
            title: 'TaskDock',
            default_width: 380,
            default_height: 600,
            modal: false,
            type_hint: Gdk.WindowTypeHint.UTILITY
        });

        // Create WebView to load the HTML widget
        const webview = new WebKit.WebView();
        
        // Load the HTML file
        webview.load_uri(indexPath);
        
        this._window.set_child(webview);
        this._window.show();

        this._window.connect('destroy', () => {
            this._window = null;
        });
    }
}
