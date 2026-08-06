export const reviewViewModel = Object.freeze({
  fixture: true,
  fixtureLabel: 'Synthetic fixture',
  title: 'Review inbox',
  intro: 'Compare source evidence with extracted fields before anything can become a confirmed fact.',
  source: {
    label: 'Meal photo · fixture-2026-08-06-01',
    capturedAt: 'Today · 12:42',
    placeholder: 'Synthetic source image placeholder',
  },
  summary: {
    needsReview: 3,
    confirmed: 1,
  },
  fields: [
    {
      id: 'meal-type',
      label: 'Meal type',
      value: 'Lunch',
      confidence: 96,
      status: 'confirmed',
      statusLabel: 'Confirmed',
    },
    {
      id: 'protein',
      label: 'Protein estimate',
      value: '31–39 g',
      confidence: 78,
      status: 'needs_review',
      statusLabel: 'Needs review',
    },
    {
      id: 'energy',
      label: 'Energy estimate',
      value: '520–640 kcal',
      confidence: 63,
      status: 'needs_review',
      statusLabel: 'Needs review',
    },
    {
      id: 'ingredients',
      label: 'Visible ingredients',
      value: 'Rice, greens, tofu',
      confidence: 71,
      status: 'needs_review',
      statusLabel: 'Needs review',
    },
  ],
});
