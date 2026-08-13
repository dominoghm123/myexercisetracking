# My Exercise Tracking — Product & Technical Specification v0.2

**Status:** Draft for user review  
**Date:** 2026-08-14  
**Implementation status:** Not authorized until this specification is approved  
**Primary user:** Single private user; future multi-profile support remains a data-model concern, not an MVP account feature

## 1. Purpose and product outcome

My Exercise Tracking is a private, evidence-oriented body-recomposition journal. It helps the user understand whether training, nutrition, recovery, and body-composition trends are moving in the intended direction: lower body-fat percentage while preserving or gaining muscle.

The product is not a medical device, diagnostic service, calorie-prescription service, or replacement for a clinician or coach. AI outputs are estimates and interpretations. Confirmed user records and original evidence remain more authoritative than any model output.

This specification extends MVP 0.1 with a stable foundation for:

- Chinese/English UI switching;
- manual strength-training records using a reusable equipment catalog;
- Xiaomi exercise-health data as a future Android-side source for cardio and health signals;
- general image evidence, not only meal photos;
- weekly Tuesday body-composition records entered manually first;
- deferred voice input and DeepSeek/provider integrations;
- AI-assisted weekly and monthly reports in a later v0.0.2 capability slice;
- Android APK after the web client is deployed and its contracts are stable.

## 2. Confirmed scope decisions

### 2.1 Leke / Le刻

The product does not directly connect to the Le刻运动 app in the current roadmap. Le刻 is treated as the user's training context. The user records each private-training session manually, optionally attaching screenshots, coaching notes, or body images.

If a reliable, authorized export becomes available later, it may enter through a generic file-import adapter. It must follow the same candidate → review → confirmation flow as every other import.

### 2.2 Cardio and Xiaomi data

Running-machine and other cardio signals may later be read from Xiaomi运动健康 through an Android adapter, preferably via a supported system health bridge such as Health Connect where available. The web MVP does not assume live access and continues to support manual entry.

### 2.3 Strength training

Strength training is manually recorded after each session. The user selects an equipment/exercise card, enters each set's load in kilograms and optional repetitions, and adds movement cues or coaching notes.

### 2.4 Body composition

Tuesday is the default body-composition workflow day, not a database constraint. Records accept any measurement date, missing fields, source notes, and an optional source image/report.

### 2.5 Images

Images are first-class immutable evidence. The app supports meal photos and other personal records such as body-state photos, muscle-shape comparisons, training images, coaching screenshots, and body-composition reports.

### 2.6 AI and voice

AI capabilities are deferred. The application reserves provider-neutral interfaces for speech-to-text, image understanding, structured extraction, and report drafting. DeepSeek is a future provider adapter, not a hard-coded domain dependency. No model result may directly become a confirmed fact.

## 3. Version and milestone map

The repository currently contains MVP 0.1. To avoid confusing `0.1.0` package versioning with capability labels, the roadmap uses both a capability name and a product milestone:

| Milestone | Scope | Authority boundary |
|---|---|---|
| MVP 0.1 | Five-tab fixture-driven web UI | No real data or integrations |
| Web v0.2 | Bilingual shell, equipment catalog, manual strength entry, image/body-composition forms, provider-neutral contracts | Manual entries remain reviewable; no external model required |
| AI v0.0.2 | Voice/structured extraction, image-analysis candidates, bilingual weekly/monthly report drafts | AI produces candidates/drafts; user confirms facts and report publication |
| Web deployment | Fixture-only read-only deployment first, then private authenticated data boundary | No browser-held secrets or direct SQLite exposure |
| Android milestone | APK client, Health Connect/Xiaomi adapter, camera, voice, offline queue | Same domain contracts; no second source of truth |
| Later import milestone | Authorized Le刻/static-file import if a stable export is found | Candidate/review/confirmation required |

## 4. Product architecture

```text
Web UI / Android APK
        ↓
Capture adapters
  manual forms · camera · audio · Health Connect · file import
        ↓
Evidence + candidate layer
  source assets · transcript candidates · extraction candidates
        ↓
Review / confirmation
  field diff · conflicts · confidence · explicit user action
        ↓
SQLite structured source of truth
  revisions · audit trail · confirmed and provisional records
        ↓
Projection services
  Chinese/English UI · Obsidian notes · charts · weekly/monthly reports
```

