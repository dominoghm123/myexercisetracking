const REVIEW_STATUSES = new Set(['confirmed', 'needs_review']);

const valueState = (value, unit = null) => ({
  value,
  unit,
  state: value === null ? 'unknown' : 'recorded',
});

const normalizeSet = (set, index) => ({
  fixture: set.fixture === true,
  number: index + 1,
  repetitions: valueState(set.repetitions, 'reps'),
  load: valueState(set.loadKg, 'kg'),
});

const normalizeWorkout = (workout, categoryById) => ({
  fixture: workout.fixture === true,
  id: workout.id,
  category: categoryById.get(workout.categoryId),
  title: workout.title,
  duration: valueState(workout.durationMinutes, 'min'),
  completion: workout.completion,
  reviewStatus: workout.reviewStatus,
  needsReview: workout.reviewStatus === 'needs_review',
  items: workout.items.map((item) => ({
    fixture: item.fixture === true,
    id: item.id,
    exerciseName: item.exerciseName,
    sets: item.sets.map(normalizeSet),
    movementCues: [...item.movementCues],
  })),
  movementCues: [...workout.movementCues],
  sourceAssetId: workout.sourceAssetId,
});

const makeReviewItem = (kind, item, label) => ({
  fixture: item.fixture === true,
  id: `${kind}:${item.id ?? 'daily'}`,
  kind,
  label,
  reviewStatus: item.reviewStatus,
});

export function normalizeDailyRecord(record, categories) {
  if (!record || record.fixture !== true) {
    throw new TypeError('MVP 0.1 expects an explicitly labelled fixture record.');
  }

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const workouts = record.workouts.map((workout) => normalizeWorkout(workout, categoryById));
  const reviewInbox = [
    ...record.workouts
      .filter((workout) => workout.reviewStatus === 'needs_review')
      .map((workout) => makeReviewItem('workout', workout, workout.title)),
    ...(record.dailyHealth.reviewStatus === 'needs_review'
      ? [makeReviewItem('daily_health', record.dailyHealth, 'Daily health')]
      : []),
    ...(record.nutritionSummary.reviewStatus === 'needs_review'
      ? [makeReviewItem('nutrition', record.nutritionSummary, 'Nutrition summary')]
      : []),
  ];

  return {
    fixture: true,
    fixtureLabel: record.fixtureLabel,
    schemaVersion: record.schemaVersion,
    date: record.date,
    timezone: record.timezone,
    profileId: record.profileId,
    source: { ...record.source },
    summary: {
      fixture: true,
      workoutCount: workouts.length,
      completedWorkoutCount: workouts.filter((workout) => workout.completion === 'completed').length,
      recordedTrainingMinutes: workouts.reduce(
        (total, workout) => total + (workout.duration.value ?? 0),
        0,
      ),
      hasUnknownTrainingDuration: workouts.some((workout) => workout.duration.state === 'unknown'),
      reviewCount: reviewInbox.length,
      status: reviewInbox.length > 0 ? 'needs_review' : 'confirmed',
    },
    categories: categories.map((category) => ({ ...category })),
    workouts,
    dailyHealth: {
      fixture: record.dailyHealth.fixture === true,
      reviewStatus: record.dailyHealth.reviewStatus,
      needsReview: record.dailyHealth.reviewStatus === 'needs_review',
      sleep: valueState(record.dailyHealth.sleepHours, 'hours'),
      energy: valueState(record.dailyHealth.energy, '1-5'),
      soreness: valueState(record.dailyHealth.soreness, '1-5'),
      mood: valueState(record.dailyHealth.mood),
      recoveryNote: valueState(record.dailyHealth.recoveryNote),
      restingHeartRate: valueState(record.dailyHealth.restingHeartRateBpm, 'bpm'),
      bloodOxygen: valueState(record.dailyHealth.bloodOxygenPercent, '%'),
      stressLevel: valueState(record.dailyHealth.stressLevel, '1-5'),
      outdoorExercise: valueState(record.dailyHealth.outdoorExerciseMinutes, 'min'),
      period: {
        fixture: record.dailyHealth.period.fixture === true,
        isInPeriod: valueState(record.dailyHealth.period.isInPeriod),
        startDate: valueState(record.dailyHealth.period.startDate),
        endDate: valueState(record.dailyHealth.period.endDate),
        symptomNote: valueState(record.dailyHealth.period.symptomNote),
      },
    },
    nutritionSummary: {
      fixture: record.nutritionSummary.fixture === true,
      reviewStatus: record.nutritionSummary.reviewStatus,
      needsReview: record.nutritionSummary.reviewStatus === 'needs_review',
      mealsRecorded: valueState(record.nutritionSummary.mealsRecorded, 'meals'),
      proteinGramsRange: record.nutritionSummary.proteinGramsRange
        ? { ...record.nutritionSummary.proteinGramsRange, unit: 'g', state: 'recorded' }
        : { value: null, unit: 'g', state: 'unknown' },
      energyKcalRange: record.nutritionSummary.energyKcalRange
        ? { ...record.nutritionSummary.energyKcalRange, unit: 'kcal', state: 'recorded' }
        : { value: null, unit: 'kcal', state: 'unknown' },
      note: valueState(record.nutritionSummary.note),
    },
    reviewInbox,
  };
}

export function validateDailyRecord(record, categories) {
  const errors = [];
  const requiredCategoryIds = ['cardio', 'strength', 'stretching/mobility'];
  const categoryIds = new Set(categories.map((category) => category.id));

  if (record.fixture !== true || record.source?.kind !== 'synthetic_fixture') {
    errors.push('record must be explicitly machine-labelled as a synthetic fixture');
  }
  if (record.source?.authority !== false) {
    errors.push('fixture source must not claim source-of-truth authority');
  }
  if (record.date !== '2026-08-06') errors.push('fixture date must be 2026-08-06');
  for (const categoryId of requiredCategoryIds) {
    if (!categoryIds.has(categoryId)) errors.push(`missing category: ${categoryId}`);
  }
  for (const category of categories) {
    if (category.fixture !== true) errors.push(`category ${category.id} is missing fixture:true`);
  }
  for (const workout of record.workouts) {
    if (workout.fixture !== true) errors.push(`workout ${workout.id} is missing fixture:true`);
    if (!categoryIds.has(workout.categoryId)) errors.push(`unknown category: ${workout.categoryId}`);
    if (!REVIEW_STATUSES.has(workout.reviewStatus)) {
      errors.push(`invalid review status for workout ${workout.id}`);
    }
  }
  if (!REVIEW_STATUSES.has(record.dailyHealth.reviewStatus)) {
    errors.push('invalid daily health review status');
  }
  if (!REVIEW_STATUSES.has(record.nutritionSummary.reviewStatus)) {
    errors.push('invalid nutrition review status');
  }

  return errors;
}

