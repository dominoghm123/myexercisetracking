# My Exercise Tracking — Voice/LLM + Web Deployment v0.2 Design

**Status:** Draft for user review  
**Scope:** Post-MVP 0.1 architecture slice; no provider calls, microphone access, or real-data writes

## Context

MVP 0.1 is a local-first five-tab web app driven entirely by synthetic fixtures. A deferred voice-capture port already reserves explicit-click microphone entry points. The next long-term direction adds two capabilities without weakening the local source-of-truth boundary:

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

## Candidate update contract

Every model-assisted result is a `BatchUpdateCandidate` with:

- `schemaVersion`, `candidateId`, `createdAt`, and an idempotency key;
- target date and optional target record IDs;
- one or more operations: `create`, `update`, or `append`;
- field paths, proposed values, confidence, and field-level status;
- source asset IDs, transcript ID, provider/model label, and prompt/schema version;
- explicit `reviewStatus: needs_review` and `authority: false`.

Unknown values, ambiguous targets, low confidence, and conflicts remain visible as review items. No candidate may silently overwrite a confirmed fact. Confirmation creates a new SQLite revision and audit entry; rejection leaves the original evidence intact.

## Provider and privacy boundary

- External providers are off by default and require an explicit per-action consent.
- Audio and transcript sharing scope is shown before dispatch.
- Credentials live in environment or OS-secure local configuration, never SQLite, Markdown, fixtures, or browser local storage.
- Provider adapters return normalized candidates or typed failures; they do not write records.
- Retry is idempotent and never duplicates a confirmed operation.

## Web deployment lane

Deployment is a separate slice from local data storage:

- Continue serving the static client locally for development and fixture QA.
- Add a deployment target only after the first authenticated hosting choice is confirmed.
- Keep SQLite and original assets local/private until a separate sync and threat-model decision is approved.
- Add health/build checks, environment separation, rollback notes, and a maintenance checklist before launch.
- A deployed UI may begin as a read-only or demo surface; write operations remain behind an authenticated service boundary.

## Incremental delivery

1. Add and validate the provider-neutral candidate contract and architecture notes.
2. Add a synthetic Review diff preview using the contract; still no network or persistence.
3. Add SQLite revisions/audit and explicit confirmation.
4. Implement one provider adapter behind a feature flag after provider, region, privacy, and credential decisions are supplied.
5. Choose and implement private web deployment, then add maintenance/rollback checks.

## Acceptance criteria for this design slice

- A candidate can be created without a provider call and is always non-authoritative.
- A normalized candidate preserves provenance, confidence, conflicts, and idempotency metadata.
- Validators reject malformed operations and any attempt to mark a candidate confirmed before user confirmation.
- Existing MVP 0.1 fixtures and protected data directories remain unchanged.
- No API key, microphone permission, network call, or SQLite write is introduced.
