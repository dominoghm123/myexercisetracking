// Provider-neutral, non-authoritative contract for future voice/LLM suggestions.

export const BATCH_UPDATE_OPERATIONS = Object.freeze(['create', 'update', 'append']);
export const BATCH_UPDATE_REVIEW_STATUSES = Object.freeze(['needs_review', 'rejected', 'confirmed']);
export const BATCH_UPDATE_FIELD_STATUSES = Object.freeze(['proposed', 'ambiguous', 'conflict']);
export const BATCH_UPDATE_FIELD_PATHS = Object.freeze([
  'workout.type',
  'workout.durationMinutes',
  'workout.loadKg',
  'workout.sets',
  'workout.repetitions',
  'workout.coachingCue',
  'workout.summary',
  'meal.note',
  'meal.energyKcalRange',
  'meal.proteinGramsRange',
  'health.sleepHours',
  'health.subjectiveState',
  'health.symptomNote',
]);

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

function assert(condition, message) {
  if (!condition) throw new TypeError(`Invalid batch update candidate: ${message}`);
}

function validateTarget(target) {
  assert(isPlainObject(target), 'target is required');
  const byId = isNonEmptyString(target.recordId);
  const byDate = isNonEmptyString(target.date) && isNonEmptyString(target.context);
  assert(byId || byDate, 'target needs recordId or date + context');
  assert(!target.recordId || byId, 'target.recordId must be a non-empty string');
  assert(!target.date || isNonEmptyString(target.date), 'target.date must be a non-empty string');
  assert(!target.context || isNonEmptyString(target.context), 'target.context must be a non-empty string');
}

function validateOperation(operation) {
  assert(isPlainObject(operation), 'operation must be an object');
  assert(BATCH_UPDATE_OPERATIONS.includes(operation.op), `unsupported operation ${operation.op}`);
  validateTarget(operation.target);
  assert(Array.isArray(operation.fields) && operation.fields.length > 0, 'operation.fields must not be empty');

  operation.fields.forEach((field) => {
    assert(isPlainObject(field), 'field must be an object');
    assert(BATCH_UPDATE_FIELD_PATHS.includes(field.path), `disallowed field path ${field.path}`);
    assert(Object.hasOwn(field, 'value'), `field ${field.path} is missing value`);
    assert(Number.isFinite(field.confidence) && field.confidence >= 0 && field.confidence <= 1, `field ${field.path} has invalid confidence`);
    assert(BATCH_UPDATE_FIELD_STATUSES.includes(field.status), `field ${field.path} has invalid status`);
  });
}

export function validateBatchUpdateCandidate(candidate) {
  assert(isPlainObject(candidate), 'candidate must be an object');
  assert(candidate.schemaVersion === 1, 'schemaVersion must be 1');
  assert(isNonEmptyString(candidate.candidateId), 'candidateId is required');
  assert(isNonEmptyString(candidate.idempotencyKey), 'idempotencyKey is required');
  assert(candidate.fixture === true, 'fixture must be true until real provider integration exists');
  assert(candidate.authority === false, 'authority must remain false before confirmation');
  assert(candidate.reviewStatus === 'needs_review', 'reviewStatus must remain needs_review at creation');
  assert(isNonEmptyString(candidate.createdAt), 'createdAt is required');
  assert(Array.isArray(candidate.operations) && candidate.operations.length > 0, 'operations must not be empty');
  candidate.operations.forEach(validateOperation);
  assert(isPlainObject(candidate.provenance), 'provenance is required');
  assert(isNonEmptyString(candidate.provenance.provider), 'provenance.provider is required');
  assert(isNonEmptyString(candidate.provenance.model), 'provenance.model is required');
  assert(isNonEmptyString(candidate.provenance.transcriptId), 'provenance.transcriptId is required');
  assert(Array.isArray(candidate.provenance.sourceAssetIds), 'provenance.sourceAssetIds must be an array');
  return candidate;
}

export function createBatchUpdateCandidate(input = {}) {
  const candidate = {
    schemaVersion: 1,
    candidateId: input.candidateId || 'fixture-candidate-2026-08-06-meal-01',
    idempotencyKey: input.idempotencyKey || 'fixture-candidate-2026-08-06-meal-01:meal-note',
    createdAt: input.createdAt || '2026-08-06T12:45:00+08:00',
    fixture: true,
    reviewStatus: 'needs_review',
    authority: false,
    operations: input.operations || [{
      op: 'append',
      target: { date: '2026-08-06', context: 'meal' },
      fields: [{
        path: 'meal.note',
        value: 'Lunch included rice, greens, and tofu.',
        confidence: 0.78,
        status: 'proposed',
      }],
    }],
    provenance: input.provenance || {
      provider: 'fixture-provider',
      model: 'fixture-normalizer-v1',
      transcriptId: 'fixture-transcript-2026-08-06-01',
      sourceAssetIds: ['fixture-audio-2026-08-06-01'],
      promptVersion: 'fixture-prompt-v1',
    },
  };
  validateBatchUpdateCandidate(candidate);
  return Object.freeze(candidate);
}