The browser and Android client are presentation/capture clients. They must not be separate sources of truth. Domain contracts use stable IDs, timestamps, schema versions, provenance, and revision metadata; they do not store UI-only labels or absolute filesystem paths.

## 5. Localization and bilingual UI

### 5.1 Requirements

- The user can switch between `zh-CN` and `en` from Settings.
- The selected locale persists locally once real settings storage exists.
- The default locale is `zh-CN` for the first bilingual slice.
- Date, weekday, unit labels, statuses, empty states, errors, navigation, and report headings are localized.
- User-entered names, coaching notes, exercise aliases, and source text are preserved verbatim; localization must not overwrite user content.
- Reports have an explicit language selection independent of UI language.

### 5.2 Contract

```text
Locale = zh-CN | en
ReportLanguage = zh-CN | en | bilingual

Translation key → localized string
user content → original text + optional translated display value
```

Translations live in versioned locale resources, not scattered inline strings. Missing translations fall back to the default locale and are visible to QA.

## 6. Equipment and exercise catalog

### 6.1 Catalog purpose

The catalog makes manual entry fast and keeps names consistent across Chinese/English UI, training history, reports, and later Android use. It is extensible and must not claim to cover every gym's exact equipment in the first release.

### 6.2 Equipment card schema

```text
EquipmentCard {
  equipmentId: string
  category: cardio | lower_body | chest | back | shoulder | arms | core | mobility | other
  nameZh: string
  nameEn: string
  aliases: string[]
  imageAssetId: string | null
  imageLicense: original | user_owned | open_license | placeholder
  supportsUnilateral: boolean
  defaultUnit: kg | bodyweight | minutes | distance
  cueTemplate: string | null
  enabled: boolean
  schemaVersion: number
}
```

### 6.3 Initial catalog content

The initial fixture catalog contains representative cards across:

- cardio: treadmill, stationary bike, elliptical;
- lower body: leg press, leg extension, leg curl, hip abduction/adduction, squat rack;
- chest: chest press, incline press, cable fly;
- back: lat pulldown, seated row, assisted pull-up;
- shoulder: shoulder press, lateral raise machine, cable face pull;
- arms: biceps curl, triceps pushdown;
- core and mobility: cable rotation, back extension, mat mobility.

The user will later provide the actual gym equipment list and preferred names. The app must support importing/replacing catalog configuration without changing historical record IDs.

### 6.4 Image policy

Use user-provided gym photos first. Otherwise use a neutral placeholder or an image with a documented `imageLicense`. Do not scrape commercial images into the repository.

## 7. Manual strength-training records

### 7.1 User flow

1. Open Today Record or the Strength entry action.
2. Select a date and optional session label.
3. Search or browse an equipment card.
4. Add one or more set rows.
5. Enter load in kilograms and optional repetitions for every set.
6. Add movement cues, coaching points, or free-form notes.
7. Save as `needs_review` or confirm immediately.
8. Reopen the record later to edit or append sets; changes create a revision once SQLite is active.

### 7.2 Record schema

```text
StrengthSession {
  recordId: UUID
  profileId: UUID
  performedOn: date
  sessionLabel: string | null
  source: manual | imported_file | voice_candidate
  status: draft | needs_review | confirmed
  exercises: StrengthExercise[]
  sessionNote: string | null
  sourceAssetIds: UUID[]
  createdAt: timestamp
  updatedAt: timestamp
  revision: number
}

StrengthExercise {
  equipmentId: string
  displayNameSnapshotZh: string
  displayNameSnapshotEn: string
  sets: SetEntry[]
  coachingCue: string | null
  note: string | null
}

SetEntry {
  setNumber: integer
  weightKg: number | null
  repetitions: integer | null
  isWarmup: boolean
  status: recorded | unknown
}
```

The name snapshot protects historical readability if a catalog label changes. Unknown repetitions are allowed; the app must not infer them.

### 7.3 Derived metrics

When both load and repetitions are known, the app may calculate volume as `weightKg × repetitions`. It must expose coverage and exclude unknown values from totals rather than treating them as zero without explanation.

## 8. Cardio and Xiaomi data boundary

### 8.1 Web phase

The web client supports manual cardio entries and imported fixture files. It does not claim to read Xiaomi data directly from a desktop browser.

### 8.2 Android phase

The Android adapter may request explicit read permissions for supported health types, read a bounded time range, normalize records, deduplicate by source ID/time/type, and create import candidates. The adapter must record source application, device, permission scope, sync time, and source record ID.

