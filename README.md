# Sticky Notes Plugin for Vencord

Add sticky notes to Discord users!

## Features

- **Add notes** to any user via right-click context menu
- **Choose colors** from presets or custom hex
- **Format text** with bold and colored words
- **Edit & delete** notes anytime
- **View notes** in user popout and profile sidebar
- **Local storage** via DataStore (not localStorage)

## Text Formatting

Use these markers in your note text:

- `**bold text**` → **bold text**
- `[color:#ff0000]red text[/color]` → red text

Or use the toolbar buttons:
1. Select text in the note
2. Click **Bold** or **Color** button
3. Pick a color with the color picker

## Installation

1. Copy `StickyNotes` folder to `vencord-src/src/userplugins/`
2. Build Vencord: `pnpm build`
3. Restart Discord/Vesktop

## Usage

1. Right-click on a user
2. Select "Sticky Notes" → "Add / Edit Note"
3. Write your note, choose formatting and color
4. Click Save

The note appears in the user's popout and profile sidebar.

## File Structure

```
StickyNotes/
├── index.tsx              # Main plugin file
├── data.ts                # Data layer (DataStore)
├── styles.css             # CSS styles
├── README.md              # This file
└── components/
    ├── StickyNoteModal.tsx  # Modal with formatting toolbar
    └── StickyNoteBadge.tsx  # Badge component
```

## License

GPL-3.0-or-later
