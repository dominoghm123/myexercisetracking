const statusLabel = (status) => status === 'needs_review' ? 'Needs review' : 'Confirmed';

const categoryKey = (id) => id === 'stretching/mobility' ? 'mobility' : id;

const durationLabel = (duration) => duration.state === 'unknown'
  ? 'Duration unknown'
  : `${duration.value} ${duration.unit}`;

const queueKind = (kind) => ({
  workout: { kind: 'workout', label: 'W' },
  daily_health: { kind: 'health', label: 'H' },
  nutrition: { kind: 'meal', label: 'M' },
}[kind] || { kind: 'note', label: 'N' });

export function mapDailyRecordViewModel(record) {
  if (record.fixture !== true) {
    throw new TypeError('MVP 0.1 only renders explicitly labelled fixture data.');
  }

  const date = new Date(`${record.date}T12:00:00+08:00`);
  const dateLabel = new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: record.timezone,
  }).format(date);
  const dayLabel = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    timeZone: record.timezone,
  }).format(date);

  const queue = record.reviewInbox.map((item) => {
    const kind = queueKind(item.kind);
    return {
      id: item.id,
      kind: kind.kind,
      kindLabel: kind.label,
      title: item.label,
      meta: 'Synthetic data · confirmation required',
    };
  });

  const trainingCategories = record.categories.map((category) => {
    const workouts = record.workouts.filter((workout) => workout.category.id === category.id);
    return {
      key: categoryKey(category.id),
      eyebrow: category.id,
      label: category.label,
      countLabel: `${workouts.length} ${workouts.length === 1 ? 'session' : 'sessions'}`,
      entries: workouts.flatMap((workout) => [
        { label: workout.title, value: durationLabel(workout.duration) },
        ...(workout.items.length
          ? [{
            label: workout.items[0].exerciseName,
            value: `${workout.items[0].sets.length} sets`,
          }]
          : []),
      ]),
    };
  });

  const recentRecords = [
    ...record.workouts.map((workout) => ({
      time: '—',
      kind: categoryKey(workout.category.id),
      title: workout.title,
      detail: `${workout.category.label} · ${durationLabel(workout.duration)}`,
      status: workout.reviewStatus,
      statusLabel: statusLabel(workout.reviewStatus),
    })),
    {
      time: 'Daily',
      kind: 'health',
      title: 'Recovery check-in',
      detail: `${record.dailyHealth.sleep.value} hours sleep · energy ${record.dailyHealth.energy.value}/5`,
      status: record.dailyHealth.reviewStatus,
      statusLabel: statusLabel(record.dailyHealth.reviewStatus),
    },
    {
      time: 'Today',
      kind: 'meal',
      title: 'Nutrition summary',
      detail: `${record.nutritionSummary.mealsRecorded.value} meals · protein ${record.nutritionSummary.proteinGramsRange.min}–${record.nutritionSummary.proteinGramsRange.max}g`,
      status: record.nutritionSummary.reviewStatus,
      statusLabel: statusLabel(record.nutritionSummary.reviewStatus),
    },
  ];

  return {
    title: 'Today record',
    dayLabel,
    dateIso: record.date,
    dateLabel,
    intro: 'Movement, meals and recovery in one quiet daily view. Uncertain details stay visible until you review them.',
    fixtureLabel: record.fixtureLabel,
    captureActions: [
      { key: 'workout', label: 'Log a workout', voiceContext: 'workout_summary' },
      { key: 'meal', label: 'Add a meal photo', voiceContext: 'meal_note' },
      { key: 'health', label: 'Daily health', voiceContext: 'daily_health_note' },
    ],
    reviewQueue: queue,
    coverageLabel: '5 fixture records · 1 unknown field',
    summaryStats: [
      {
        label: 'Training',
        value: `${record.summary.recordedTrainingMinutes}+`,
        unit: 'min',
        note: 'One duration unknown',
      },
      {
        label: 'Movement',
        value: record.summary.workoutCount,
        unit: 'sessions',
        note: `${record.summary.completedWorkoutCount} completed`,
      },
      {
        label: 'Review',
        value: record.summary.reviewCount,
        unit: 'items',
        note: 'Awaiting confirmation',
      },
      {
        label: 'Sleep',
        value: record.dailyHealth.sleep.value,
        unit: 'hours',
        note: 'Synthetic check-in',
      },
    ],
    trainingCategories,
    recentRecords,
  };
}
