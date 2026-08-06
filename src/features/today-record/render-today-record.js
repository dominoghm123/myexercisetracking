const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const icon = (name) => {
  const paths = {
    add: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
    cardio: '<path d="M3.5 12h3l2-5 3.5 10 2.5-7 2 2h4"/>',
    strength: '<path d="M7 9v6M17 9v6M4 10v4M20 10v4M7 12h10"/>',
    mobility: '<path d="M5 16c3-7 11-7 14 0M8 9.5a4 4 0 0 1 8 0"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    review: '<path d="M5 4h14v16H5zM8 9h8M8 13h5"/>',
  };

  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.review}</svg>`;
};

const categoryIcon = (key) => ['cardio', 'strength', 'mobility'].includes(key) ? key : 'review';

const renderQueueItem = (item) => `
  <li class="today-queue__item">
    <span class="today-queue__kind today-queue__kind--${escapeHtml(item.kind || 'note')}">${escapeHtml(item.kindLabel || item.kind || 'Record')}</span>
    <div class="today-queue__copy">
      <strong>${escapeHtml(item.title || 'Untitled record')}</strong>
      <span>${escapeHtml(item.meta || 'Details not yet reviewed')}</span>
    </div>
    <button class="today-icon-button" type="button" data-action="review" data-record-id="${escapeHtml(item.id || '')}" aria-label="Review ${escapeHtml(item.title || 'record')}">
      ${icon('arrow')}
    </button>
  </li>`;

const renderCategory = (category) => {
  const key = category.key || 'other';
  const entries = Array.isArray(category.entries) ? category.entries : [];
  const entryMarkup = entries.length
    ? entries.map((entry) => `<li><span>${escapeHtml(entry.label)}</span><strong>${escapeHtml(entry.value)}</strong></li>`).join('')
    : '<li class="today-category__empty">Nothing logged yet</li>';

  return `
    <article class="today-category today-category--${escapeHtml(key)}">
      <div class="today-category__topline">
        <span class="today-category__icon">${icon(categoryIcon(key))}</span>
        <span class="today-category__count">${escapeHtml(category.countLabel || '0 sessions')}</span>
      </div>
      <div>
        <p>${escapeHtml(category.eyebrow || 'Training direction')}</p>
        <h3>${escapeHtml(category.label || 'Other')}</h3>
      </div>
      <ul>${entryMarkup}</ul>
    </article>`;
};

const renderRecentRecord = (record) => `
  <li class="today-recent__item">
    <span class="today-recent__time">${escapeHtml(record.time || '—')}</span>
    <span class="today-recent__marker today-recent__marker--${escapeHtml(record.kind || 'note')}" aria-hidden="true"></span>
    <div class="today-recent__copy">
      <strong>${escapeHtml(record.title || 'Untitled record')}</strong>
      <span>${escapeHtml(record.detail || '')}</span>
    </div>
    <span class="today-state today-state--${escapeHtml(record.status || 'draft')}">${escapeHtml(record.statusLabel || 'Draft')}</span>
  </li>`;

/**
 * Render the Today Record visual unit from a plain, serializable view model.
 * The returned markup is inert: the parent app owns event delegation and persistence.
 */
export const renderTodayRecord = (viewModel = {}) => {
  const queue = Array.isArray(viewModel.reviewQueue) ? viewModel.reviewQueue : [];
  const categories = Array.isArray(viewModel.trainingCategories) ? viewModel.trainingCategories : [];
  const recentRecords = Array.isArray(viewModel.recentRecords) ? viewModel.recentRecords : [];
  const stats = Array.isArray(viewModel.summaryStats) ? viewModel.summaryStats : [];

  return `
    <main class="today-record" aria-labelledby="today-record-title">
      <header class="today-record__header">
        <div>
          <div class="today-record__meta">
            <span>${escapeHtml(viewModel.dayLabel || 'Today')}</span>
            <span aria-hidden="true">·</span>
            <time datetime="${escapeHtml(viewModel.dateIso || '')}">${escapeHtml(viewModel.dateLabel || 'Date not set')}</time>
          </div>
          <h1 id="today-record-title">${escapeHtml(viewModel.title || 'Today record')}</h1>
          <p>${escapeHtml(viewModel.intro || 'A quiet place to collect today\'s movement, meals and recovery.')}</p>
        </div>
        <div class="today-fixture" role="status" aria-label="This page uses synthetic fixture data">
          <span aria-hidden="true"></span>
          ${escapeHtml(viewModel.fixtureLabel || 'Synthetic fixture')}
        </div>
      </header>

      <div class="today-record__layout">
        <aside class="today-capture" aria-label="Capture and review queue">
          <section class="today-capture__new" aria-labelledby="quick-capture-title">
            <span class="today-section-index">01 / CAPTURE</span>
            <h2 id="quick-capture-title">What happened today?</h2>
            <p>Add a lightweight record now. Details can wait until review.</p>
            <div class="today-capture__actions">
              ${(viewModel.captureActions || [
                { key: 'workout', label: 'Log a workout' },
                { key: 'meal', label: 'Add a meal' },
                { key: 'health', label: 'Daily health' },
              ]).map((action, index) => `
                <button class="today-capture-button${index === 0 ? ' today-capture-button--primary' : ''}" type="button" data-action="capture-${escapeHtml(action.key)}"${action.voiceContext ? ` data-voice-context="${escapeHtml(action.voiceContext)}"` : ''}>
                  <span>${escapeHtml(action.label)}</span>
                  ${icon(index === 0 ? 'add' : 'arrow')}
                </button>`).join('')}
            </div>
          </section>

          <section class="today-queue" aria-labelledby="review-queue-title">
            <div class="today-section-heading">
              <div>
                <span class="today-section-index">02 / REVIEW</span>
                <h2 id="review-queue-title">Needs review</h2>
              </div>
              <span class="today-queue__total" aria-label="${queue.length} records need review">${queue.length}</span>
            </div>
            ${queue.length
              ? `<ul>${queue.map(renderQueueItem).join('')}</ul>`
              : '<p class="today-empty">Nothing is waiting. New captures will appear here before they become confirmed facts.</p>'}
          </section>
        </aside>

        <div class="today-diary">
          <section class="today-summary" aria-labelledby="daily-summary-title">
            <div class="today-section-heading">
              <div>
                <span class="today-section-index">DAILY PULSE</span>
                <h2 id="daily-summary-title">A glance, not a score</h2>
              </div>
              <span class="today-summary__coverage">${escapeHtml(viewModel.coverageLabel || 'Fixture coverage')}</span>
            </div>
            <dl class="today-summary__stats">
              ${stats.map((stat) => `
                <div>
                  <dt>${escapeHtml(stat.label)}</dt>
                  <dd>${escapeHtml(stat.value)}${stat.unit ? `<small>${escapeHtml(stat.unit)}</small>` : ''}</dd>
                  <span>${escapeHtml(stat.note || '')}</span>
                </div>`).join('')}
            </dl>
          </section>

          <section class="today-training" aria-labelledby="training-directions-title">
            <div class="today-section-heading">
              <div>
                <span class="today-section-index">TRAINING DIRECTIONS</span>
                <h2 id="training-directions-title">Three ways to move</h2>
              </div>
              <span class="today-training__note">Expandable fixtures</span>
            </div>
            <div class="today-training__grid">
              ${categories.map(renderCategory).join('')}
            </div>
          </section>

          <section class="today-recent" aria-labelledby="recent-records-title">
            <div class="today-section-heading">
              <div>
                <span class="today-section-index">TODAY'S TRAIL</span>
                <h2 id="recent-records-title">Recent records</h2>
              </div>
              <button class="today-text-button" type="button" data-action="view-all-records">View all ${icon('arrow')}</button>
            </div>
            ${recentRecords.length
              ? `<ul>${recentRecords.map(renderRecentRecord).join('')}</ul>`
              : '<p class="today-empty">No records captured today.</p>'}
          </section>
        </div>
      </div>
    </main>`;
};
