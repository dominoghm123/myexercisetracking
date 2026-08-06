# My Exercise Tracking — Implementation Handover

**Handover date:** 2026-08-06  
**Project:** `myexercisetracking`  
**Purpose:** Start the next implementation window with the approved product, UI, team, and delivery constraints already consolidated.

## 1. Current state

- The project directory was initially empty and has no implementation yet.
- Planning PRD/spec is complete and reviewed:
  - `docs/superpowers/specs/2026-08-06-my-exercise-tracking-mvp-design.md`
- Team/process design is complete:
  - `docs/superpowers/specs/2026-08-06-my-exercise-tracking-implementation-team-plan.md`
- No database, source images, external Calendar events, external AI calls, or generated health records have been created.
- The next window is authorized to begin implementation planning and the first local Web milestone, subject to the model-runtime note below.

## 2. Product north star

Private, local-first personal body-recomposition tracker. The primary outcome is lowering body-fat percentage while gaining muscle—not simple weight loss.

The local structured store and original images are authoritative. Obsidian Markdown/images/charts are derived readable projections. The desktop experience comes first; the domain model must remain usable by a future phone client.

## 3. Confirmed product scope

### MVP includes

- Manual workout entry and LeKe/coach screenshot/photo upload.
- Workout extraction candidates requiring user confirmation.
- Workout fields: extensible type, duration (no clock time for actual session), load/weight, sets, per-set repetitions, movement cues, completion.
- Initial workout taxonomy directions: cardio, strength training, stretching/mobility. The user's complete exercise/equipment list will be added as configuration later.
- Meal-photo upload with approximate ingredient, calorie, and macro ranges; uncertainty and lightweight confirmation/editing.
- Manual daily health: sleep, period start/end, in-period flag, short symptom note, subjective state, optional heart rate/blood oxygen/stress/outdoor activity.
- Body-composition records whenever a new report/measurement exists; no forced weekly cadence.
- Editable goal presets and custom numeric goals.
- Daily Markdown records plus on-demand weekly Dashboard/review.
- Local data, original images, backup package, restore instructions.
- Local Web app opened in a browser.
- Gated one-way Google Calendar projection after the local plan flow is stable.

### Explicitly deferred

- Calendar → App reading, conflict reconciliation, automatic rescheduling, and background sync.
- Xiaomi live/watch integration and LeKe APIs.
- App-hosted cloud backend, public/social features, payments, accounts, mobile UI, and live wearable linkage.
- Microphone recording and speech transcription. A deferred local-first voice-capture port is reserved for workout sets/load/repetitions, coaching cues, workout summaries, meal notes, and daily-health notes; transcripts remain `needs_review` until explicit confirmation.
- Medical diagnosis or automatic health/nutrition prescriptions.

## 4. Technical decisions

- SQLite is the structured source of truth.
- Original assets remain unchanged under project-local data storage.
- Suggested root layout:

```text
myexercisetracking/
├── data/database/my-exercise-tracking.sqlite3
├── data/images/{meals,training,body-composition}/YYYY/MM/
├── data/imports/
├── cache/
├── config/
├── backups/
├── notes/
│   ├── health data/daily records/YYYY/MM/YYYY-MM-DD.md
│   ├── health data/weekly reviews/YYYY/YYYY-Www.md
│   ├── health data/body-composition/YYYY-MM-DD.md
│   └── images/{meals,training,body-composition,charts}/
└── docs/superpowers/specs/
```

- The current project root under `BioCoding Projects` is intended to be opened as the Obsidian vault/root; `notes/` is the readable derived archive.
- Source data should stay on a local non-iCloud path. The Finder screenshot showed iCloud storage full; do not make health source data depend on iCloud sync.
- External AI is local by default. A user-enabled setting may permit external AI; credentials live in local secure configuration/environment storage and never in SQLite/Markdown.

## 5. Google Calendar boundary

The Calendar slice is feasible but gated after local planning works:

