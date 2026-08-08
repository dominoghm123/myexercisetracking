import {
  createBatchUpdateCandidate,
  validateBatchUpdateCandidate,
} from '../src/contracts/batch-update-candidate.js';

const candidate = createBatchUpdateCandidate();
const failures = [];

if (candidate.fixture !== true || candidate.authority !== false || candidate.reviewStatus !== 'needs_review') {
  failures.push('fixture candidate must remain non-authoritative and needs_review');
}

const invalidCases = [
  ['unknown operation', { ...candidate, operations: [{ ...candidate.operations[0], op: 'replace' }] }],
  ['disallowed field path', {
    ...candidate,
    operations: [{
      ...candidate.operations[0],
      fields: [{ ...candidate.operations[0].fields[0], path: 'profile.name' }],
    }],
  }],
  ['missing target', {
    ...candidate,
    operations: [{ ...candidate.operations[0], target: {} }],
  }],
  ['premature confirmation', { ...candidate, reviewStatus: 'confirmed' }],
];

invalidCases.forEach(([label, invalid]) => {
  try {
    validateBatchUpdateCandidate(invalid);
    failures.push(`${label} was accepted`);
  } catch {
    // Expected rejection.
  }
});

if (failures.length) {
  console.error('Batch update contract validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Batch update contract valid: synthetic candidate is typed, review-gated, and non-authoritative.');
}