### 8.3 Initial cardio schema

```text
CardioRecord {
  recordId: UUID
  performedOn: date
  activityType: treadmill | running | walking | cycling | elliptical | other
  durationMinutes: number | null
  distanceKm: number | null
  energyKcal: number | null
  averageHeartRate: number | null
  source: manual | xiaomi_health_connect | imported_file
  sourceRecordId: string | null
  status: needs_review | confirmed
}
```

The adapter is best-effort. Missing Xiaomi fields, regional differences, unavailable Health Connect types, and sync gaps remain visible as data gaps.

## 9. General image upload and evidence model

### 9.1 Supported categories

```text
meal
training
body_state
body_composition
coaching
other
```

### 9.2 Asset schema

```text
EvidenceAsset {
  assetId: UUID
  category: enum above
  originalFilename: string
  mimeType: string
  sha256: string
  capturedAt: timestamp | null
  importedAt: timestamp
  localPath: project-relative path
  source: camera | upload | imported_file | fixture
  immutable: true
  retentionStatus: active | marked_for_deletion | deleted
}
```

Original files are immutable. Thumbnails, OCR, captions, translated text, and AI estimates are derived artifacts linked by `assetId`. `data/images/` holds originals; `cache/` holds disposable intermediates; `notes/` holds readable projections only.

### 9.3 Privacy defaults

- File selection or camera permission is requested only after an explicit user action.
- External image processing is off by default.
- Before any external provider call, the UI shows category, file name, provider, purpose, and whether original image bytes leave the device.
- Body-state images are sensitive and require a separate confirmation from general meal analysis.
- No image is included in a report or export unless the user has enabled that scope.

## 10. Body-composition records

### 10.1 Workflow

Tuesday is shown as a shortcut in the calendar and Today Record. The user can record on any date, attach a report image, enter fields manually, and leave fields unknown.

### 10.2 Schema

```text
BodyCompositionRecord {
  recordId: UUID
  measuredAt: timestamp
  weightKg: number | null
  bodyFatPercent: number | null
  bodyWaterKg: number | null
  bodyWaterPercent: number | null
  basalMetabolicRateKcal: number | null
  skeletalMuscleKg: number | null
  fatMassKg: number | null
  waistHipRatio: number | null
  source: manual | report_ocr_candidate | imported_file
  sourceAssetIds: UUID[]
  deviceOrReportLabel: string | null
  note: string | null
  status: needs_review | confirmed
}
```

The schema is extensible for additional device-specific fields. Source report wording is preserved as context and is not treated as a medical diagnosis.

### 10.3 Future export path

If the user finds an authorized Le刻 export, it enters through:

```text
file → parser candidate → field mapping → conflict check → user confirmation → SQLite revision
```

The export must never bypass review or overwrite an existing Tuesday record silently.

## 11. Voice and DeepSeek/provider interfaces

### 11.1 Deferred voice contexts

The reserved voice contexts are:

- workout set/load/repetitions;
- coaching cue;
- workout summary;
- meal note;
- daily health note.

The current slice does not request microphone permission, record audio, or transcribe speech.

### 11.2 Provider-neutral adapters

```text
SpeechProvider.transcribe(audioAsset) → TranscriptCandidate
VisionProvider.inspect(imageAsset, task) → ExtractionCandidate
LanguageProvider.normalize(input) → BatchUpdateCandidate
ReportProvider.draft(confirmedSummary, locale) → ReportDraftCandidate
```

DeepSeek is implemented later behind `LanguageProvider` and may also be used for text-only report drafting. A separate vision-capable provider may be used for meal/body/report images if DeepSeek's selected API path does not support image input.

### 11.3 Candidate rules

Every AI result carries provider/model/version, source asset IDs, confidence, unknowns, conflicts, schema version, and idempotency key. It starts as `needs_review` and `authority: false`. Only explicit user confirmation creates or updates a confirmed SQLite fact.

## 12. AI v0.0.2: weekly and monthly reports

### 12.1 Data flow

```text
confirmed SQLite records
        ↓
deterministic aggregation
        ↓
coverage / trend summary
        ↓
AI report draft in selected language
        ↓
user review and optional save
```

### 12.2 Deterministic aggregation

The non-AI layer calculates:

