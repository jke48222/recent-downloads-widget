# recent-downloads — Troubleshooting

### The widget doesn't appear
- Make sure Übersicht is running, then use its menu-bar icon → **Refresh all**.
- Confirm `recent-downloads.widget` is in
  `~/Library/Application Support/Übersicht/widgets/`.
- Re-run `./install.sh`.

### Images or assets don't load
- Keep the `recent-downloads.widget` **folder intact**. Übersicht serves bundled assets
  relative to the widgets root, so files must stay inside the folder.
- If you edited `index.jsx`, check the Übersicht console for errors
  (menu-bar icon → Debug / Show console).
