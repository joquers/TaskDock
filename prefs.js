import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class TaskDockPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: 'TaskDock Settings'
        });

        const title = new Gtk.Label({
            label: '<b>TaskDock v1.0</b>',
            use_markup: true,
            margin_top: 12,
            margin_bottom: 12
        });

        const description = new Gtk.Label({
            label: 'A lightweight task list widget for your GNOME desktop.\n\nClick the icon in the top panel to open the task widget.',
            wrap: true,
            margin_top: 12,
            margin_bottom: 12
        });

        group.add(title);
        group.add(description);
        page.add(group);
        window.add(page);
    }
}
