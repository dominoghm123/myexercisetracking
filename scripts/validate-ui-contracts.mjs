import { createVoiceCaptureRequest } from '../src/contracts/voice-capture.js';
import { dailyRecordViewModel } from '../src/domain/daily-record-view-model.js';
import { dashboardViewModel } from '../src/features/dashboard/dashboard-view-model.js';
import { renderDashboard } from '../src/features/dashboard/render-dashboard.js';
import { planViewModel } from '../src/features/plan/plan-view-model.js';
import { renderPlan } from '../src/features/plan/render-plan.js';
import { reviewViewModel } from '../src/features/review/review-view-model.js';
import { renderReview } from '../src/features/review/render-review.js';
import { settingsViewModel } from '../src/features/settings/settings-view-model.js';
import { renderSettings } from '../src/features/settings/render-settings.js';
import { mapDailyRecordViewModel } from '../src/features/today-record/map-daily-record-view.js';
import { renderTodayRecord } from '../src/features/today-record/render-today-record.js';

const pages = [
  ['today', renderTodayRecord(mapDailyRecordViewModel(dailyRecordViewModel))],
  ['dashboard', renderDashboard(dashboardViewModel)],
  ['plan', renderPlan(planViewModel)],
  ['review', renderReview(reviewViewModel)],
  ['settings', renderSettings(settingsViewModel)],
];

const failures = pages.flatMap(([route, markup]) => {
  const issues = [];
  if (!markup.includes('<h1')) {
    issues.push(`${route}: missing page heading`);
  }
  if (!markup.toLowerCase().includes('synthetic fixture')) {
    issues.push(`${route}: missing visible synthetic fixture label`);
  }
  if (!markup.includes('<main')) {
    issues.push(`${route}: missing main landmark`);
  }
  return issues;
});

const voiceRequest = createVoiceCaptureRequest({ context: 'coaching_cue' });
if (voiceRequest.authority !== false || voiceRequest.reviewStatus !== 'needs_review') {
  failures.push('voice capture port must remain non-authoritative and needs_review');
}

if (failures.length) {
  console.error('UI contract validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('UI contracts valid: five fixture-labelled tabs and deferred voice-capture port.');
}
