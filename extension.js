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
        this._store = new TaskStore();
        this._tasks = [];
        this._editDialog = null;
        this._isReady = false;
        this._isSaving = false;
        this._cancellable = new Gio.Cancellable();

        this._indicator = new PanelMenu.Button(
            0.0,
            this.metadata.name,
            false
        );

        const panelBox = new St.BoxLayout({
            style_class: 'panel-status-menu-box',
        });

        panelBox.add_child(new St.Icon({
            icon_name: 'view-list-bullet-symbolic',
            style_class: 'system-status-icon',
        }));

        this._panelCount = new St.Label({
            text: '',
            visible: false,
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'taskdock-panel-count',
        });
        panelBox.add_child(this._panelCount);

        this._indicator.add_child(panelBox);
        this._buildMenu();

        Main.panel.addToStatusArea(this.uuid, this._indicator);
        this._renderTasks();
        this._setStatus('Loading tasks…');
        void this._loadTasks();
    }

    disable() {
        this._cancellable?.cancel();
        this._cancellable = null;
        this._isReady = false;

        if (this._editDialog) {
            this._editDialog.destroy();
            this._editDialog = null;
        }

        if (this._indicator && this._menuOpenSignalId) {
            this._indicator.menu.disconnect(this._menuOpenSignalId);
            this._menuOpenSignalId = null;
        }

        this._indicator?.destroy();
        this._indicator = null;
        this._panelCount = null;
        this._entry = null;
        this._taskList = null;
        this._taskCountLabel = null;
        this._clearCompletedButton = null;
        this._statusLabel = null;
        this._tasks = [];
        this._store = null;
    }

    async _loadTasks() {
        try {
            const tasks = await this._store.load(this._cancellable);

            if (!this._indicator || this._cancellable?.is_cancelled())
                return;

            this._tasks = tasks;
            this._isReady = true;
            this._setStatus('');
            this._renderTasks();
        } catch (error) {
            if (this._cancellable?.is_cancelled())
                return;

            console.error(`TaskDock: failed to load tasks: ${error.message}`);
            this._isReady = true;
            this._setStatus('Could not load saved tasks.', true);
            this._renderTasks();
        }
    }

    _buildMenu() {
        const menuItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false,
            style_class: 'taskdock-menu-item',
        });

        const root = new St.BoxLayout({
            vertical: true,
            style_class: 'taskdock-root',
        });
        menuItem.add_child(root);

        const header = new St.BoxLayout({
            style_class: 'taskdock-header',
        });
        header.add_child(new St.Label({
            text: 'TaskDock',
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'taskdock-title',
        }));

        this._taskCountLabel = new St.Label({
            text: '0 tasks',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'taskdock-task-count',
        });
        header.add_child(this._taskCountLabel);
        root.add_child(header);

        const inputRow = new St.BoxLayout({
            style_class: 'taskdock-input-row',
        });

        this._entry = new St.Entry({
            hint_text: 'Add a task…',
            can_focus: true,
            x_expand: true,
            style_class: 'taskdock-entry',
            accessible_name: 'New task',
        });
        this._entry.clutter_text.connect(
            'activate',
            () => void this._addTask()
        );
        inputRow.add_child(this._entry);

        const addButton = new St.Button({
            label: 'Add',
            can_focus: true,
            style_class: 'taskdock-add-button',
            accessible_name: 'Add task',
        });
        addButton.connect('clicked', () => void this._addTask());
        inputRow.add_child(addButton);
        root.add_child(inputRow);

        const scrollView = new St.ScrollView({
            overlay_scrollbars: true,
            hscrollbar_policy: St.PolicyType.NEVER,
            vscrollbar_policy: St.PolicyType.AUTOMATIC,
            style_class: 'taskdock-scroll-view',
        });

        this._taskList = new St.BoxLayout({
            vertical: true,
            style_class: 'taskdock-task-list',
        });
        scrollView.set_child(this._taskList);
        root.add_child(scrollView);

        const footer = new St.BoxLayout({
            style_class: 'taskdock-footer',
        });

        this._statusLabel = new St.Label({
            text: '',
            visible: false,
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'taskdock-status',
        });
        footer.add_child(this._statusLabel);

        this._clearCompletedButton = new St.Button({
            label: 'Clear completed',
            visible: false,
            can_focus: true,
            style_class: 'taskdock-link-button',
            accessible_name: 'Delete all completed tasks',
        });
        this._clearCompletedButton.connect(
            'clicked',
            () => void this._clearCompleted()
        );
        footer.add_child(this._clearCompletedButton);
        root.add_child(footer);

        this._indicator.menu.addMenuItem(menuItem);
        this._menuOpenSignalId = this._indicator.menu.connect(
            'open-state-changed',
            (_menu, isOpen) => {
                if (isOpen && this._isReady && !this._isSaving) {
                    this._setStatus('');
                    this._entry.grab_key_focus();
                }
            }
        );
    }

    _renderTasks() {
        if (!this._taskList)
            return;

        for (const child of this._taskList.get_children())
            child.destroy();

        if (this._tasks.length === 0) {
            this._taskList.add_child(new St.Label({
                text: 'No tasks yet. Add one above.',
                x_align: Clutter.ActorAlign.CENTER,
                style_class: 'taskdock-empty-state',
            }));
        } else {
            this._tasks.forEach((task, index) => {
                this._taskList.add_child(
                    this._createTaskRow(task, index)
                );
            });
        }

        const activeCount = this._tasks.filter(task => !task.completed).length;
        const completedCount = this._tasks.length - activeCount;
        const total = this._tasks.length;

        this._taskCountLabel.text = `${total} ${total === 1 ? 'task' : 'tasks'}`;
        this._clearCompletedButton.visible = completedCount > 0;
        this._panelCount.text = activeCount > 0 ? String(activeCount) : '';
        this._panelCount.visible = activeCount > 0;
    }

    _createTaskRow(task, index) {
        const row = new St.BoxLayout({
            style_class: task.completed
                ? 'taskdock-task-row taskdock-task-row-completed'
                : 'taskdock-task-row',
        });

        const toggleButton = new St.Button({
            can_focus: true,
            style_class: 'taskdock-icon-button taskdock-toggle-button',
            accessible_name: task.completed
                ? `Mark “${task.text}” as incomplete`
                : `Mark “${task.text}” as completed`,
            child: new St.Label({
                text: task.completed ? '✓' : '○',
                style_class: 'taskdock-toggle-symbol',
            }),
        });
        toggleButton.connect(
            'clicked',
            () => void this._toggleTask(task.id)
        );
        row.add_child(toggleButton);

        const taskLabel = new St.Label({
            text: task.text,
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'taskdock-task-label',
        });
        taskLabel.clutter_text.line_wrap = true;
        taskLabel.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
        row.add_child(taskLabel);

        row.add_child(this._createIconButton({
            iconName: 'go-up-symbolic',
            accessibleName: `Move “${task.text}” up`,
            enabled: index > 0,
            onClicked: () => void this._moveTask(task.id, -1),
        }));

        row.add_child(this._createIconButton({
            iconName: 'go-down-symbolic',
            accessibleName: `Move “${task.text}” down`,
            enabled: index < this._tasks.length - 1,
            onClicked: () => void this._moveTask(task.id, 1),
        }));

        row.add_child(this._createIconButton({
            iconName: 'document-edit-symbolic',
            accessibleName: `Edit “${task.text}”`,
            onClicked: () => this._openEditDialog(task.id),
        }));

        row.add_child(this._createIconButton({
            iconName: 'user-trash-symbolic',
            accessibleName: `Delete “${task.text}”`,
            styleClass: 'taskdock-icon-button taskdock-delete-button',
            onClicked: () => void this._deleteTask(task.id),
        }));

        return row;
    }

    _createIconButton({
        iconName,
        accessibleName,
        onClicked,
        enabled = true,
        styleClass = 'taskdock-icon-button',
    }) {
        const button = new St.Button({
            can_focus: enabled,
            reactive: enabled,
            style_class: styleClass,
            accessible_name: accessibleName,
            child: new St.Icon({
                icon_name: iconName,
                icon_size: 16,
            }),
        });

        if (enabled)
            button.connect('clicked', onClicked);

        return button;
    }

    async _addTask() {
        const text = this._entry.get_text().trim();

        if (!text) {
            this._setStatus('Enter a task first.', true);
            return;
        }

        if (text.length > MAX_TASK_LENGTH) {
            this._setStatus(
                `Tasks are limited to ${MAX_TASK_LENGTH} characters.`,
                true
            );
            return;
        }

        const nextTasks = [
            ...this._tasks,
            {
                id: GLib.uuid_string_random(),
                text,
                completed: false,
                createdAt: new Date().toISOString(),
            },
        ];

        if (await this._commit(nextTasks)) {
            this._entry.set_text('');
            this._entry.grab_key_focus();
        }
    }

    async _toggleTask(id) {
        const nextTasks = this._tasks.map(task => task.id === id
            ? {...task, completed: !task.completed}
            : task
        );
        await this._commit(nextTasks);
    }

    async _deleteTask(id) {
        const nextTasks = this._tasks.filter(task => task.id !== id);
        await this._commit(nextTasks);
    }

    async _clearCompleted() {
        const nextTasks = this._tasks.filter(task => !task.completed);
        await this._commit(nextTasks);
    }

    async _moveTask(id, direction) {
        const sourceIndex = this._tasks.findIndex(task => task.id === id);
        if (sourceIndex < 0)
            return;

        const targetIndex = sourceIndex + direction;
        if (targetIndex < 0 || targetIndex >= this._tasks.length)
            return;

        const nextTasks = [...this._tasks];
        const [task] = nextTasks.splice(sourceIndex, 1);
        nextTasks.splice(targetIndex, 0, task);
        await this._commit(nextTasks);
    }

    _openEditDialog(id) {
        const task = this._tasks.find(item => item.id === id);
        if (!task || !this._isReady || this._isSaving)
            return;

        this._indicator.menu.close();
        this._editDialog?.destroy();

        this._editDialog = new TaskEditDialog(
            task.text,
            text => this._renameTask(id, text)
        );

        this._editDialog.connect('destroy', () => {
            this._editDialog = null;
        });

        this._editDialog.open(global.get_current_time());
    }

    async _renameTask(id, text) {
        const nextTasks = this._tasks.map(task => task.id === id
            ? {...task, text}
            : task
        );
        return this._commit(nextTasks);
    }

    async _commit(nextTasks) {
        if (!this._isReady) {
            this._setStatus('Tasks are still loading.', true);
            return false;
        }

        if (this._isSaving) {
            this._setStatus('Please wait for the current save.', true);
            return false;
        }

        this._isSaving = true;
        this._setStatus('Saving…');

        try {
            await this._store.save(nextTasks, this._cancellable);

            if (!this._indicator || this._cancellable?.is_cancelled())
                return false;

            this._tasks = nextTasks;
            this._setStatus('');
            this._renderTasks();
            return true;
        } catch (error) {
            if (this._cancellable?.is_cancelled())
                return false;

            console.error(`TaskDock: failed to save tasks: ${error.message}`);
            this._setStatus('Could not save tasks to disk.', true);
            return false;
        } finally {
            this._isSaving = false;
        }
    }

    _setStatus(message, isError = false) {
        if (!this._statusLabel)
            return;

        this._statusLabel.text = message;
        this._statusLabel.visible = Boolean(message);

        if (isError)
            this._statusLabel.add_style_class_name('taskdock-status-error');
        else
            this._statusLabel.remove_style_class_name('taskdock-status-error');
    }
}
