# TaskDock

TaskDock is a lightweight, native GNOME Shell task list. It adds a checklist icon to the top panel and opens a task menu without GTK, WebKit, HTML, or external runtime dependencies.

## Goals

* Lightweight and fast
* No external dependencies
* Native GNOME look and feel
* Works out of the box on a fresh Linux installation
* Compatible with GNOME 50+
* Simple, clean, and distraction-free interface

## Features

* Add tasks with Enter or the Add button
* Mark tasks complete or incomplete
* Edit and delete tasks
* Reorder tasks with accessible up/down controls
* Clear all completed tasks
* Persist tasks locally as JSON
* Display the number of active tasks in the top panel

Requirements

GNOME Shell 50

The gnome-extensions command-line tool

Only GNOME Shell 50 is declared until other versions have been tested.
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

## Install

chmod +x install.sh
./install.sh
gnome-extensions enable taskdock@joquers.github.io

If GNOME Shell does not detect the new installation immediately, log out and back in.

##Development testing

GNOME 50 uses Wayland. Start a nested Shell session:

dbus-run-session gnome-shell --devkit --wayland

Open a terminal inside the nested session and enable TaskDock:

gnome-extensions enable taskdock@joquers.github.io

Watch GNOME Shell logs from the host session:

journalctl -f -o cat /usr/bin/gnome-shell

Package manually

mkdir -p dist
gnome-extensions pack \
  --force \
  --out-dir=dist \
  --extra-source=taskStore.js \
  --extra-source=taskDialog.js \
  .

Data storage

Tasks are stored locally at:

~/.local/share/taskdock/tasks.json

TaskDock does not send task data anywhere and contains no telemetry.

Uninstall

gnome-extensions disable taskdock@joquers.github.io
rm -rf ~/.local/share/gnome-shell/extensions/taskdock@joquers.github.io

Deleting the extension does not delete the task data. To remove that too:

rm -rf ~/.local/share/taskdock

## Project Status

TaskDock is currently under active development.
The first public release will focus on providing a solid, stable, and minimal desktop task list before expanding with additional productivity features.

Contributions, feedback, and ideas are always welcome.

## License

Copyright © 2026 Oswaldo J. Silva. TaskDock is licensed under GPL-3.0-or-later. See LICENSE