- Primary Google Calendar only in the first slice.
- App → Calendar only.
- Preview + explicit confirmation before every write batch.
- Store local plan-occurrence ↔ Google event ID mappings.
- Idempotent retry; update only events created by this app.
- Local plan cancellation does not delete the external event in MVP.
- Do not read Calendar-side edits or import them back.

Planned entities include `workout_plan`, `workout_plan_occurrence`, `calendar_connection`, and `calendar_event_link`. Actual workout records may omit clock time; planned occurrences need date, start time, timezone, and duration.

## 6. UI direction

Visual reference: [Open Breathwork & Meditation](https://o-p-e-n.com/). Use its calm, sparse, movement-oriented editorial language—not a pixel copy.

- Left collapsible sidebar: `Today Record`, `Dashboard`, `Plan`, `Review`, `Settings`.
- Default page: Today Record.
- Warm white/light gray surfaces, sage-green primary accent, coral/amber warnings.
- System sans stack: SF Pro / Inter / Noto Sans SC fallback.
- 12–16px medium radii; generous whitespace; no pill-heavy gamification.
- Today Record: left capture/review queue, right daily summary/recent records.
- Plan: weekly calendar + training list + lightweight Calendar sync state.
- Review: source image beside extracted fields; field-level and bulk confirmation.
- Dashboard: few large key numbers and limited charts; missing/low-confidence states are explicit.
- Desktop-first around 1180–1440px, responsive collapse from the first implementation.
- Obsidian output: readable callouts, tables, images, and a small number of charts without a complex plugin dependency.

## 7. Team and model assignment

- PM/lead: 5.6 Solo. Owns user communication, product decisions, dependencies, visual review, and final integration.
- Execution agents intended to be 5.6 Luna:
  - Foundation/domain
  - Capture/review
  - Visual screens
  - Obsidian/Calendar/backup
  - QA/evidence

Current runtime exposes `gpt-5.6-sol` and `gpt-5.6-terra`, but not `gpt-5.6-luna`. Do not silently substitute a fallback; ask the user before using another model.

## 8. Development workflow

1. PM freezes the next contract and acceptance slice.
2. Independent agents work in parallel only when they consume stable contracts and do not mutate another line's semantics.
3. Use synthetic fixtures until the user's real data batch arrives.
4. For every visual unit, render desktop and narrow screenshots.
5. Send screenshots to the user for visual review immediately; mark each unit `approved` or `needs changes`.
6. Only approved visual units enter final HTML assembly.
7. Run QA against fixtures, source provenance, missing data, error states, responsive layout, backup/restore, and privacy boundaries.

### Visual review order

1. Shell/sidebar + typography tokens
2. Today Record
3. Plan/week view + Calendar status
4. Workout/meal Review inbox
5. Dashboard
6. Settings/privacy/backup
7. Responsive, empty, and error states

## 9. First milestone

Build only a reviewable local shell:

- local Web app starts in a browser;
- sidebar and approved design tokens render;
- fixture-driven Today Record appears;
- one screenshot is sent to the user for visual review;
- no Calendar write and no external AI call.

Do not begin by implementing every screen or integration.

## 10. User data intake request

Ask the user for one batch when ready:

- complete exercise/equipment list grouped into cardio, strength, stretching/mobility;
- representative LeKe/coach screenshots;
- preferred units and any naming conventions;
- representative meal photos/context if available;
- body-composition report/images, including August 5 baseline;
- exact local project/Obsidian path confirmation;
- Google account/Calendar confirmation only when Calendar slice begins;
- 3–5 Open reference screenshots only if pixel-level visual matching is desired.

Preserve originals, assign hashes/asset IDs, and never promote AI/OCR candidates without user confirmation.

## 11. Handover completion criteria

The new implementation window should first reply with:

- whether Luna runtime is available;
- the selected first milestone;
- the first contract/schema files it will create;
- the first screenshot review checkpoint;
- the exact user-data batch it needs next;
- any conflict between the handover and the user's latest instruction.
