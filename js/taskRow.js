export class TaskRow {
    constructor(task, callbacks) {
        this.task = task;
        this.callbacks = callbacks;
        this.element = document.createElement("div");
        this.element.className = "td-task";
        this.element.dataset.id = task.id;

        this.checkbox = document.createElement("input");
        this.checkbox.type = "checkbox";
        this.checkbox.className = "td-task-checkbox";
        this.checkbox.checked = task.completed;

        this.label = document.createElement("span");
        this.label.className = "td-task-label";
        this.label.textContent = task.text;

        this.editField = document.createElement("input");
        this.editField.type = "text";
        this.editField.className = "td-task-editor";
        this.editField.value = task.text;
        this.editField.hidden = true;

        this.actions = document.createElement("div");
        this.actions.className = "td-task-actions";

        this.removeButton = document.createElement("button");
        this.removeButton.type = "button";
        this.removeButton.className = "td-task-remove";
        this.removeButton.textContent = "✕";

        this.actions.appendChild(this.removeButton);
        this.element.append(this.checkbox, this.label, this.editField, this.actions);

        this.update();
        this.connectSignals();
    }

    connectSignals() {
        this.checkbox.addEventListener("change", () => {
            this.callbacks.onToggle(this.task.id);
        });

        this.removeButton.addEventListener("click", () => {
            this.callbacks.onRemove(this.task.id);
        });

        this.label.addEventListener("dblclick", () => {
            this.startEditing();
        });

        this.editField.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                this.commitEdit();
            }
            if (event.key === "Escape") {
                this.cancelEdit();
            }
        });

        this.editField.addEventListener("blur", () => {
            this.commitEdit();
        });
    }

    update() {
        this.checkbox.checked = this.task.completed;
        this.label.textContent = this.task.text;
        this.editField.value = this.task.text;
        this.element.classList.toggle("completed", this.task.completed);
    }

    startEditing() {
        this.label.hidden = true;
        this.editField.hidden = false;
        this.editField.focus();
        this.editField.setSelectionRange(0, this.editField.value.length);
    }

    commitEdit() {
        const newValue = this.editField.value.trim();
        if (newValue.length === 0) {
            this.callbacks.onRemove(this.task.id);
            return;
        }

        if (newValue !== this.task.text) {
            this.callbacks.onRename(this.task.id, newValue);
        }

        this.label.hidden = false;
        this.editField.hidden = true;
    }

    cancelEdit() {
        this.editField.value = this.task.text;
        this.label.hidden = false;
        this.editField.hidden = true;
    }

    getWidget() {
        return this.element;
    }
}
