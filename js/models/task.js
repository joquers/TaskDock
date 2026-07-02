export class Task {
    constructor({
        id = crypto.randomUUID(),
        text = "",
        completed = false,
        createdAt = new Date().toISOString(),
        updatedAt = null
    } = {}) {
        this.id = id;
        this.text = text;
        this.completed = completed;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    rename(text) {
        this.text = text.trim();
        this.touch();
    }

    toggle() {
        this.completed = !this.completed;
        this.touch();
    }

    touch() {
        this.updatedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            text: this.text,
            completed: this.completed,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSON(data) {
        return new Task(data);
    }
}
