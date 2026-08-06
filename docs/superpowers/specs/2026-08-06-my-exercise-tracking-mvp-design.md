# My Exercise Tracking — Local-First MVP Product Specification

**Status:** Planning draft for user review  
**Date:** 2026-08-06  
**Delivery target:** A fast, reviewable MVP covering roughly 60–70% of the intended product  
**Implementation status:** Not started; this document does not authorize implementation

## 1. Decision status

### Confirmed user decisions

- This is a private tracker for the user first and perhaps a few friends later, not a mass-market product.
- The primary outcome is body recomposition: lower body-fat percentage while gaining muscle. Weight loss alone is not the goal.
- Structured data and original images live locally on the user's computer and are the source of truth.
- Obsidian Markdown, images, tables, and charts are a generated readable archive, not the authoritative database.
- The initial experience is local desktop. The architecture must allow a later phone app and computer sync without replacing the data model.
- MVP inputs include workout review, meal photos, manual daily health details, body-composition records, and weekly/daily Obsidian output.
- OCR or AI-extracted workout values require user confirmation before becoming confirmed records.
- Meal analysis is approximate, shows uncertainty, and has a lightweight user confirmation/edit step.
- Image analysis defaults to local processing. External AI may be used only after an explicit opt-in for the applicable image analysis; the product must make the transmission visible.
- External AI consent is a one-time user setting that is off by default; when enabled, each analysis still shows the external-processing state and image scope, and the user can revoke the setting.
- Weekly Dashboard generation is on demand (open or click “Generate this week's review”), with no MVP background scheduler.
- MVP menstrual tracking records only period start/end, whether the day is in-period, and a short symptom note; flow ratings, prediction, and reminders are deferred.
- Daily capture uses a hybrid review model: save workouts/meals immediately as `needs_review`, allow immediate confirmation, and collect unfinished items in an evening review inbox.
- The project exposes an Obsidian-readable `notes/` tree while keeping `data`, `cache`, and other operational folders clearly separated; the canonical source root stays in its current project location.
- The canonical project root remains in its current `BioCoding Projects` location alongside the other Web Coding projects; the exact Obsidian vault linkage is a deployment/configuration detail, not a reason to move the source project.
- The MVP is a local Web application with a browser UI backed by local structured files/database, keeping the domain layer reusable for a future phone client.
- Workout records use an extensible exercise-type selector and record duration (not clock time), weight/load, sets and per-set repetitions, movement cues, and completion status.
- Training display uses only metrics actually available from the source; no additional synthetic training score is required.
- The user can edit numeric goals or choose presets; the system displays trends against the selected goal and does not auto-prescribe goals from the baseline.
- Body-composition records are event-driven: record a new report/measurement when available, without forcing a weekly cadence.
- MVP UI is single-user while the data model retains `profile_id`.
- MVP provides a manual local snapshot/export and recovery instructions.
- Obsidian integration uses option A: the project root remains in its current `BioCoding Projects` location and is opened as the Obsidian vault/root; `notes/` is the readable derived archive while `data/`, `cache/`, and `config/` remain visible as structured project folders.
- Initial workout-type taxonomy has three top-level directions: cardio, strength training, and stretching/mobility. The user's recent class exercise/equipment list will be added later as an extensible configuration rather than invented now.
- Each workout item stores per-set rows with repetitions and load/weight where available.
- Goal presets are editable neutral presets; the user may change their numeric values.
- Backups are local packages containing the database, original images, Markdown, configuration snapshot, and manifest, with recovery instructions.
- External AI credentials use local secure credential/environment configuration; keys never enter SQLite or Markdown.
- The desktop MVP runs as a local Web application opened in a browser.
- Authoritative project data stays on a local non-iCloud path; any Obsidian or backup synchronization is separately configured.
- A scoped Google Calendar integration may be included in MVP: App-created workout-plan events are written one way to the user's primary Google Calendar, and later App-side plan/status changes update those linked events. Calendar-to-App reads and reconciliation are deferred.
- Xiaomi Health/watch live integration, LeKe APIs, an app-hosted cloud backend/sync service, social features, payments, accounts, and a real-time phone app are outside MVP. The explicitly scoped Google Calendar API projection and user-opted-in external AI are exceptions, not an app backend.
- Later phases proceed in this order: Xiaomi Health export import, phone app with computer sync, then possible real-time watch linkage.

### Planning assumptions

- A local SQLite database is the best initial structured source of truth: it is portable, transactional, queryable, and usable by both desktop and later mobile clients.
- Original uploaded images are retained unchanged; derived thumbnails, OCR text, AI estimates, charts, and Markdown can be regenerated.
- One local profile is sufficient for MVP. Supporting a few friends later means separable local profiles, not authentication or cloud accounts.
- The user's 9:00 a.m. training routine is contextual information, not enough justification for an MVP reminder system.
- Charts will be exported as ordinary image files referenced by Markdown, avoiding reliance on a specific Obsidian plugin.
- The Obsidian connection target is the project `notes/` tree; source files remain project-relative under the current `BioCoding Projects` path.

### Open questions (non-blocking for this planning spec)

1. What is the exact local path of the project root that will be opened as the Obsidian vault? **Resolved direction: current `BioCoding Projects/myexercisetracking` root; exact absolute path is an implementation setup value.**
2. Which workout values consistently appear in LeKe/coach screenshots beyond the required fields? **Resolved MVP minimum: extensible type, duration, load, sets/reps, movement cues, completion.**
3. Are menstrual-cycle details limited to period start/end and symptoms, or should flow intensity also be recorded? **Resolved: period start/end, in-period flag, and short symptom note only.**

These questions affect configuration and field detail, not the core architecture.

## 2. Product positioning

My Exercise Tracking is a local, evidence-oriented personal body-recomposition journal. It combines training evidence, meal photos, recovery signals, and periodic body-composition measurements into a weekly view that helps the user answer:

> Am I consistently training, eating enough protein, and recovering in a way that is moving fat and muscle trends in the intended directions?

It is not a medical device, diagnostic tool, calorie prescription service, or substitute for a clinician or qualified coach. Body-composition measurements and AI meal estimates are imperfect; the product presents trends and uncertainty rather than false precision.

## 3. Baseline and dashboard priorities

The August 5, 2026 body-composition report is the initial personal planning baseline:

| Metric | Baseline | Dashboard role |
|---|---:|---|
| Body-fat percentage | 28.7% | Primary trend |
| Fat mass | 15 kg | Primary trend |
| Skeletal muscle | 20 kg | Primary trend |
| Waist–hip ratio | 0.77 | Primary trend when measured |
| Weight | 52.5 kg | Secondary context only |
| BMI | 18.6 | Reference context only |
| Body water | 27.1 kg | Recovery/body-composition context |
| BMR | 1,179 kcal | Reference estimate, not a calorie prescription |

The source report labels body fat high and skeletal muscle, body water, and BMR low. The tracker stores that wording as source-report context, not as a diagnosis. It does not infer numeric targets from this single report.

The weekly dashboard should prioritize:

1. body-fat percentage and fat mass trends;
2. skeletal-muscle trend;
3. waist–hip-ratio trend;
4. training completion and load/volume trend;
5. protein estimate and confidence/coverage;
6. sleep duration and subjective recovery;
7. weight as secondary context;
8. optional heart rate, blood oxygen, stress, period, and outdoor-exercise context when recorded.

Every aggregate must expose its coverage (for example, “protein recorded 5/7 days”) so missing data is not interpreted as zero.

## 4. Non-goals

The MVP will not:

- diagnose health conditions or generate medical advice;
- prescribe aggressive weight loss or fixed calorie targets from the baseline;
- automatically accept OCR or AI estimates as facts;
- connect live to Xiaomi, LeKe, or any wearable API;
- provide cloud backup or multi-device real-time sync;
- provide a social feed, public sharing, coaching marketplace, payment flow, or complex accounts;
- optimize for growth, engagement streak pressure, or gamification;
- build a mobile UI or reminder service;
- attempt comprehensive nutrition micronutrient analysis.

## 5. Target workflow

### Daily capture

1. **Workout:** After training, the user manually enters a summary or uploads LeKe/coach screenshots or photos.
2. **Review extraction:** The system proposes extracted workout fields with links to the source image. Unclear fields are highlighted; nothing is confirmed automatically. The user may confirm now or leave the item in the review inbox.
3. **Meal:** The user uploads a meal photo. The system proposes ingredients, portion ranges, calories, protein, carbohydrates, and fat.
4. **Light confirmation:** The user accepts, edits, removes, or marks unknown items. A quick path should take only a few taps/clicks when the estimate looks reasonable; deferring keeps it visibly `needs_review`.
5. **Daily health:** The user manually records sleep, period information, subjective energy/soreness/mood or recovery, plus optional heart rate, blood oxygen, stress, and outdoor exercise.
6. **Evening inbox and daily archive:** Any unfinished workout, meal, or health item is collected into one review inbox. A daily Markdown page is regenerated from confirmed data; provisional estimates remain visibly labeled.

### Weekly review

1. The user opens the weekly review or clicks “Generate this week's review”; the system computes the week's metric summaries and comparison with prior available weeks.
2. It generates trend-chart images and an image-rich Markdown review.
3. The review separates observations from interpretation: what was recorded, what appears to be changing, and where evidence is insufficient.
4. The user can open the review in Obsidian and inspect linked daily pages and source images.

### Daily record versus weekly file

The MVP keeps **one regenerated daily record per day** as the canonical readable projection of that day's events. A single weekly Markdown file is useful as a review surface, but should contain links and summaries rather than become the only place where daily facts live. This preserves small pages, reliable regeneration after edits, direct source-image links, and future phone-sync boundaries. The weekly review is therefore an image-rich dashboard/index; it may embed compact daily summaries, but it does not replace the daily records.

## 6. MVP scope: the useful 60–70%

### Included

- One local profile and profile-ready identifiers in the schema.
- Manual workout entry plus screenshot/photo upload.
- OCR/AI-assisted workout extraction, field-level confidence, source provenance, and confirmation/editing.
- Meal-photo upload and approximate ingredient/macronutrient/calorie ranges.
- Lightweight meal confirmation with explicit uncertainty and an “unknown” path.
- Manual daily health form: sleep, period, subjective state, and optional sensor/outdoor values.
- Manual body-composition entry and archival of source reports/images.
- Daily and weekly Obsidian Markdown generation.
- Exported summary tables, metric cards/callouts, image galleries, and basic trend charts.
- Local database, original media storage, derived artifacts, validation, and backup/export instructions.
- Missing-data and conflict handling sufficient for trustworthy personal use.

### Deferred to reach the remaining product

- Automated import of Xiaomi Health exports.
- Phone capture client and computer sync protocol implementation.
- Live wearable connections and passive background capture.
- Microphone recording, local/external speech transcription, and voice-to-structured-field parsing. The interface is reserved post-0.1; original audio is immutable evidence and every transcript/parsed value requires user review.
- Advanced coaching recommendations, adaptive goals, exercise programming, micronutrients, or predictive analytics.
- Multi-person UI, permissions, or account management.
- Scheduled 9:00 a.m. reminders; revisit only if manual routine adherence shows a real need.
- Full two-way Google Calendar sync, importing user-edited Calendar events, conflict reconciliation, and automatic schedule inference.

## 7. Local-first, mobile-ready architecture

The architecture uses four boundaries:

1. **Capture adapters** accept manual forms, images, and later imported files. They produce candidate records, never final facts.
2. **Review/confirmation service** preserves candidate values, confidence, provenance, and user corrections. Only the user can promote uncertain input to confirmed status.
3. **Local domain store** holds stable, device-independent records in SQLite and immutable original media on disk. Each record has a UUID, profile ID, timestamps, status, source, and schema version.
4. **Projection/export service** reads confirmed/provisional domain data and regenerates Obsidian Markdown, chart images, and summaries inside the project root's `notes/` tree. Generated output never writes facts back into the source store.

This boundary keeps future mobile work narrow: the phone uses the same domain schema and capture rules, while a later sync layer exchanges versioned records and media. UI-specific fields and absolute filesystem paths must not be stored as domain facts. Sync conflict behavior is designed later; MVP only ensures stable IDs, timestamps, and revision metadata exist.

## 7A. Google Calendar integration assessment

### Feasibility and MVP recommendation

This is feasible as a **gated MVP integration slice** after the core local flow passes review. It is deliberately scoped to **one-way App → Google Calendar writing**:

1. The user creates and edits a workout plan in the local app.
2. The app shows a preview/diff of events that will be created or updated.
3. After explicit confirmation, OAuth authorizes the app to create/edit events on the selected calendar.
4. The app writes events and stores the returned Google event ID, calendar ID, last synced local revision, and sync status locally.
5. A later manual “Sync to Google Calendar” action creates missing events and updates only events linked to this app.
6. Completion/status changes made inside the app update the linked event title/description or a defined status field. The app does not read Calendar changes back.

Google's Calendar API provides an `events.insert` method for creating events and supports event updates. The narrow `calendar.events` OAuth scope grants viewing/editing events on calendars the user can access; the app should not request broad calendar read scopes for this one-way flow. If the app later becomes public for friends, OAuth consent-screen and verification requirements become a release concern.

### MVP boundary

Include:

- the primary Google Calendar in the first slice; a later slice can add calendar-list selection (avoiding a broader calendar-list read scope now);
- manual sync and explicit preview/confirm before writes;
- single events first; recurring workout-plan events only when timezone and recurrence identity are represented safely;
- local mapping from plan occurrence to Google event ID;
- idempotent create/update behavior and a retryable failure state;
- an app-owned marker in event metadata/description so the app only updates events it created;
- disconnect/revoke controls that stop future writes without deleting existing Calendar events;
- canceling a local plan marks its linked event canceled in the local sync record and leaves the Google event untouched unless a future explicit-delete action is added.

Defer:

- importing Calendar events or edits back into the app;
- detecting conflicts caused by Calendar-side edits;
- free/busy checks, automatic rescheduling, attendee management, and invitation workflows;
- automatic background sync or notification-driven sync;
- multi-account/multi-calendar orchestration.

### Data additions

Add local `workout_plan` and `workout_plan_occurrence` records (scheduled date, start time, timezone, duration, type, status, recurrence identity when applicable), a `calendar_connection` record (provider, account label, target calendar ID, token reference, enabled state, consent timestamp), and a `calendar_event_link` record (local occurrence ID, Google calendar ID, Google event ID, last synced local revision, last sync result, error). OAuth refresh tokens must be stored outside SQLite/Markdown using the local secure credential mechanism chosen for external AI keys.

### Safety and acceptance additions

- No Calendar write occurs without a visible preview and explicit confirmation.
- The app never deletes or modifies an event it cannot prove it created.
- Repeating sync with no local changes produces no duplicate events.
- A failed write preserves the local plan and exposes a retryable error.
- Disconnecting leaves existing Google events untouched unless the user separately requests deletion in a future scoped feature.
- The app clearly labels Calendar state as an external projection, not the local source of truth.

## 8. Proposed data model

Core entities:

| Entity | Purpose | Important fields |
|---|---|---|
| `profile` | Separates the user's data from possible future friends | ID, display name, timezone, units |
| `source_asset` | Original screenshot/photo/report | ID, media type, relative path, hash, capture time, import time, source app |
| `extraction_run` | Records OCR/AI processing without overwriting history | asset ID, model/tool, prompt/schema version, raw result, created time |
| `candidate_value` | Field-level proposed value | entity type/ID, field, value/range, unit, confidence, evidence region, status |
| `workout_session` | Confirmed or draft training event | calendar date, duration, extensible type, completion, notes, source, review status |
| `workout_item` | Exercise-level details when available | exercise, sets, per-set reps, load, movement cues |
| `workout_plan` | User-authored future training plan | title, target type, default duration, status, goal link |
| `workout_plan_occurrence` | A scheduled plan instance | date, start time, timezone, duration, recurrence identity, sync status |
| `meal` | Meal event linked to photos | time, label, notes, review status |
| `meal_component` | Ingredient/portion estimate | ingredient, portion range, kcal/protein/carb/fat ranges, confidence, user edits |
| `daily_health` | One profile/day health summary | sleep, period start/end, in-period flag, symptom note, energy, soreness, mood/recovery, optional sensor values |
| `body_composition` | Periodic measured snapshot | weight, body fat, fat mass, muscle, WHR, water, BMR, BMI, device/source |
| `goal` | User-editable target or preset | metric, target value/range, unit, start/end, preset or custom |
| `outdoor_activity` | Optional manually recorded activity | type, duration, distance, intensity, source |
| `record_revision` | Auditable user corrections | entity ID, changed fields, previous/new values, time, actor=`user` |
| `export_run` | Tracks derived archive generation | date range, output root, schema/template version, result/errors |

Common record states are `draft`, `needs_review`, `confirmed`, `completed`, `skipped`, `canceled`, and `rejected`. Workout duration is stored in minutes; load is stored per set with an explicit unit; repetitions are integer counts per set. A missing value is `null/unknown`, never zero. Estimates may be stored as a range plus a representative midpoint for charts, but the UI and Markdown must preserve the range and confidence.

Training load should use the strongest available evidence:

- resistance work: session completion, exercise count, sets/reps, and load-derived volume when available;
- cardio/outdoor work: duration, distance, or intensity when available;
- if only a screenshot summary exists, show the captured metrics without manufacturing a universal score.

## 9. Proposed directory layout

The following is a design only; these folders are not created by this spec:

```text
myexercisetracking/
├── data/                                          # authoritative local data and original evidence
│   ├── database/my-exercise-tracking.sqlite3       # structured source of truth
│   ├── images/
│   │   ├── meals/YYYY/MM/                           # original meal images
│   │   ├── training/YYYY/MM/                        # original training images
│   │   └── body-composition/YYYY/MM/                # original report images
│   └── imports/                                     # retained original export files later
├── cache/                                           # disposable thumbnails, OCR/AI cache, chart intermediates
├── config/                                          # non-secret preferences and schema settings
├── backups/                                         # documented local snapshots; retention TBD
├── notes/                                           # Obsidian-readable derived archive
│   └── health data/
│       ├── daily records/YYYY/MM/YYYY-MM-DD.md
│       ├── weekly reviews/YYYY/YYYY-Www.md
│       └── body-composition/YYYY-MM-DD.md
└── docs/
    └── superpowers/specs/                           # product/design documents
```

`notes/` is the Obsidian-readable derived archive under the project root, which is the selected Obsidian vault/root. The source database and originals stay in `data/`; `cache/` may be safely deleted and rebuilt. Generated content is:

```text
notes/
├── health data/
│   ├── daily records/YYYY/MM/YYYY-MM-DD.md
│   ├── weekly reviews/YYYY/YYYY-Www.md
│   └── body-composition/YYYY-MM-DD.md
└── images/
    ├── meals/YYYY/MM/                               # derived archive copies or links
    ├── training/YYYY/MM/
    ├── body-composition/YYYY/MM/
    └── charts/YYYY/
```

All database, cache, note, and image paths are project-relative. Notes use relative links. Archive images under `notes/images/` are derived copies (or links where supported) verified against the source hash; deleting them never deletes originals under `data/images/`.

## 10. AI estimation, uncertainty, and confirmation

### Workout extraction

- Preserve the original image and its hash before processing.
- Display extracted values beside the source image, grouped by confidence.
- Mark unreadable, conflicting, or unit-ambiguous values as needing review.
- Require confirmation of each materially used metric, with bulk accept only for clearly presented fields.
- Retain the proposed value and user-corrected value for auditability.
- Never infer an exercise, load, set, or completion that is not supported by the image or user input.

### Meal estimation

- Identify visible ingredients and explicitly list uncertain/possibly hidden ingredients such as oil or sauce.
- Estimate portions as ranges, not exact grams, when scale is unclear.
- Return calorie and macronutrient ranges with per-component confidence (`high`, `medium`, `low`) and an overall confidence note.
- Ask one lightweight review: confirm meal, edit components/portion, or keep as rough estimate.
- Allow “unknown portion” and “unrecognized item”; do not force false precision.
- Weekly protein and calorie summaries distinguish confirmed, rough, and missing meals and show recorded-day coverage.
- AI estimates are informational. The system does not issue dietary prescriptions from them.

Image analysis defaults to local processing. The user may explicitly enable external AI once in settings; it is off by default. When enabled, each analysis visibly states that external processing is active and which images will be sent. The user can revoke the setting at any time. The interface must state what is sent, to whom, and whether the provider retains it; the resulting record stores the processing route. A local-only path remains available even if its accuracy is lower.

## 11. Obsidian outputs

### Daily record

- date and overall completion status;
- workout summary and linked evidence images;
- meal gallery with confirmed/estimated macro ranges;
- sleep, period, subjective recovery, and optional health details;
- body-composition measurement if one exists;
- visible missing/needs-review items;
- provenance footer with export time and source record IDs.

### Weekly dashboard

- compact metric table/cards for body fat, fat mass, skeletal muscle, WHR, training, protein, sleep, and secondary weight;
- comparison with the previous available week or baseline, without implying a trend from one point;
- 4–8 week charts when enough data exists;
- training completion/load summary;
- meal/protein and sleep coverage;
- period/recovery context shown carefully, without causal claims;
- a small image gallery from meals and training;
- sections labeled `Confirmed observations`, `Interpretation`, and `Data gaps`.

Charts should use normal PNG or SVG files and accessible tables so the archive remains readable without community plugins. “No data” and “not enough points” are valid output states.

## 12. Privacy, integrity, and error handling

- Default to local processing and storage. No telemetry or background upload in MVP.
- Exclude the database, personal media, exports, and secrets from version control if Git is later initialized.
- Provide a clear local backup/restore procedure before calling the MVP complete.
- Use hashes to detect duplicate or changed source assets; never silently overwrite originals.
- Failed OCR/AI processing leaves the asset available for manual entry and retry.
- Unsupported or corrupt images show a recoverable error and remain unlinked until resolved.
- Unit ambiguity blocks confirmation; the user must choose or edit the unit.
- Duplicate workout/meal warnings compare timestamps and image hashes but never auto-delete.
- Partial days and skipped fields remain missing, not zero.
- Editing a confirmed record creates a revision and triggers regeneration of affected daily/weekly exports.
- If export fails, source data remains intact and the last successful archive is not deleted.
- Body-composition anomalies are displayed as possible measurement/device variation, not a diagnosis.

## 13. Acceptance criteria

The MVP is reviewable when all of the following are demonstrably true:

1. A user can create a workout manually and from at least one representative LeKe/coach image.
2. Extracted workout fields show their source and review state and cannot enter confirmed summaries without user confirmation; a representative user-supplied screenshot fixture verifies type, duration, load, per-set reps, cues, and completion when those values are visible.
3. A user can upload a meal photo, receive ingredient and macro/calorie ranges with uncertainty, and confirm or edit them quickly.
4. Unknown portions and failed recognition can be saved honestly without fabricated precision.
5. A user can record sleep, period, subjective status, and optional heart rate/blood oxygen/stress/outdoor activity for a day.
6. A user can enter the August 5 baseline body-composition values and attach the source report.
7. The dashboard prioritizes recomposition metrics and treats weight as secondary.
8. A user can select an editable goal preset or create/edit a numeric goal, and the dashboard shows trend context against that goal without auto-prescribing it.
9. Weekly aggregates display coverage and do not convert missing values to zero.
10. Daily and weekly Markdown pages render in Obsidian with working relative image links and readable no-plugin tables/charts.
11. The project root is visible as the Obsidian vault with readable `notes/`, while authoritative records and original images remain in clearly separated local storage; deleting generated notes/images does not delete source data and the archive can be regenerated.
12. Re-running export is idempotent for unchanged source data and does not duplicate sections or assets.
13. AI/OCR failure, duplicate upload, corrupt media, unit ambiguity, and export failure each have a recoverable path.
14. A single backup package contains SQLite, original images, Markdown, configuration snapshot, and manifest; restore reproduces confirmed records and source-image hashes on a disposable copy.
15. No app-hosted cloud backend, public/social, payment, account, mobile, or reminder functionality is required to pass core MVP acceptance; the scoped Calendar API slice is separately gated.
16. Image analysis uses the local path by default; external AI is unavailable until the user enables the setting, every external analysis shows its scope, and the record indicates which route processed it.
17. If the Calendar slice is enabled, the app previews and explicitly confirms one-way writes, stores local event mappings, is idempotent on retry, and never imports or overwrites Calendar-side events.
18. The local Web application can be started and opened in a browser without an app-hosted cloud backend.
19. External AI credentials are loaded from local secure configuration/environment storage and never written to SQLite or Markdown.
20. The project source data can remain on a non-iCloud local path while the project root is opened in Obsidian.

## 14. Phased roadmap

### Phase 0 — Current planning gate

Approve this specification, resolve the AI/privacy choice and Obsidian path, collect representative screenshots/photos, and define implementation slices. No feature implementation is authorized by this document.

### Phase 1 — Local desktop MVP (this spec)

Deliver local structured storage, manual and image-assisted capture, explicit review, daily/weekly Obsidian projections, and reliable backup/restore. The scoped one-way Google Calendar projection is an MVP integration slice to enable after the core local flow passes review; it remains gated by OAuth setup and the user's explicit sync confirmation.

### Phase 2 — Xiaomi Health export import

Add user-initiated import of documented Xiaomi export files through a new capture adapter. Preserve raw files, map units/fields visibly, detect duplicates, and require review of ambiguous mappings.

### Phase 3 — Phone capture and computer sync

Add a focused phone client for in-the-moment meals, workouts, and daily status. Sync versioned domain records and media to the computer with explicit conflict handling. The computer/local archive remains controllable by the user.

### Phase 4 — Possible real-time wearable linkage

Only after export import and sync are stable, evaluate live watch linkage against privacy, reliability, battery, API availability, and actual user value.

## 15. Quick review checklist

- [ ] Does the priority order reflect body recomposition rather than weight loss?
- [ ] Are the proposed daily and weekly workflows light enough to sustain?
- [ ] Is SQLite plus original local media acceptable as the source of truth?
- [x] The project `notes/` tree is the direct Obsidian connection target; exact path is an implementation setup value.
- [ ] Is the scoped one-way Google Calendar projection enabled for the first implementation slice?
- [ ] Are the useful fields in real LeKe/coach screenshots represented?
- [x] Image analysis defaults to local; external AI is enabled only through an explicit, revocable setting and shows scope at analysis time.
- [ ] Are meal estimate ranges and confirmation honest but still convenient?
- [x] Weekly Dashboard is generated on demand; no MVP background scheduler is required.
- [x] Project source data remains on a non-iCloud local path.
- [ ] Are any MVP items unnecessary for the first reviewable release?
- [ ] Are the non-goals and phase order correct?
- [ ] After approval, should implementation planning proceed as small vertical slices?

## 16. UI/UX direction (Grill Me decisions)

### Confirmed UI decisions

- Primary shell uses a left sidebar: `Dashboard`, `Plan`, `Record`, `Review`, and `Settings`.
- The default landing view is **Today Record**, so the user can continue unfinished capture immediately.
- The visual language is spacious editorial: warm white/light gray surfaces, restrained cards, generous whitespace, and one soft accent color. It should feel personal and calm rather than clinical or gamified.
- The Plan surface uses a weekly calendar view with a related training list.
- Workout entry starts with an extensible workout type, then shows action rows with addable per-set inputs.
- Review uses an inbox queue: source image on the left, candidate fields and confirm/edit actions on the right.
- Record states use soft labeled badges: `Draft`, `Needs review`, `Confirmed`, `Completed`, `Skipped`.
- Dashboard charts are limited to the key recomposition and adherence metrics; the product will not turn every available field into a chart.
- Goals appear near the top of Dashboard, with trend context against the selected editable preset/custom goal.
- Google Calendar appears as a sync action and status inside Plan, not as a separate primary destination.
- Obsidian output uses readable Markdown callouts, tables, images, and a small number of charts without requiring a complex plugin stack.
- The layout is desktop-first but responsive from the first implementation so two-column review and plan surfaces can collapse into one column later.
- UI typography uses a system sans stack with CJK fallback: `-apple-system`, `SF Pro Display/Text`, `Inter`, `Noto Sans SC`, then `sans-serif`.
- UI color direction uses warm white/light gray surfaces, sage green as the primary accent, and coral/amber for warnings and review states.
- Cards and controls use medium 12–16px radii; the system avoids pill-heavy, game-like decoration.
- The desktop sidebar is fixed by default but collapsible; at narrow widths it becomes a drawer/bottom navigation pattern.
- Today Record uses a two-column desktop composition: left capture/review queue, right daily summary and recent records.
- Review supports field-level confirmation and bulk confirmation within one source image, while preserving provenance.
- Key numbers use a large type scale with quiet labels/units and small supporting trend visuals.
- Empty states explain what is missing and offer a next action rather than showing blank panels.
- Plan shows a lightweight Calendar sync status at the top, with deeper details available on demand.
- The preferred desktop content width is approximately 1180–1440px with a readable max-width rather than infinite stretching.
- Mobbin is used as a pattern and component-state reference, not a pixel-level copy target.
- The primary visual reference is Open Breathwork & Meditation: https://o-p-e-n.com/ . Its observable principles are restrained navigation, generous whitespace, clear mode/category separation, and a calm movement-oriented editorial tone. The earlier Mobbin link may remain a secondary reference for component states, but is not required for implementation.

### Proposed first-pass page map

```text
App shell
├── Sidebar
│   ├── Today Record (default)
│   ├── Dashboard
│   ├── Plan
│   ├── Review
│   └── Settings
└── Main content
    ├── Today Record: capture queue + today's confirmed summary
    ├── Dashboard: weekly recomposition overview
    ├── Plan: week calendar + workout plan list + Calendar sync status
    ├── Review: image/evidence queue + field confirmation
    └── Settings: profile, goals, AI privacy, backups, integrations
```

### UI constraints

- The interface must preserve the distinction between an unfinished capture and a confirmed fact.
- Images are evidence and should remain visually close to the fields they support.
- Cards are containers for hierarchy, not a substitute for every row or field.
- Empty, missing, and low-confidence states must be designed as first-class states.
- The implementation must keep typography, spacing, color tokens, and component states in one replaceable design layer so a later Mobbin-informed refinement does not rewrite domain logic.

### UI decisions still to confirm before implementation polish

1. Exact font family and fallback stack.
2. Accent color and semantic status colors.
3. Sidebar width, card radius, and spacing scale.
4. Whether Today Record opens as a compact capture inbox or a richer daily timeline.
5. Which three Open pages or screenshots should define the final component reference if pixel-level matching is desired; the homepage is sufficient for the first-pass visual language.

### UI implementation guardrails

- Keep typography, spacing, radius, color, shadow, and state tokens in one replaceable design layer.
- Define states for loading, empty, missing, needs-review, confirmed, completed, skipped, failed, and disconnected integrations before styling individual pages.
- Use one primary action per surface: `继续记录`, `确认`, `生成本周回顾`, or `同步到 Google Calendar` depending on context.
- Keep the source image and extracted fields in the same visual frame on review surfaces.
- Use CSS responsive breakpoints to collapse two-column layouts without changing domain components or record semantics.
- Keep all visual imitation subordinate to the product's local-first privacy, confirmation, and evidence rules.

### Open reference translation

The Open site is a mindfulness studio rather than a tracker, so only its visual language transfers:

- Keep primary navigation sparse and confident; avoid exposing every data entity as a top-level menu item.
- Use meaningful mode separation for `Today`, `Plan`, `Record`, and `Review`, analogous to the site's clear digital/in-person split.
- Prefer short, editorial labels and generous whitespace over dashboard chrome.
- Let movement imagery and training/meal evidence provide warmth, while metrics remain quiet supporting information.
- Use the calm tone as a visual counterweight to uncertainty states; a `Needs review` record should feel actionable, not alarming.
