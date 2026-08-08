const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const renderField = (field) => `
  <li class="review-field">
    <div class="review-field__identity">
      <span>${escapeHtml(field.label)}</span>
      <strong>${escapeHtml(field.value)}</strong>
    </div>
    <div class="review-confidence" aria-label="${escapeHtml(field.confidence)} percent extraction confidence">
      <span>Confidence</span>
      <strong>${escapeHtml(field.confidence)}%</strong>
      <span class="review-confidence__track" aria-hidden="true">
        <span style="--review-confidence: ${escapeHtml(field.confidence)}%"></span>
      </span>
    </div>
    <span class="review-status review-status--${escapeHtml(field.status)}">${escapeHtml(field.statusLabel)}</span>
    <button class="review-confirm-button" type="button" aria-disabled="true" aria-describedby="review-preview-note">
      ${field.status === 'confirmed' ? 'Confirmed' : 'Confirm field'}
    </button>
  </li>`;

export function renderReview(viewModel = {}) {
  if (viewModel.fixture !== true) {
    throw new TypeError('Review preview only renders explicitly labelled fixture data.');
  }

  const fields = Array.isArray(viewModel.fields) ? viewModel.fields : [];
  const candidate = viewModel.batchUpdateCandidate;
  const candidateOperation = candidate?.operations?.[0];
  const candidateField = candidateOperation?.fields?.[0];

  return `
    <main class="review-page" aria-labelledby="review-title">
      <header class="review-page__header">
        <div>
          <span class="review-kicker">REVIEW / EVIDENCE FIRST</span>
          <h1 id="review-title">${escapeHtml(viewModel.title || 'Review inbox')}</h1>
          <p>${escapeHtml(viewModel.intro || '')}</p>
        </div>
        <span class="review-fixture" role="status">${escapeHtml(viewModel.fixtureLabel || 'Synthetic fixture')}</span>
      </header>

      <section class="review-counts" aria-label="Review status summary">
        <div><strong>${escapeHtml(viewModel.summary?.needsReview ?? 0)}</strong><span>Needs review</span></div>
        <div><strong>${escapeHtml(viewModel.summary?.confirmed ?? 0)}</strong><span>Confirmed</span></div>
        <p id="review-preview-note">Preview-only controls. No fixture status, file, or database record will be changed.</p>
      </section>

      <section class="review-batch-card" aria-labelledby="batch-candidate-title">
        <div>
          <span class="review-kicker">VOICE / MODEL CANDIDATE</span>
          <h2 id="batch-candidate-title">Suggested batch update</h2>
          <p>Fixture preview only. This proposal will remain outside SQLite until a future explicit confirmation flow exists.</p>
        </div>
        <dl class="review-batch-meta">
          <div><dt>Operation</dt><dd>${escapeHtml(candidateOperation?.op || '—')}</dd></div>
          <div><dt>Target</dt><dd>${escapeHtml(candidateOperation?.target?.date || '—')} · ${escapeHtml(candidateOperation?.target?.context || '—')}</dd></div>
          <div><dt>Field</dt><dd>${escapeHtml(candidateField?.path || '—')}</dd></div>
          <div><dt>Confidence</dt><dd>${Math.round((candidateField?.confidence || 0) * 100)}%</dd></div>
        </dl>
        <button class="review-confirm-all" type="button" aria-disabled="true" aria-describedby="review-preview-note">Preview candidate</button>
      </section>

      <section class="review-workbench" aria-label="Source comparison workbench">
        <figure class="review-source">
          <div class="review-source__placeholder" role="img" aria-label="${escapeHtml(viewModel.source?.placeholder || 'Synthetic source image placeholder')}">
            <span aria-hidden="true">IMAGE</span>
            <strong>${escapeHtml(viewModel.source?.placeholder || 'Synthetic source image placeholder')}</strong>
          </div>
          <figcaption>
            <strong>${escapeHtml(viewModel.source?.label || 'Fixture source')}</strong>
            <span>${escapeHtml(viewModel.source?.capturedAt || '')}</span>
          </figcaption>
        </figure>

        <div class="review-extraction">
          <div class="review-extraction__heading">
            <div>
              <span>EXTRACTED FIELDS</span>
              <h2>Check each interpretation</h2>
            </div>
            <button class="review-confirm-all" type="button" aria-disabled="true" aria-describedby="review-preview-note">Confirm all</button>
          </div>
          <ul class="review-fields">${fields.map(renderField).join('')}</ul>
        </div>
      </section>
    </main>`;
}
