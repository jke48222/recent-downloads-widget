#!/usr/bin/env bash
# One-click installer for this Übersicht widget. Safe to re-run (idempotent).
#
#   - Copies the .widget folder into your Übersicht widgets directory.
#   - Installs any helper scripts into ~/.config/widgetsuite.
#   - Runs the widget's interactive setup (API keys / permissions) if present.
#
# Usage:  ./install.sh        (or double-click install.command)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CFG="$HOME/.config/widgetsuite"
WIDGETS="$HOME/Library/Application Support/Übersicht/widgets"

say()  { printf '\033[1m==> %s\033[0m\n' "$*"; }
info() { printf '    %s\n' "$*"; }

WIDGET_DIR="$(/bin/ls -d "$DIR"/*.widget 2>/dev/null | head -1 || true)"
if [ -z "${WIDGET_DIR:-}" ]; then
  echo "No .widget folder found next to this installer." >&2
  exit 1
fi
NAME="$(basename "$WIDGET_DIR")"

say "Installing $NAME"

# 1) Helper scripts this widget needs at runtime (if any).
if [ -d "$DIR/setup" ]; then
  mkdir -p "$CFG"
  for f in "$DIR"/setup/*.py "$DIR"/setup/*.sh; do
    [ -e "$f" ] || continue
    base="$(basename "$f")"
    case "$base" in configure.sh|install.sh) continue ;; esac
    cp "$f" "$CFG/$base"
    chmod +x "$CFG/$base" 2>/dev/null || true
    info "helper → $CFG/$base"
  done
fi

# 2) Copy the widget into Übersicht (replace in place so re-runs stay clean).
if [ -d "$WIDGETS" ]; then
  rm -rf "$WIDGETS/$NAME"
  cp -R "$WIDGET_DIR" "$WIDGETS/$NAME"
  info "widget → $WIDGETS/$NAME"
else
  info "Übersicht widgets folder not found at:"
  info "  $WIDGETS"
  info "Install Übersicht from https://tracesof.net/uebersicht/ then re-run."
fi

# 3) Optional interactive configuration (API keys, credentials, permissions).
if [ -f "$DIR/setup/configure.sh" ]; then
  say "Configuring $NAME"
  CFG="$CFG" WIDGET_INSTALL_DIR="$WIDGETS/$NAME" bash "$DIR/setup/configure.sh" || true
fi

# 4) Make sure Übersicht is running so it picks up the widget automatically.
open -a "Übersicht" 2>/dev/null || true
say "Done."
info "If the widget isn't visible, click the Übersicht menu-bar icon → Refresh all."
