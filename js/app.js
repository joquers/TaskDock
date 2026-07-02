import { TaskManager } from "./taskManager.js";
import { UI } from "./ui.js";
import { Storage } from "./storage.js";

export class Application {
    constructor() {
        this.taskManager = new TaskManager();
        this.storage = new Storage();
        this.ui = new UI(this.taskManager, this.storage);
        this.addButton = document.getElementById("td-add-task");
        this.newTaskInput = document.getElementById("td-new-task");
    }

    start() {
        this.loadTasks();
        this.attachEvents();
        this.ui.render();
    }

    loadTasks() {
        const savedTasks = this.storage.load();
        this.taskManager.load(savedTasks);
    }

    attachEvents() {
        this.addButton.addEventListener("click", () => {
            this.focusNewTaskInput();
        });

        if (this.newTaskInput) {
            this.newTaskInput.addEventListener("keydown", event => {
                if (event.key === "Enter") {
                    const text = this.newTaskInput.value;
                    if (text && text.trim().length > 0) {
                        this.ui.addTask(text);
                        this.newTaskInput.value = "";
                    }
                }
            });
        }

        window.addEventListener("keydown", event => {
            if (event.key === "n" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                this.focusNewTaskInput();
            }
        });
    }

    openTaskPrompt() {
        this.focusNewTaskInput();
    }

    focusNewTaskInput() {
        if (this.newTaskInput) {
            this.newTaskInput.focus();
            this.newTaskInput.select();
        }
    }
}

const app = new Application();
app.start();
