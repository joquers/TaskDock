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

        // Native edit field, validation, Cancel and Save controls.
    }
}
