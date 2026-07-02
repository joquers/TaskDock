# TaskDock

TaskDock is a lightweight desktop to-do list widget for GNOME, built for the Desktop Widgets ecosystem.

Designed with simplicity and performance in mind, TaskDock provides an always-visible task list directly on your desktop, allowing you to quickly capture ideas, organize daily work, and keep track of important tasks without opening a separate application.

## Goals

* Lightweight and fast
* No external dependencies
* Native GNOME look and feel
* Works out of the box on a fresh Linux installation
* Compatible with GNOME 50+
* Simple, clean, and distraction-free interface

## Features

### Version 1.0

* Create tasks
* Edit tasks inline
* Mark tasks as completed
* Delete tasks
* Automatic local persistence
* Dark and light theme support

### Planned Features

* Drag and drop task reordering
* Task priorities
* Categories and tags
* Due dates
* Keyboard shortcuts
* Import and export
* Nextcloud synchronization
* Multiple desktop widgets

## Design Philosophy

TaskDock follows a simple principle:

> Your task list should always be available, always be fast, and never get in your way.

The project intentionally avoids heavy frameworks, unnecessary background services, and external dependencies. Everything is built using modern HTML, CSS, and JavaScript to deliver a lightweight experience that feels native on GNOME.

## Project Status

TaskDock is currently under active development.
The first public release will focus on providing a solid, stable, and minimal desktop task list before expanding with additional productivity features.

Contributions, feedback, and ideas are always welcome.

## Installation

### Requirements

* GNOME 40 or later
* A modern Linux distribution (Fedora, Ubuntu 22.04+, Debian 11+, Arch, etc.)

### Install as GNOME Extension

1. **Clone or download** the TaskDock repository:
   ```bash
   cd ~/Documentos/TaskDock
   ```

2. **Run the install script:**
   ```bash
   bash install.sh
   ```

3. **Restart GNOME Shell:**
   - Press `Alt+F2`, type `r`, then press `Enter`
   - Or log out and log back in

4. **Enable the extension:**
   - Open **Settings → Extensions**
   - Find **TaskDock** and toggle it ON

5. **Open the widget:**
   - Click the checklist icon in the top panel
   - The task widget will open in a floating window

### Manual Installation

If the install script doesn't work:

```bash
mkdir -p ~/.local/share/gnome-shell/extensions/taskdock@local
cp -r ~/Documentos/TaskDock/* ~/.local/share/gnome-shell/extensions/taskdock@local/
```

Then restart GNOME Shell and enable in Settings.

## Usage

- **Add a task:** Click the input field and type, then press `Enter`
- **Complete a task:** Click the checkbox next to a task
- **Edit a task:** Double-click the task text to inline edit
- **Delete a task:** Click the ✕ button on the task
- **Reorder tasks:** Drag a task over another to move it
- **Keyboard shortcut:** Press `Ctrl+N` (or `Cmd+N` on Mac) to focus the input

## Development

To test changes during development:

1. Edit files in `~/Documentos/TaskDock/`
2. Copy changes to the extension folder:
   ```bash
   cp ~/Documentos/TaskDock/{extension.js,index.html,css/*,js/*} ~/.local/share/gnome-shell/extensions/taskdock@local/
   ```
3. Reload the extension:
   ```bash
   gnome-extensions reload taskdock@local
   ```
4. Or restart GNOME Shell with `Alt+F2 → r`

