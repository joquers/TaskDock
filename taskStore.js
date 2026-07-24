// SPDX-License-Identifier: GPL-3.0-or-later
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

Gio._promisify(
    Gio.File.prototype,
    'load_contents_async',
    'load_contents_finish'
);
Gio._promisify(
    Gio.File.prototype,
    'replace_contents_bytes_async',
    'replace_contents_finish'
);

const DATA_VERSION = 1;
export const MAX_TASK_LENGTH = 500;

function normalizeTask(rawTask, seenIds) {
    if (!rawTask || typeof rawTask !== 'object')
        return null;

    if (typeof rawTask.text !== 'string')
        return null;

    const text = rawTask.text.trim().slice(0, MAX_TASK_LENGTH);
    if (!text)
        return null;

    let id = typeof rawTask.id === 'string' && rawTask.id.trim()
        ? rawTask.id.trim()
        : GLib.uuid_string_random();

    if (seenIds.has(id))
        id = GLib.uuid_string_random();

    seenIds.add(id);

    const createdAt = typeof rawTask.createdAt === 'string' &&
        !Number.isNaN(Date.parse(rawTask.createdAt))
        ? rawTask.createdAt
        : new Date().toISOString();

    return {
        id,
        text,
        completed: rawTask.completed === true,
        createdAt,
    };
}

export class TaskStore {
    constructor() {
        this._dataDirectoryPath = GLib.build_filenamev([
            GLib.get_user_data_dir(),
            'taskdock',
        ]);

        this._file = Gio.File.new_for_path(GLib.build_filenamev([
            this._dataDirectoryPath,
            'tasks.json',
        ]));
    }

    get path() {
        return this._file.get_path();
    }

    async load(cancellable = null) {
        try {
            const [contents] = await this._file.load_contents_async(cancellable);
            const text = new TextDecoder('utf-8').decode(contents);
            const parsed = JSON.parse(text);
            const rawTasks = Array.isArray(parsed) ? parsed : parsed?.tasks;

            if (!Array.isArray(rawTasks))
                return [];

            const seenIds = new Set();
            return rawTasks
                .map(task => normalizeTask(task, seenIds))
                .filter(task => task !== null);
        } catch (error) {
            if (error.matches?.(
                Gio.io_error_quark(),
                Gio.IOErrorEnum.NOT_FOUND
            )) {
                return [];
            }

            throw error;
        }
    }

    async save(tasks, cancellable = null) {
        if (!Array.isArray(tasks))
            throw new TypeError('TaskDock tasks must be an array');

        if (GLib.mkdir_with_parents(this._dataDirectoryPath, 0o700) !== 0)
            throw new Error('Could not create the TaskDock data directory');

        const payload = {
            version: DATA_VERSION,
            tasks,
        };

        const bytes = new GLib.Bytes(
            `${JSON.stringify(payload, null, 2)}\n`
        );

        await this._file.replace_contents_bytes_async(
            bytes,
            null,
            true,
            Gio.FileCreateFlags.PRIVATE |
                Gio.FileCreateFlags.REPLACE_DESTINATION,
            cancellable
        );
    }
}
