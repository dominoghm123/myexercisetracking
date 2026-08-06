# Deferred voice-capture port

Voice entry is a post-0.1 capture adapter. MVP 0.1 does not request microphone permission, record audio, transcribe speech, or write voice-derived facts.

## Intended flow

1. The user explicitly clicks a microphone control in a supported context.
2. The adapter stores the original audio as immutable local evidence under `data/audio/YYYY/MM/`.
3. Local-first transcription produces a candidate transcript linked to the audio asset.
4. A context mapper proposes structured candidate values for one of: workout set/load/repetitions, coaching cue, workout summary, meal note, or daily-health note.
5. The UI keeps audio, transcript, confidence, and proposed fields together in Review.
6. Only explicit user confirmation promotes proposed values into SQLite facts.

## Safety and provenance

- Microphone permission is requested only after an explicit click, never on page load.
- Original audio is never overwritten; transcripts and parsing runs retain source asset IDs and model/tool versions.
- A transcript is not a confirmed fact. Failed or low-confidence transcription remains `needs_review`.
- External speech or language models remain off by default and require the existing explicit external-AI consent boundary.
- Obsidian notes are derived projections and must not become a voice-write path back into SQLite.

The stable context and state vocabulary lives in `src/contracts/voice-capture.js`. Capture controls can expose `data-voice-context` hooks without activating microphone behavior in 0.1.
