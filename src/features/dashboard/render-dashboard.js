const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const formatValue = (value, unit) => {
  if (value === null) return '—';
  return `${value}${unit === '%' ? '%' : unit ? ` ${unit}` : ''}`;
};

const statusLabel = (status) => ({
  missing: 'Not recorded',
  needs_review: 'Needs review',
  recorded: 'Recorded',
}[status] ?? status);

const trendSvg = (metric) => {
  if (metric.observations.length < 2) {
    return `
      <div class="dashboard-empty-trend" role="img" aria-label="No trend available for ${escapeHtml(metric.label)}">
        <span></span><span>Awaiting another measurement</span>
      </div>`;
  }

  const values = metric.observations.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const points = metric.observations.map((point, index) => {
    const x = 5 + (index * 90) / (metric.observations.length - 1);
    const y = 25 - ((point.value - min) / spread) * 20;
    return `${x},${y}`;
  }).join(' ');
  const description = metric.observations
    .map((point) => `${point.date}: ${formatValue(point.value, metric.unit)}`)
    .join('; ');

  return `
    <svg class="dashboard-sparkline" viewBox="0 0 100 30" role="img" aria-label="${escapeHtml(metric.label)} trend. ${escapeHtml(description)}" preserveAspectRatio="none">
      <line x1="5" y1="25" x2="95" y2="25" vector-effect="non-scaling-stroke"></line>
      <polyline points="${points}" vector-effect="non-scaling-stroke"></polyline>
      ${points.split(' ').map((point) => {
        const [cx, cy] = point.split(',');
        return `<circle cx="${cx}" cy="${cy}" r="1.8" vector-effect="non-scaling-stroke"></circle>`;
      }).join('')}
    </svg>`;
};

const metricCard = (metric) => `
  <article class="dashboard-metric${metric.status === 'missing' ? ' is-missing' : ''}">
    <div class="dashboard-card-heading">
      <p>${escapeHtml(metric.label)}</p>
      <span class="dashboard-state dashboard-state--${escapeHtml(metric.status)}">${escapeHtml(statusLabel(metric.status))}</span>
    </div>
    <div class="dashboard-metric-value">${formatValue(metric.latestValue, metric.unit)}</div>
    <div class="dashboard-metric-meta">
      ${metric.delta === null
        ? '<span>Trend unknown</span>'
        : `<span>${metric.delta > 0 ? '+' : ''}${metric.delta}${metric.unit ?? ''} from first fixture point</span>`}
      <span>${escapeHtml(metric.confidence)} confidence</span>
    </div>
    ${trendSvg(metric)}
  </article>`;

const coverageBar = (coverage, label) => `
  <div class="dashboard-coverage">
    <div><span>${escapeHtml(label)}</span><strong>${escapeHtml(coverage.label)}</strong></div>
    <div class="dashboard-coverage-track" role="progressbar" aria-label="${escapeHtml(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${coverage.percent ?? 0}">
      <span style="--coverage: ${coverage.percent ?? 0}%"></span>
    </div>
  </div>`;

export function renderDashboard(viewModel) {
  if (viewModel?.fixture !== true) {
    throw new TypeError('Dashboard renderer requires a visibly labelled fixture view model.');
  }

  return `
    <main class="dashboard-page" aria-labelledby="dashboard-title">
      <header class="dashboard-header">
        <div>
          <div class="dashboard-kicker">
            <span>${escapeHtml(viewModel.fixtureLabel)}</span>
            <span>Illustrative data only</span>
          </div>
          <h1 id="dashboard-title">Weekly dashboard</h1>
          <p>${escapeHtml(viewModel.weekLabel)} <i></i> ${escapeHtml(viewModel.throughLabel)}</p>
        </div>
        <aside class="dashboard-evidence dashboard-evidence--${escapeHtml(viewModel.evidence.state)}" aria-label="Weekly evidence coverage">
          <strong>${viewModel.evidence.coverage.percent}%</strong>
          <span>daily coverage</span>
          <small>${escapeHtml(viewModel.evidence.note)}</small>
        </aside>
      </header>

      <div class="dashboard-section-heading">
        <div><span>01</span><h2>Body direction</h2></div>
        <p>Primary composition signals, shown with measurement confidence.</p>
      </div>
      <div class="dashboard-metric-grid">
        ${viewModel.primaryMetrics.map(metricCard).join('')}
      </div>

      <div class="dashboard-section-heading dashboard-section-heading--signals">
        <div><span>02</span><h2>This week’s signals</h2></div>
        <p>Completion is separate from data quality.</p>
      </div>
      <div class="dashboard-signal-grid">
        <article class="dashboard-signal dashboard-signal--training">
          <div class="dashboard-card-heading"><p>Training</p><span class="dashboard-state dashboard-state--needs_review">Needs review</span></div>
          <div class="dashboard-signal-lead"><strong>${viewModel.training.completion.recorded}/${viewModel.training.completion.expected}</strong><span>sessions completed</span></div>
          <dl><div><dt>Known duration</dt><dd>${viewModel.training.recordedMinutes} min</dd></div><div><dt>Known load volume</dt><dd>${viewModel.training.loadVolumeKg.toLocaleString()} kg</dd></div></dl>
          ${coverageBar(viewModel.training.loadCoverage, 'Load coverage')}
          <p class="dashboard-caution">${escapeHtml(viewModel.training.note)}</p>
        </article>

        <article class="dashboard-signal">
          <div class="dashboard-card-heading"><p>Protein</p><span class="dashboard-state dashboard-state--low">Low confidence</span></div>
          <div class="dashboard-signal-lead"><strong>${viewModel.nutrition.proteinGramsMedian} g</strong><span>median on recorded days</span></div>
          ${coverageBar(viewModel.nutrition.coverage, 'Protein coverage')}
          <p class="dashboard-caution">${escapeHtml(viewModel.nutrition.note)}</p>
        </article>

        <article class="dashboard-signal">
          <div class="dashboard-card-heading"><p>Sleep & recovery</p><span class="dashboard-state dashboard-state--needs_review">Needs review</span></div>
          <div class="dashboard-signal-lead"><strong>${viewModel.recovery.sleepHoursAverage} h</strong><span>average sleep</span></div>
          ${coverageBar(viewModel.recovery.sleepCoverage, 'Sleep coverage')}
          <dl><div><dt>Energy</dt><dd>${viewModel.recovery.energyAverage}/5</dd></div><div><dt>Soreness</dt><dd>${viewModel.recovery.sorenessAverage ?? 'Unknown'}</dd></div></dl>
          <p class="dashboard-caution">${escapeHtml(viewModel.recovery.note)}</p>
        </article>
      </div>

      <aside class="dashboard-context" aria-label="Secondary context">
        <div><span>Secondary context</span><h2>${escapeHtml(viewModel.contextMetric.label)}</h2></div>
        <strong>${formatValue(viewModel.contextMetric.latestValue, viewModel.contextMetric.unit)}</strong>
        <p>Weight is context only. It does not override body-composition, training, or recovery signals.</p>
      </aside>
    </main>`;
}
