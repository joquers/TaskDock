import { TaskRow } from "./taskRow.js";

export class UI {
    constructor(manager, storage) {
        this.manager = manager;
        this.storage = storage;
        this.container = document.getElementById("td-task-container");
        this.emptyState = this.createEmptyState();
        this.draggingId = null;
    }

    createEmptyState() {
        const wrapper = document.createElement("div");
        wrapper.className = "td-empty";
        wrapper.innerHTML = `
            <div class="td-empty-icon">📝</div>
            <div class="td-empty-title">Your task list is empty</div>
            <div class="td-empty-description">Click + Add Task to capture a quick item.</div>
        `;
        return wrapper;
    }

    render() {
        this.container.innerHTML = "";
        const tasks = this.manager.getTasks();

        if (tasks.length === 0) {
            this.container.appendChild(this.emptyState);
            return;
        }

        tasks.forEach(task => {
            const row = new TaskRow(task, {
                onToggle: id => this.toggleTask(id),
                onRemove: id => this.removeTask(id),
                onRename: (id, text) => this.renameTask(id, text)
            });

            const el = row.getWidget();
            el.draggable = true;
            el.dataset.id = task.id;

            el.addEventListener("dragstart", e => {
                this.draggingId = task.id;
                e.dataTransfer.effectAllowed = "move";
                try { e.dataTransfer.setData('text/plain', task.id); } catch {}
                el.classList.add('dragging');
            });

            el.addEventListener("dragend", () => {
                this.draggingId = null;
                el.classList.remove('dragging');
            });

            el.addEventListener("dragover", e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                el.classList.add('drag-over');
            });

            el.addEventListener("dragleave", () => {
                el.classList.remove('drag-over');
            });

            el.addEventListener("drop", e => {
                e.preventDefault();
                el.classList.remove('drag-over');
                const sourceId = this.draggingId || e.dataTransfer.getData('text/plain');
                const targetId = el.dataset.id;
                if (sourceId && targetId && sourceId !== targetId) {
                    this.manager.moveTask(sourceId, targetId);
                    this.persist();
                    this.render();
                }
            });

            this.container.appendChild(el);
        });
    }

    addTask(text) {
        const task = this.manager.addTask(text);
        if (!task) return;
        this.persist();
        this.render();
    }

    toggleTask(id) {
        this.manager.toggleTask(id);
        this.persist();
        this.render();
    }

    removeTask(id) {
        this.manager.removeTask(id);
        this.persist();
        this.render();
    }

    renameTask(id, text) {
        this.manager.renameTask(id, text);
        this.persist();
        this.render();
    }

    persist() {
        this.storage.save(this.manager.toJSON());
    }
}
