// SPDX-License-Identifier: GPL-3.0-or-later
import Clutter from 'gi://Clutter';
import St from 'gi://St';

import * as ModalDialog from 'resource:///org/gnome/shell/ui/modalDialog.js';

import {MAX_TASK_LENGTH} from './taskStore.js';

export class TaskEditDialog extends ModalDialog.ModalDialog {
    constructor(taskText, onSave) {
        super({
            destroyOnClose: true,
            styleClass: 'taskdock-edit-dialog',
        });

        this._onSave = onSave;
        this._saving = false;

        const content = new St.BoxLayout({
            vertical: true,
            style_class: 'taskdock-edit-dialog-content',
        });

        content.add_child(new St.Label({
            text: 'Edit task',
            style_class: 'taskdock-edit-dialog-title',
        }));

        this._entry = new St.Entry({
            text: taskText,
            hint_text: 'Task description',
            can_focus: true,
            style_class: 'taskdock-entry taskdock-edit-entry',
        });
        this._entry.clutter_text.connect(
            'activate',
            () => void this._save()
        );
        content.add_child(this._entry);

        this._errorLabel = new St.Label({
            text: '',
            visible: false,
            style_class: 'taskdock-status taskdock-status-error',
        });
        content.add_child(this._errorLabel);

        this.contentLayout.add_child(content);

        this.setButtons([
            {
                label: 'Cancel',
                key: Clutter.KEY_Escape,
                action: () => this.close(global.get_current_time()),
            },
            {
                label: 'Save',
                isDefault: true,
                action: () => void this._save(),
            },
        ]);

        this.setInitialKeyFocus(this._entry);
        this.connect('opened', () => {
            this._entry.grab_key_focus();
            this._entry.clutter_text.set_selection(0, -1);
        });
    }

    async _save() {
        if (this._saving)
            return;

        const text = this._entry.get_text().trim();

        if (!text) {
            this._showError('A task cannot be empty.');
            return;
        }

        if (text.length > MAX_TASK_LENGTH) {
            this._showError(`Tasks are limited to ${MAX_TASK_LENGTH} characters.`);
            return;
        }

        this._saving = true;
        this._showError('');

        try {
            if (await this._onSave(text))
                this.close(global.get_current_time());
            else
                this._showError('The task could not be saved.');
        } catch (error) {
            console.error(`TaskDock: edit failed: ${error.message}`);
            this._showError('The task could not be saved.');
        } finally {
            this._saving = false;
        }
    }

    _showError(message) {
        this._errorLabel.text = message;
        this._errorLabel.visible = Boolean(message);
    }
}
