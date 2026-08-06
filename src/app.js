import { dailyRecordViewModel } from './domain/daily-record-view-model.js';
import { dashboardViewModel } from './features/dashboard/dashboard-view-model.js';
import { renderDashboard } from './features/dashboard/render-dashboard.js';
import { planViewModel } from './features/plan/plan-view-model.js';
import { renderPlan } from './features/plan/render-plan.js';
import { reviewViewModel } from './features/review/review-view-model.js';
import { renderReview } from './features/review/render-review.js';
import { settingsViewModel } from './features/settings/settings-view-model.js';
import { renderSettings } from './features/settings/render-settings.js';
import { mapDailyRecordViewModel } from './features/today-record/map-daily-record-view.js';
import { renderTodayRecord } from './features/today-record/render-today-record.js';

const icons = {
  today: '<path d="M4 6.5h16M7 3v4M17 3v4M6 10h4v4H6z"/>',
  dashboard: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
  plan: '<path d="M5 4h14v16H5zM8 2v4M16 2v4M8 10h8M8 14h5"/>',
  review: '<path d="M4 5h16v14H4zM8 9h8M8 13h5M16.5 16.5l1.5 1.5 3-3"/>',
  settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19 12l2-1-2-3-2 .5-1.5-1L15 5h-6l-.5 2.5-1.5 1L5 8l-2 3 2 1v2l-2 1 2 3 2-.5 1.5 1L9 21h6l.5-2.5 1.5-1 2 .5 2-3-2-1z"/>',
};

const icon = (name) => `
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    ${icons[name]}
  </svg>`;

const navItems = [
  { key: 'today', label: 'Today Record', icon: 'today' },
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'plan', label: 'Plan', icon: 'plan' },
  { key: 'review', label: 'Review', icon: 'review', badge: String(dailyRecordViewModel.summary.reviewCount) },
  { key: 'settings', label: 'Settings', icon: 'settings' },
];

const pages = {
  today: {
    label: 'Today Record',
    render: () => renderTodayRecord(mapDailyRecordViewModel(dailyRecordViewModel)),
  },
  dashboard: { label: 'Dashboard', render: () => renderDashboard(dashboardViewModel) },
  plan: { label: 'Plan', render: () => renderPlan(planViewModel) },
  review: { label: 'Review', render: () => renderReview(reviewViewModel) },
  settings: { label: 'Settings', render: () => renderSettings(settingsViewModel) },
};

const routeFromHash = () => {
  const route = window.location.hash.slice(1).toLowerCase();
  return Object.hasOwn(pages, route) ? route : 'today';
};

document.querySelector('#app').innerHTML = `
  <div class="app-shell">
    <aside class="sidebar" aria-label="Primary navigation">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
        <span class="brand-copy"><strong>My form</strong><small>exercise journal</small></span>
      </div>

      <div class="sidebar-caption">DAILY PRACTICE</div>
      <nav class="nav-list">
        ${navItems.map((item) => `
          <button class="nav-item" type="button" data-route="${item.key}" title="${item.label}">
            <span class="nav-icon">${icon(item.icon)}</span>
            <span class="nav-label">${item.label}</span>
            ${item.badge ? `<span class="nav-badge" aria-label="${item.badge} items to review">${item.badge}</span>` : ''}
          </button>
        `).join('')}
      </nav>

      <div class="sidebar-foot">
        <div class="local-status"><span></span><span class="status-copy">Local only</span></div>
        <button class="profile" type="button" data-route="settings" aria-label="Open local profile settings">
          <span class="profile-avatar">D</span>
          <span class="profile-copy"><strong>Diana</strong><small>Private profile</small></span>
          <span class="profile-more">···</span>
        </button>
      </div>
    </aside>

    <div class="app-content">
      <div id="page-root"></div>
      <div class="app-toast" role="status" aria-live="polite" hidden></div>
    </div>
  </div>`;

const pageRoot = document.querySelector('#page-root');
const toast = document.querySelector('.app-toast');
let toastTimer;

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

function renderRoute() {
  const route = routeFromHash();
  pageRoot.innerHTML = pages[route].render();
  document.title = `My Exercise Tracking · ${pages[route].label}`;
  document.querySelectorAll('[data-route]').forEach((button) => {
    const active = button.dataset.route === route;
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

document.addEventListener('click', (event) => {
  const routeButton = event.target.closest('[data-route]');
  if (routeButton) {
    const route = routeButton.dataset.route;
    if (routeFromHash() !== route) window.location.hash = route;
    return;
  }

  const disabledPreview = event.target.closest('[aria-disabled="true"]');
  if (disabledPreview) {
    event.preventDefault();
    showToast('Preview only in MVP 0.1. No data, setting, or confirmation state was changed.');
    return;
  }

  const action = event.target.closest('[data-action]');
  if (!action) return;

  if (action.dataset.action.startsWith('capture-')) {
    const kind = action.dataset.action.replace('capture-', '').replace('-', ' ');
    showToast(`Capture ${kind} is staged for the real-data slice. Voice context is reserved; no microphone permission was requested.`);
    return;
  }

  if (action.dataset.action === 'review') {
    window.location.hash = 'review';
    return;
  }

  if (action.dataset.action === 'view-all-records') {
    showToast('All five fixture records are already shown in Today\'s Trail.');
    return;
  }

  if (action.dataset.action === 'select-plan-date') {
    document.querySelectorAll('[data-action="select-plan-date"]').forEach((day) => {
      const selected = day === action;
      day.classList.toggle('is-today', selected);
      day.setAttribute('aria-pressed', String(selected));
    });
    showToast(`Selected ${action.dataset.date} in this local fixture preview.`);
    return;
  }

  showToast('Preview only in MVP 0.1. This action does not persist data or contact an external service.');
});

window.addEventListener('hashchange', renderRoute);
renderRoute();
