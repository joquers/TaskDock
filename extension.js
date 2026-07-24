// SPDX-License-Identifier: GPL-3.0-or-later

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {TaskEditDialog} from './taskDialog.js';
import {MAX_TASK_LENGTH, TaskStore} from './taskStore.js';

export default class TaskDockExtension extends Extension {
    enable() {
        // Create storage, panel indicator and native task menu.
    }

    disable() {
        // Cancel pending operations and destroy every Shell object.
    }
}
