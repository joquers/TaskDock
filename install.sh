#!/bin/bash

# TaskDock GNOME Extension Installer

EXTENSION_NAME="taskdock@local"
EXTENSIONS_DIR="$HOME/.local/share/gnome-shell/extensions"
EXTENSION_PATH="$EXTENSIONS_DIR/$EXTENSION_NAME"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📦 Installing TaskDock GNOME Extension..."

# Create extensions directory if it doesn't exist
mkdir -p "$EXTENSIONS_DIR"

# Remove existing installation if present
if [ -d "$EXTENSION_PATH" ]; then
    echo "⚠️  Removing existing installation..."
    rm -rf "$EXTENSION_PATH"
fi

# Copy extension files
echo "📋 Copying extension files..."
mkdir -p "$EXTENSION_PATH"
cp "$PROJECT_DIR/metadata.json" "$EXTENSION_PATH/"
cp "$PROJECT_DIR/extension.js" "$EXTENSION_PATH/"
cp "$PROJECT_DIR/prefs.js" "$EXTENSION_PATH/"
cp "$PROJECT_DIR/stylesheet.css" "$EXTENSION_PATH/"
cp "$PROJECT_DIR/index.html" "$EXTENSION_PATH/"
cp -r "$PROJECT_DIR/js" "$EXTENSION_PATH/"
cp -r "$PROJECT_DIR/css" "$EXTENSION_PATH/"

echo "✅ Extension installed to: $EXTENSION_PATH"
echo ""
echo "📌 Next steps:"
echo "1. Restart GNOME Shell (Alt+F2, type 'r', press Enter)"
echo "2. Open Settings → Extensions → TaskDock to enable it"
echo "3. Click the checklist icon in the top panel to open the widget"
echo ""
echo "💡 To reload the extension during development:"
echo "   Alt+F2 → 'restart' → Enter (full restart)"
echo "   Or use: gnome-extensions reload taskdock@local"
