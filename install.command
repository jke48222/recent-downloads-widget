#!/usr/bin/env bash
# Double-clickable installer: runs install.sh and keeps the window open.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$DIR/install.sh"
status=$?
echo
read -r -p "Setup finished — press Return to close this window. " _
exit $status
