import { Task } from "./models/task.js";

export class TaskManager {
    constructor() {
        this.tasks = [];
    }

    getTasks() {
        return [...this.tasks];
    }

    addTask(text) {
        const value = text.trim();
        if (value.length === 0) return null;

        const task = new Task({ text: value });
        this.tasks.unshift(task);
        return task;
    }

    removeTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
    }

    /**
     * Move a task before another task (or to end when beforeId is null).
     */
    moveTask(id, beforeId = null) {
        const idx = this.tasks.findIndex(t => t.id === id);
        if (idx === -1) return;

        const [task] = this.tasks.splice(idx, 1);

        if (!beforeId) {
            this.tasks.push(task);
            return;
        }

        const beforeIndex = this.tasks.findIndex(t => t.id === beforeId);
        if (beforeIndex === -1) {
            this.tasks.push(task);
        } else {
            this.tasks.splice(beforeIndex, 0, task);
        }
    }

    getTask(id) {
        return this.tasks.find(task => task.id === id);
    }

    renameTask(id, text) {
        const task = this.getTask(id);
        if (!task) return;
        task.rename(text);
    }

    toggleTask(id) {
        const task = this.getTask(id);
        if (!task) return;
        task.toggle();
    }

    load(tasks) {
        this.tasks = tasks.map(task => Task.fromJSON(task));
    }

    toJSON() {
        return this.tasks.map(task => task.toJSON());
    }
}
