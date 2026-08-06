// Deferred interface only. MVP 0.1 never requests microphone access or records audio.
export const VOICE_CAPTURE_CONTEXTS = Object.freeze([
  'workout_set',
  'coaching_cue',
  'workout_summary',
  'meal_note',
  'daily_health_note',
]);

export const VOICE_CAPTURE_STATES = Object.freeze([
  'idle',
  'recording',
  'processing_locally',
  'needs_review',
  'confirmed',
  'failed',
]);

/**
 * Contract for a future microphone capture adapter.
 * Transcripts are candidates until the user explicitly confirms them.
 */
export function createVoiceCaptureRequest({ context, targetRecordId = null } = {}) {
  if (!VOICE_CAPTURE_CONTEXTS.includes(context)) {
    throw new TypeError(`Unsupported voice capture context: ${context}`);
  }

  return Object.freeze({
    schemaVersion: 1,
    context,
    targetRecordId,
    permissionTrigger: 'explicit_user_click',
    processingPreference: 'local_first',
    reviewStatus: 'needs_review',
    authority: false,
  });
}
