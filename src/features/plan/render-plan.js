const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const safeToken = (value, fallback = 'default') => {
  const token = String(value || fallback).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  return token || fallback;
};

const icons = {
  arrowLeft: '<path d="m14 6-6 6 6 6"/>',
  arrowRight: '<path d="m10 6 6 6-6 6"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  shield: '<path d="M12 3 5 6v5c0 4.7 2.8 8.3 7 10 4.2-1.7 7-5.3 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
};

const icon = (name) => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.calendar}</svg>`;

const renderDay = (day, todayIso) => {
  const isToday = day.iso === todayIso || day.state === 'today';
  const count = Number(day.activityCount) || 0;
  return `
    <button
      class="plan-day plan-day--${safeToken(day.state)}${isToday ? ' is-today' : ''}"
      type="button"
      data-action="select-plan-date"
      data-date="${escapeHtml(day.iso)}"
      aria-label="${escapeHtml(day.weekday)} ${escapeHtml(day.day)}, ${count} planned ${count === 1 ? 'session' : 'sessions'}${isToday ? ', today' : ''}"
      aria-pressed="${isToday ? 'true' : 'false'}"
    >
      <span>${escapeHtml(day.weekday)}</span>
      <strong>${escapeHtml(day.day)}</strong>
      <i class="plan-day__marker${count ? ' has-plan' : ''}" aria-hidden="true"></i>
    </button>`;
};

const renderOccurrence = (item) => `
  <li class="plan-session plan-session--${safeToken(item.category)}">
    <div class="plan-session__date">
      <time datetime="${escapeHtml(item.dateIso)}">${escapeHtml(item.dateLabel)}</time>
      <strong>${escapeHtml(item.startTime)}</strong>
    </div>
    <span class="plan-session__line" aria-hidden="true"></span>
    <div class="plan-session__body">
      <div class="plan-session__heading">
        <span class="plan-category plan-category--${safeToken(item.category)}">${escapeHtml(item.categoryLabel || item.category)}</span>
        <span class="plan-status plan-status--${safeToken(item.status)}">${escapeHtml(item.statusLabel || item.status)}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.detail)}</p>
      <dl class="plan-session__meta">
        <div><dt>Duration</dt><dd>${escapeHtml(item.durationMinutes)} min</dd></div>
        <div><dt>Timezone</dt><dd>${escapeHtml(item.timezone)}</dd></div>
      </dl>
    </div>
    <button class="plan-session__edit" type="button" data-action="edit-plan" data-plan-id="${escapeHtml(item.id)}" aria-label="Edit ${escapeHtml(item.title)}">
      Edit
    </button>
  </li>`;

const renderCategory = (category) => `
  <li class="plan-taxonomy__item plan-taxonomy__item--${safeToken(category.key)}">
    <span aria-hidden="true"></span>
    <div><strong>${escapeHtml(category.label)}</strong><small>${escapeHtml(category.count)} ${Number(category.count) === 1 ? 'session' : 'sessions'}</small></div>
    <b>${escapeHtml(category.minutes)}<small>min</small></b>
  </li>`;

const renderProjectionPreview = (projection) => {
  const items = Array.isArray(projection.previewItems) ? projection.previewItems : [];
  return items.length
    ? `<ol>${items.map((item) => `<li><span>${escapeHtml(item.title)}</span><time>${escapeHtml(item.when)}</time></li>`).join('')}</ol>`
    : '<p class="plan-calendar__empty">No planned events to preview.</p>';
};

/**
 * Renders the local weekly Plan surface from a serializable view model.
 * Buttons expose data-action hooks only. This renderer never performs persistence,
 * OAuth, Calendar reads, or Calendar writes.
 */
export const renderPlan = (viewModel = {}) => {
  const days = Array.isArray(viewModel.days) ? viewModel.days : [];
  const occurrences = Array.isArray(viewModel.occurrences) ? viewModel.occurrences : [];
  const categories = Array.isArray(viewModel.categorySummary) ? viewModel.categorySummary : [];
  const projection = viewModel.calendarProjection || {};

  return `
    <main class="plan-page" aria-labelledby="plan-page-title">
      <header class="plan-page__header">
        <div>
          <div class="plan-page__kicker">
            <span>WEEKLY RHYTHM</span>
            <span aria-hidden="true">·</span>
            <span>${escapeHtml(viewModel.timezone || 'Local timezone')}</span>
          </div>
          <h1 id="plan-page-title">${escapeHtml(viewModel.title || 'Plan the week')}</h1>
          <p>${escapeHtml(viewModel.intro || 'Give each planned session a clear place in the week.')}</p>
        </div>
        <div class="plan-fixture" role="status" aria-label="This page uses synthetic fixture data">
          <span aria-hidden="true"></span>
          ${escapeHtml(viewModel.fixtureLabel || 'Synthetic fixture')}
        </div>
      </header>

      <section class="plan-week" aria-labelledby="plan-week-title">
        <div class="plan-section-heading">
          <div>
            <span class="plan-section-index">01 / WEEK</span>
            <h2 id="plan-week-title">${escapeHtml(viewModel.weekLabel || 'Current week')}</h2>
          </div>
          <div class="plan-week__controls" aria-label="Week navigation">
            <button type="button" data-action="previous-week" aria-label="Previous week">${icon('arrowLeft')}</button>
            <button type="button" data-action="current-week">This week</button>
            <button type="button" data-action="next-week" aria-label="Next week">${icon('arrowRight')}</button>
          </div>
        </div>
        <div class="plan-week__strip" role="group" aria-label="Days in ${escapeHtml(viewModel.weekLabel || 'current week')}">
          ${days.map((day) => renderDay(day, viewModel.todayIso)).join('')}
        </div>
      </section>

      <div class="plan-page__layout">
        <section class="plan-schedule" aria-labelledby="plan-schedule-title">
          <div class="plan-section-heading">
            <div>
              <span class="plan-section-index">02 / TRAINING LIST</span>
              <h2 id="plan-schedule-title">${occurrences.length} ${occurrences.length === 1 ? 'session' : 'sessions'}, gently placed</h2>
            </div>
            <button class="plan-primary-button" type="button" data-action="add-plan">${icon('plus')} Add session</button>
          </div>
          ${occurrences.length
            ? `<ol class="plan-schedule__list">${occurrences.map(renderOccurrence).join('')}</ol>`
            : '<p class="plan-empty">No sessions are planned for this week.</p>'}
        </section>

        <aside class="plan-page__rail" aria-label="Plan context">
          <section class="plan-taxonomy" aria-labelledby="plan-taxonomy-title">
            <span class="plan-section-index">WEEKLY MIX</span>
            <h2 id="plan-taxonomy-title">Training directions</h2>
            <p>Fixture categories stay broad until your real equipment and exercise list is available.</p>
            <ul>${categories.map(renderCategory).join('')}</ul>
          </section>

          <section class="plan-calendar" aria-labelledby="plan-calendar-title">
            <div class="plan-calendar__topline">
              <span class="plan-calendar__icon">${icon('calendar')}</span>
              <div>
                <span>${escapeHtml(projection.connectionLabel || 'Not connected')}</span>
                <strong>${escapeHtml(projection.modeLabel || 'Preview only')}</strong>
              </div>
            </div>
            <h2 id="plan-calendar-title">${escapeHtml(projection.title || 'Google Calendar projection')}</h2>
            <p>${escapeHtml(projection.description || 'Calendar projection is disabled in this fixture.')}</p>
            <div class="plan-calendar__boundary">
              ${icon('shield')}
              <span><strong>No external write</strong>Local plans remain the source of truth.</span>
            </div>
            <div class="plan-calendar__preview">
              <div><span>Event preview</span><strong>${escapeHtml(projection.previewCount || 0)}</strong></div>
              ${renderProjectionPreview(projection)}
            </div>
            <button class="plan-calendar__button" type="button" data-action="preview-calendar" aria-describedby="plan-calendar-gate">
              Preview projection ${icon('arrowRight')}
            </button>
            <small id="plan-calendar-gate">Preview is local-only. Connection and write confirmation are separate future gates.</small>
          </section>
        </aside>
      </div>
    </main>`;
};
