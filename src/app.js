const icons = {
  today: '<path d="M4 6.5h16M7 3v4M17 3v4M6 10h4v4H6z"/>',
  dashboard: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
  plan: '<path d="M5 4h14v16H5zM8 2v4M16 2v4M8 10h8M8 14h5"/>',
  review: '<path d="M4 5h16v14H4zM8 9h8M8 13h5M16.5 16.5l1.5 1.5 3-3"/>',
  settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19 12l2-1-2-3-2 .5-1.5-1L15 5h-6l-.5 2.5-1.5 1L5 8l-2 3 2 1v2l-2 1 2 3 2-.5 1.5 1L9 21h6l.5-2.5 1.5-1 2 .5 2-3-2-1z"/>',
};

const navItems = [
  { label: 'Today Record', icon: 'today', active: true },
  { label: 'Dashboard', icon: 'dashboard' },
  { label: 'Plan', icon: 'plan' },
  { label: 'Review', icon: 'review', badge: '3' },
  { label: 'Settings', icon: 'settings' },
];

const icon = (name) => `
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    ${icons[name]}
  </svg>`;

document.querySelector('#app').innerHTML = `
  <div class="app-shell">
    <aside class="sidebar" aria-label="Primary navigation">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
        <span class="brand-copy"><strong>My form</strong><small>exercise journal</small></span>
      </div>

      <div class="sidebar-caption">DAILY PRACTICE</div>
      <nav class="nav-list">
        ${navItems.map((item) => `
          <button class="nav-item${item.active ? ' is-active' : ''}" type="button" aria-current="${item.active ? 'page' : 'false'}" title="${item.label}">
            <span class="nav-icon">${icon(item.icon)}</span>
            <span class="nav-label">${item.label}</span>
            ${item.badge ? `<span class="nav-badge" aria-label="${item.badge} items to review">${item.badge}</span>` : ''}
          </button>
        `).join('')}
      </nav>

      <div class="sidebar-foot">
        <div class="local-status"><span></span><span class="status-copy">Local only</span></div>
        <button class="profile" type="button" aria-label="Open local profile settings">
          <span class="profile-avatar">D</span>
          <span class="profile-copy"><strong>Diana</strong><small>Private profile</small></span>
          <span class="profile-more">···</span>
        </button>
      </div>
    </aside>

    <main class="review-stage">
      <div class="review-note">
        <span class="eyebrow">UI REVIEW · UNIT 01</span>
        <h1>Today begins<br/>with a clear page.</h1>
        <p>This canvas intentionally holds no daily-record UI yet. Review the sidebar, type scale, spacing and provisional sage accent first.</p>
        <div class="review-key">
          <span><i class="swatch warm"></i>Warm white</span>
          <span><i class="swatch sage"></i>Sage</span>
          <span><i class="swatch ink"></i>Soft ink</span>
        </div>
      </div>
      <div class="stage-mark" aria-hidden="true">01</div>
    </main>
  </div>`;
