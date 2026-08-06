# Local data boundaries

- `data/database/`: SQLite will be the only authority for structured facts. It is not populated in milestone 1.
- `data/images/`, `data/audio/`, and `data/imports/`: immutable original evidence bytes. Originals are never overwritten. `data/audio/` is reserved for the deferred voice-capture adapter and remains empty in 0.1.
- `notes/`: derived, regenerable Obsidian-readable projections. It never writes facts back to SQLite.
- `cache/`: disposable derived files that may be deleted and rebuilt.
- `src/fixtures/`: synthetic development-only records. Every fixture carries `fixture: true`, is visibly labeled in the UI, and never enters SQLite, `data/`, `notes/`, or `cache/`.
