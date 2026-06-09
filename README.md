# Asfale Notes

Your notes. Private. Always.

Asfale is a note-taking app built around a simple idea: your notes belong to you. Not a cloud provider, not a corporation. You.

Every note you write is encrypted on your device before it goes anywhere. When you sync between your phone and laptop, only encrypted data travels between them. Not even we can read your notes.

No account. No email. No password. Just a recovery phrase you write down and keep safe — that's your key.

## Features

- End-to-end encrypted notes
- Cross-device sync via InstantDB
- Full offline support
- Organize with colors, tags, and pinning
- Full-text search across all notes
- Archive and trash management
- PIN-locked recovery phrase access
- Grid, list, and detailed view modes
- Light and dark mode
- Installable as a PWA on mobile and desktop

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS
- **Storage:** Dexie.js (IndexedDB) for local persistence
- **Sync:** InstantDB for cross-device sync
- **Cryptography:** Web Crypto API (AES-GCM)
- **State:** Zustand

## Getting Started

```bash
npm install
npm run dev
```

### Sync Setup

To enable sync across devices, add your InstantDB app ID to the `.env` file:

```
VITE_INSTANTDB_APP_ID=your-app-id
```

Without this, everything still works — just locally.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint source code |

## License

Asfale Notes is released under the [Asfale Notes Non-Commercial License v1.0](LICENSE).

This means you are free to use, modify, and share the software for personal and educational purposes, but commercial use requires a separate agreement.
