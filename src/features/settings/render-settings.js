const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const renderRow = (row) => `
  <li class="settings-row">
    <span class="settings-row__label">${escapeHtml(row.label)}</span>
    <strong>${escapeHtml(row.value)}</strong>
    <span class="settings-state${row.tone ? ` settings-state--${escapeHtml(row.tone)}` : ''}">${escapeHtml(row.state)}</span>
  </li>`;

const renderSection = (section) => `
  <article class="settings-card settings-card--${escapeHtml(section.id)}" aria-labelledby="settings-${escapeHtml(section.id)}-title">
    <header class="settings-card__header">
      <span class="settings-card__index" aria-hidden="true">${escapeHtml(section.index)}</span>
      <div>
        <span class="settings-card__eyebrow">${escapeHtml(section.eyebrow)}</span>
        <h2 id="settings-${escapeHtml(section.id)}-title">${escapeHtml(section.title)}</h2>
        <p>${escapeHtml(section.description)}</p>
      </div>
    </header>
    <ul>${section.rows.map(renderRow).join('')}</ul>
    <button class="settings-preview-button" type="button" aria-disabled="true" aria-describedby="settings-preview-note">
      ${section.id === 'calendar' ? 'Connection gated' : 'Edit preview'}
    </button>
  </article>`;

export function renderSettings(viewModel = {}) {
  if (viewModel.fixture !== true) {
    throw new TypeError('Settings preview only renders explicitly labelled fixture data.');
  }

  const sections = Array.isArray(viewModel.sections) ? viewModel.sections : [];

  return `
    <main class="settings-page" aria-labelledby="settings-title">
      <header class="settings-page__header">
        <div>
          <span class="settings-kicker">LOCAL SYSTEM / BOUNDARIES</span>
          <h1 id="settings-title">${escapeHtml(viewModel.title || 'Settings')}</h1>
          <p>${escapeHtml(viewModel.intro || '')}</p>
        </div>
        <span class="settings-fixture" role="status">${escapeHtml(viewModel.fixtureLabel || 'Synthetic fixture · preview only')}</span>
      </header>

      <p class="settings-preview-note" id="settings-preview-note">
        Preview-only: these controls do not persist preferences, connect services, write notes, or create database records.
      </p>

      <section class="settings-grid" aria-label="Settings preview sections">
        ${sections.map(renderSection).join('')}
      </section>
    </main>`;
}
