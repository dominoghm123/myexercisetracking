# My Exercise Tracking — Voice/LLM + Web Deployment v0.2 Design

**Status:** Draft for user review  
**Scope:** Post-MVP 0.1 architecture slice; no provider calls, microphone access, or real-data writes

## Context

MVP 0.1 is a local-first five-tab web app driven entirely by synthetic fixtures. A deferred voice-capture port reserves a future explicit-click microphone boundary; this design slice does not add microphone UI, permission requests, recording, or transcription. The next long-term direction adds two capabilities without weakening the local source-of-truth boundary:

1. Deploy the web client for private, authenticated access and maintain it after launch.
2. Let voice transcripts optionally pass through a provider-neutral language-model adapter (for example, a future DeepSeek or Kimi connector) to produce batch-update candidates.

## Recommended architecture

Keep the browser UI, domain contracts, provider adapters, persistence, and deployment concerns separate:

```text
voice/audio evidence
        ↓
local transcription candidate
        ↓
provider adapter (optional, explicit consent)
        ↓
BatchUpdateCandidate (non-authoritative)
        ↓
Review diff + conflict checks
        ↓ explicit user confirmation
SQLite revision / audit record
        ↓
derived Obsidian notes and cache
```

The domain layer depends only on provider-neutral contracts. DeepSeek, Kimi, or another service is an adapter selected outside the domain. The web deployment must not turn the browser into a direct database or secret holder; production access should go through a small authenticated application boundary once deployment work begins.

## Evidence and candidate update contracts

Audio and transcript evidence have separate lifecycles:

- `audio_asset`: immutable original bytes, SHA-256, MIME type, capture context, local path under `data/audio/YYYY/MM/`, created-at, and retention/deletion state.
- `transcript_candidate`: derived text linked to exactly one `audio_asset`, transcription engine/version, language, created-at, and review status. It is disposable/re-runnable and never replaces the audio asset.

The future persistence layer must keep these records outside `notes/` and `cache/`; `notes/` may render a readable projection and `cache/` may hold disposable intermediate output. A delete request must make the retention action explicit for both original audio and derived transcripts.

Every model-assisted result is a `BatchUpdateCandidate` with:

- `schemaVersion`, `candidateId`, `createdAt`, and an idempotency key;
- target date and optional target record IDs;
- one or more operations: `create`, `update`, or `append`;
- field paths, proposed values, confidence, and field-level status;
- source asset IDs, transcript ID, provider/model label, and prompt/schema version;
- explicit `reviewStatus: needs_review` and `authority: false`.

The implementation contract will use typed JSON values with a closed operation set (`create | update | append`), allow-listed field paths, explicit target resolution (`recordId` or `date + context`), field-level confidence/status, and a deterministic idempotency key scoped to the candidate plus target. Duplicate keys must be treated as a safe no-op or surfaced as an existing candidate, never as a second write. Unknown values, ambiguous targets, low confidence, and conflicts remain visible as review items. No candidate may silently overwrite a confirmed fact. Confirmation creates a new SQLite revision and audit entry; rejection leaves the original evidence intact.

## Provider and privacy boundary

- External providers are off by default and require an explicit per-action consent.
- Audio and transcript sharing scope is shown before dispatch.
- Credentials live in environment or OS-secure local configuration, never SQLite, Markdown, fixtures, or browser local storage.
- Provider adapters return normalized candidates or typed failures; they do not write records.
- Retry is idempotent and never duplicates a confirmed operation.

## Web deployment lane

Deployment is a separate slice from local data storage:

- Continue serving the static client locally for development and fixture QA.
- The first deployable target is explicitly a fixture-labelled, read-only web surface. It does not expose SQLite, original assets, or write endpoints.
- A later private deployment requires an explicit hosting/auth choice, HTTPS, session/identity scope, CSRF/CORS policy, rate limits, and a short threat model before any personal data is served.
- Hosted secrets must use the platform's runtime secret manager; they must not be bundled into browser assets, committed files, SQLite, or Markdown.
- Keep SQLite and original assets local/private until a separate sync and threat-model decision is approved.
- Add health/build checks, environment separation, rollback notes, backup/restore policy, and a maintenance checklist before launch.
- Maintenance must name an owner, a health-check cadence, an alert path, and a rollback procedure; these are launch acceptance items, not implicit operations.

## Incremental delivery

1. Add and validate the provider-neutral candidate contract and architecture notes.
2. Add a synthetic Review diff preview using the contract; every candidate carries `fixture: true`, the UI shows “synthetic fixture”, and fixture candidates cannot enter authoritative storage.
3. Add SQLite revisions/audit and explicit confirmation.
4. Implement one provider adapter behind a feature flag after provider, region, privacy, and credential decisions are supplied.
5. Choose and implement private web deployment, then add maintenance/rollback checks.
6. After the web client is deployed and its contracts are stable, create an Android APK milestone using the same provider-neutral domain contracts and authenticated service boundary; mobile is a later client, not a second source of truth.

## Acceptance criteria for this design slice

- A candidate can be created without a provider call and is always non-authoritative.
- A normalized candidate preserves provenance, confidence, conflicts, and idempotency metadata.
- Validators reject malformed operations (unknown op, disallowed field path, missing target, invalid confidence/status, or duplicate idempotency key) and any attempt to mark a candidate confirmed before user confirmation.
- Existing MVP 0.1 fixtures and protected data directories remain unchanged.
- No API key, microphone permission, network call, or SQLite write is introduced.
- The Android milestone remains future work until the web deployment acceptance checks pass.
