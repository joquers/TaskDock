export class Storage {
    constructor(key = "taskdock.tasks") {
        this.key = key;
    }

    load() {
        try {
            const raw = localStorage.getItem(this.key);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    save(tasks) {
        localStorage.setItem(this.key, JSON.stringify(tasks));
    }
}
