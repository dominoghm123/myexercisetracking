import { weeklyDashboardFixture } from './dashboard-fixture.js';

const last = (items) => (items.length ? items[items.length - 1] : null);
const first = (items) => (items.length ? items[0] : null);

const coverage = (recorded, expected) => ({
  recorded,
  expected,
  percent: expected > 0 ? Math.round((recorded / expected) * 100) : null,
  label: `${recorded}/${expected} days`,
});

const normalizeMetric = (metric, priority) => {
  const latest = last(metric.observations);
  const baseline = first(metric.observations);
  const delta = latest && baseline ? Number((latest.value - baseline.value).toFixed(2)) : null;

  return {
    fixture: true,
    label: metric.label,
    unit: metric.unit,
    status: metric.status,
    confidence: metric.confidence,
    priority,
    latestValue: latest?.value ?? null,
    latestDate: latest?.date ?? null,
    delta,
    observations: metric.observations.map((point) => ({ ...point })),
  };
};

export function createDashboardViewModel(fixture) {
  if (fixture?.fixture !== true || fixture.source?.authority !== false) {
    throw new TypeError('Dashboard input must be a non-authoritative synthetic fixture.');
  }

  const body = fixture.bodyComposition;
  const primaryMetrics = [
    normalizeMetric(body.bodyFatPercent, 1),
    normalizeMetric(body.fatMassKg, 1),
    normalizeMetric(body.skeletalMuscleKg, 1),
    normalizeMetric(body.waistHipRatio, 1),
  ];

  return {
    fixture: true,
    fixtureLabel: fixture.fixtureLabel,
    schemaVersion: fixture.schemaVersion,
    weekLabel: 'Aug 3–9, 2026',
    throughLabel: 'Through Thursday, Aug 6',
    week: { ...fixture.week },
    evidence: {
      fixture: true,
      coverage: coverage(fixture.week.recordedDays, fixture.week.elapsedDays),
      state: fixture.week.recordedDays < fixture.week.elapsedDays ? 'incomplete' : 'complete',
      note: 'Partial week. Missing entries remain unknown, never zero.',
    },
    primaryMetrics,
    contextMetric: normalizeMetric(body.weightKg, 2),
    training: {
      fixture: true,
      status: fixture.training.status,
      completion: coverage(fixture.training.completedSessions, fixture.training.plannedSessions),
      recordedMinutes: fixture.training.recordedMinutes,
      loadVolumeKg: fixture.training.loadVolumeKg,
      loadCoverage: coverage(
        fixture.training.loadCoverage.recorded,
        fixture.training.loadCoverage.expected,
      ),
      note: fixture.training.note,
    },
    nutrition: {
      fixture: true,
      status: fixture.nutrition.status,
      proteinGramsMedian: fixture.nutrition.proteinGramsMedian,
      coverage: coverage(
        fixture.nutrition.proteinCoverage.recorded,
        fixture.nutrition.proteinCoverage.elapsed,
      ),
      confidence: fixture.nutrition.confidence,
      note: fixture.nutrition.note,
    },
    recovery: {
      fixture: true,
      status: fixture.recovery.status,
      sleepHoursAverage: fixture.recovery.sleepHoursAverage,
      sleepCoverage: coverage(
        fixture.recovery.sleepCoverage.recorded,
        fixture.recovery.sleepCoverage.elapsed,
      ),
      energyAverage: fixture.recovery.energyAverage,
      sorenessAverage: fixture.recovery.sorenessAverage,
      recoveryCoverage: coverage(
        fixture.recovery.recoveryCoverage.recorded,
        fixture.recovery.recoveryCoverage.elapsed,
      ),
      note: fixture.recovery.note,
    },
  };
}

export const dashboardViewModel = Object.freeze(createDashboardViewModel(weeklyDashboardFixture));