- strength sessions, exercises, sets, known volume, and coverage;
- cardio sessions, duration, distance, and energy where available;
- body-composition changes and measurement coverage;
- sleep/recovery coverage;
- meal/protein coverage and estimate ranges;
- missing days, unresolved review items, and source mix.

AI may summarize patterns and explain uncertainty but must not invent values, create medical conclusions, or silently convert missing data to zero.

### 12.3 Report draft schema

```text
ReportDraftCandidate {
  reportId: UUID
  period: week | month
  periodStart: date
  periodEnd: date
  language: zh-CN | en | bilingual
  generatedAt: timestamp
  provider: string
  model: string
  sourceRevision: number
  sections: {
    recordedFacts: string[]
    observations: string[]
    dataGaps: string[]
    questionsForUser: string[]
    nextReviewPrompts: string[]
  }
  status: draft | reviewed | saved
  authority: false
}
```

Reports are drafts until the user reviews/saves them. They are derived projections and do not replace daily source records.

## 13. Review and confirmation model

All manual, imported, OCR, voice, and AI-assisted input can be shown in Review with:

- original source evidence;
- proposed field values;
- confidence and unknowns;
- conflicts with existing records;
- provider and processing status;
- field-level confirm, edit, reject, and defer actions;
- a visible fixture label for synthetic data.

No bulk confirmation may silently overwrite confirmed values. Confirmed changes create a new revision and audit record; rejected candidates remain linked to the evidence.

## 14. Persistence and data boundaries

```text
data/database/  SQLite source of truth
data/images/    immutable original images
data/audio/     immutable original audio, future
data/imports/   user-provided import packages
notes/          regenerated Obsidian projections
cache/          disposable thumbnails, OCR/intermediate output
backups/        explicit local backup packages
config/         locale, catalog, and non-secret preferences
```

Secrets and provider credentials stay in OS-secure local configuration or deployment runtime secret management. They never enter SQLite, Markdown, fixtures, browser local storage, or screenshots.

## 15. Web deployment and maintenance

The first deployment is fixture-labelled and read-only. It must not expose SQLite, original assets, or write endpoints. A later private deployment requires an explicit hosting/auth decision, HTTPS, session scope, CSRF/CORS policy, rate limits, threat model, secret manager, backup/restore policy, health checks, rollback procedure, owner, and maintenance cadence.

The deployed web client and local desktop app use the same contracts. Android is not started until the web deployment acceptance checks pass.

## 16. Android APK milestone

The Android app is a later client, not a new source of truth. It will reuse:

- domain schemas and stable IDs;
- candidate/review/confirmation rules;
- bilingual locale resources;
- image/audio evidence model;
- authenticated service boundary once approved.

Initial APK scope:

- Health Connect/Xiaomi read adapter;
- manual strength entry with equipment cards;
- camera upload for meals, body state, coaching, and reports;
- voice capture;
- offline queue with retry and deduplication;
- explicit sync status.

Live background capture, full device sync, and Le刻 direct integration remain separate future decisions.

## 17. Acceptance criteria for this specification

Before implementation begins, the approved specification must establish that:

- bilingual UI is a presentation concern and does not fork domain data;
- Le刻 is manual-first and no private API reverse engineering is planned;
- strength records support per-set kilograms, optional repetitions, cues, and revisions;
- the equipment catalog is extensible and image licensing is explicit;
- meal, training, body-state, coaching, and body-composition images share one immutable evidence model;
- Tuesday body composition is a shortcut, not a hard date constraint;
- Xiaomi data is an Android/future adapter, not a browser promise;
- AI/DeepSeek outputs are provider-neutral, review-gated candidates or report drafts;
- reports are based on deterministic aggregates and expose data coverage/gaps;
- all protected data boundaries remain intact;
- web deployment precedes Android APK work;
- no API key, microphone permission, external model call, real personal data write, or SQLite schema migration is introduced merely by approving this document.

## 18. User data needed for implementation

The implementation can start with synthetic fixtures. Before real-data onboarding, request:

1. the gym equipment list and preferred Chinese/English names;
2. representative equipment photos or permission to use placeholders;
3. one or more Tuesday body-composition reports/screenshots;
4. preferred units and report language default;
5. a small set of meal, body-state, training, coaching, and body-composition images, if the user wants image flows tested;
6. Android phone model, Android version, Xiaomi运动健康 version, and Health Connect availability;
7. later, an authorized Le刻 export sample only if the user discovers one.

No real provider key is needed for the contract and UI stages.
