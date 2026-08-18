# StickyNotes

A [Vencord](https://github.com/Vencord/Vencord) userplugin that lets you add sticky notes to any Discord user. Notes are visible in the user popout and profile sidebar.

## Features

- Add sticky notes to any user via right-click context menu
- Rich text formatting: bold (`**text**`) and colored text (`[color:#hex]text[/color]`)
- White text on customizable colored backgrounds
- Choose colors from presets or enter custom hex values
- Edit and delete notes anytime
- Notes visible in user popout and profile sidebar
- Stored locally (client-side only — invisible to others)

## Installation

### Manual (Vencord UserPlugin)

1. Navigate to your Vencord userplugins directory:
   - **Windows:** `%APPDATA%/Vencord/userplugins/`
   - **Linux:** `~/.config/Vencord/userplugins/`
   - **macOS:** `~/Library/Application Support/Vencord/userplugins/`

2. Clone this repository into that directory:
   ```bash
   cd ~/.config/Vencord/userplugins/
   git clone https://github.com/vSake-clean/vencord-StickyNotes.git StickyNotes
   ```

3. Restart Discord (or Vesktop).

4. Go to **Vencord Settings → Plugins** and enable **StickyNotes**.

### Vesktop (Custom Vencord Build)

If you use Vesktop with a custom Vencord directory:

1. Clone into your Vencord source's `src/userplugins/` folder:
   ```bash
   cd ~/vencord-custom/vencord-src/src/userplugins/
   git clone https://github.com/vSake-clean/vencord-StickyNotes.git StickyNotes
   ```

2. Rebuild Vencord:
   ```bash
   cd ~/vencord-custom/vencord-src
   pnpm build
   ```

3. Copy build output to your Vesktop custom Vencord dir:
   ```bash
   cp dist/vencordDesktop{Main,Preload,Renderer}.{js,css} ~/.config/vesktop/customVencord/
   ```

4. Restart Vesktop.

## Usage

- **Add note:** Right-click a user → Sticky Notes → Add / Edit Note
- **Edit note:** Right-click the user again → Add / Edit Note (opens with existing note)
- **Delete note:** Right-click the user → Sticky Notes → Delete Note
- **View note:** Click on user avatar to open popout — note appears below profile info

### Text Formatting

Use these markers in your note text:

- `**bold text**` → **bold text**
- `[color:#ff0000]red text[/color]` → <span style="color:#ff0000">red text</span>

Or use the toolbar buttons in the modal:
1. Select text in the note
2. Click **Bold** or **Color** button
3. Pick a color with the color picker

## Files

| File | Description |
|------|-------------|
| `index.tsx` | Main plugin — patches, context menu, rendering |
| `data.ts` | Data layer — DataStore persistence, reactivity |
| `styles.css` | Modal, badge, and popout styles |
| `components/StickyNoteModal.tsx` | Modal with formatting toolbar |
| `components/StickyNoteBadge.tsx` | Badge component |

## Requirements

- [Vencord](https://github.com/Vencord/Vencord) (latest)

## License

GPL-3.0-or-later
