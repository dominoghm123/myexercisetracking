import {
  dailyRecordFixture,
  exerciseCategoriesFixture,
} from '../src/fixtures/daily-record-2026-08-06.js';
import {
  normalizeDailyRecord,
  validateDailyRecord,
} from '../src/domain/normalize-daily-record.js';

const errors = validateDailyRecord(dailyRecordFixture, exerciseCategoriesFixture);
const viewModel = normalizeDailyRecord(dailyRecordFixture, exerciseCategoriesFixture);

if (errors.length > 0) {
  for (const error of errors) console.error(`fixture error: ${error}`);
  process.exitCode = 1;
} else if (
  viewModel.fixture !== true
  || viewModel.fixtureLabel !== 'Synthetic fixture'
  || viewModel.summary.status !== 'needs_review'
  || viewModel.summary.hasUnknownTrainingDuration !== true
  || viewModel.reviewInbox.length === 0
) {
  console.error('fixture error: normalized view-model invariants failed');
  process.exitCode = 1;
} else {
  console.log(
    `Fixture valid: ${viewModel.date}; ${viewModel.summary.workoutCount} workouts; `
      + `${viewModel.summary.reviewCount} items need review; unknown values preserved.`,
  );
}
