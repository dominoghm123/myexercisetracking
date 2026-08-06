export const settingsViewModel = Object.freeze({
  fixture: true,
  fixtureLabel: 'Synthetic fixture · preview only',
  title: 'Settings',
  intro: 'Local preferences and data boundaries, visible before any persistence is enabled.',
  sections: [
    {
      id: 'profile',
      index: '01',
      eyebrow: 'LOCAL PROFILE',
      title: 'Profile & units',
      description: 'Private defaults for this device.',
      rows: [
        { label: 'Profile name', value: 'Diana (fixture)', state: 'Preview' },
        { label: 'Weight unit', value: 'Kilograms (kg)', state: 'Local' },
        { label: 'Distance unit', value: 'Kilometres (km)', state: 'Local' },
      ],
    },
    {
      id: 'privacy',
      index: '02',
      eyebrow: 'PRIVACY',
      title: 'Local by default',
      description: 'Nothing leaves the device in MVP 0.1.',
      rows: [
        { label: 'External AI processing', value: 'Off', state: 'Protected', tone: 'safe' },
        { label: 'Analytics & telemetry', value: 'Off', state: 'Protected', tone: 'safe' },
        { label: 'Source images', value: 'Local evidence only', state: 'Private' },
      ],
    },
    {
      id: 'voice',
      index: '03',
      eyebrow: 'VOICE CAPTURE',
      title: 'Microphone input',
      description: 'Deferred capture port for sets, coaching cues, workout summaries, meals, and health notes.',
      rows: [
        { label: 'Microphone permission', value: 'Not requested', state: 'Gated', tone: 'gated' },
        { label: 'Processing preference', value: 'Local first', state: 'Planned' },
        { label: 'Transcript authority', value: 'Needs user review', state: 'Protected', tone: 'safe' },
      ],
    },
    {
      id: 'obsidian',
      index: '04',
      eyebrow: 'OBSIDIAN PROJECTION',
      title: 'Readable notes, not authority',
      description: 'Obsidian notes are derived and regenerable. SQLite remains the future structured source of truth.',
      rows: [
        { label: 'Projection path', value: 'Vault/Exercise Journal/', state: 'Not connected' },
        { label: 'Write direction', value: 'Source of truth → notes', state: 'One way' },
      ],
    },
    {
      id: 'backup',
      index: '05',
      eyebrow: 'BACKUP',
      title: 'Local backup summary',
      description: 'Backup actions are staged until real-data storage exists.',
      rows: [
        { label: 'Last backup', value: 'No backup yet', state: 'Empty' },
        { label: 'Included data', value: 'Database + original evidence', state: 'Planned' },
      ],
    },
    {
      id: 'calendar',
      index: '06',
      eyebrow: 'GOOGLE CALENDAR',
      title: 'Calendar connection',
      description: 'Calendar writes require a separate explicit approval gate.',
      rows: [
        { label: 'Connection', value: 'Disconnected', state: 'Gated', tone: 'gated' },
        { label: 'Write permission', value: 'Not requested', state: 'Off' },
      ],
    },
  ],
});
