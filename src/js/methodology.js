/**
 * Scientific Methodology Controller for Chemical Awareness
 * Renders the 5-Factor scoring model, point maximums, calculation formula,
 * score bands, limitations, and educational disclaimers.
 * Data source: public/data/methodology.json
 */

import { fetchMethodologyData } from './data.js';
import { initNavigation } from './ui.js';

export async function initMethodologyPage() {
  if (typeof document === 'undefined') return;
  initNavigation();

  const container = document.getElementById('methodology-container');
  if (!container) return;

  container.innerHTML = `
    <div class="loading-state" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p>Loading scoring methodology...</p>
    </div>
  `;

  try {
    const data = await fetchMethodologyData();
    if (!data) {
      container.innerHTML = `<p class="error-notice">Failed to load methodology specifications.</p>`;
      return;
    }

    renderMethodology(container, data);
  } catch (error) {
    console.error('Error loading methodology:', error);
    container.innerHTML = `<p class="error-notice">An error occurred while loading methodology.</p>`;
  }
}

export function renderMethodology(container, data) {
  // 1. Scoring Factors HTML
  const factorsHTML = (data.scoringFactors || []).map((f, idx) => `
    <article class="dimension-card">
      <div class="dimension-header">
        <div>
          <span class="factor-num">Factor ${idx + 1}</span>
          <h3>${escapeHTML(f.name)}</h3>
        </div>
        <span class="dimension-weight">${f.maxPoints} Points Max</span>
      </div>
      <p class="dimension-criteria">${escapeHTML(f.description)}</p>
    </article>
  `).join('');

  // 2. Score Bands HTML
  const bandsHTML = (data.scoreBands || []).map(band => `
    <div class="tier-card tier-${band.badgeClass}">
      <div class="tier-header">
        <span class="badge ${band.badgeClass}">${escapeHTML(band.label)}</span>
        <span class="tier-range">Scale: ${escapeHTML(band.range)}</span>
      </div>
      <p class="tier-desc">${escapeHTML(band.description)}</p>
    </div>
  `).join('');

  // 3. Limitations HTML
  const limitationsHTML = (data.limitations || []).map(lim => `
    <li class="limitation-item">
      <svg class="icon-bullet" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <span>${escapeHTML(lim)}</span>
    </li>
  `).join('');

  // 4. Regulatory Sources HTML
  const sourcesHTML = (data.authoritativeSources || []).map(src => `
    <div class="source-card">
      <div class="source-code-badge">${escapeHTML(src.code)}</div>
      <h4>${escapeHTML(src.organization)}</h4>
      <p>${escapeHTML(src.description)}</p>
    </div>
  `).join('');

  container.innerHTML = `
    <!-- Page Header -->
    <header class="page-intro">
      <div class="badge badge-verified">College Research Methodology v${escapeHTML(data.version || '2.0')}</div>
      <h1>${escapeHTML(data.title)}</h1>
      <p class="intro-lead">${escapeHTML(data.purpose)}</p>
    </header>

    <!-- Important Notice Alert -->
    <div class="disclaimer-banner" role="alert" aria-label="Important Scoring Notice">
      <div class="disclaimer-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div class="disclaimer-content">
        <h4>Important Educational Notice</h4>
        <p><strong>${escapeHTML(data.disclaimer)}</strong></p>
        <p class="notice-sub">Higher score means: <em>"${escapeHTML(data.scoreInterpretation)}"</em></p>
      </div>
    </div>

    <!-- 1. Five Scoring Factors -->
    <section class="methodology-section" aria-labelledby="factors-heading">
      <div class="section-header-wrap">
        <h2 id="factors-heading">1. Five Scoring Factors</h2>
        <span class="count-tag">Total = ${data.totalMaximumPoints} Points</span>
      </div>
      <p class="section-lead">The Chemical Awareness Score integrates five distinct toxicological and behavioral dimensions to evaluate consumer product formulations:</p>
      <div class="dimensions-grid">
        ${factorsHTML}
      </div>
    </section>

    <!-- 2. Score Calculation Formula -->
    <section class="methodology-section" aria-labelledby="calculation-heading">
      <h2 id="calculation-heading">2. Score Calculation Formula</h2>
      <div class="calc-formula-card">
        <div class="formula-box">
          <span class="formula-label">Displayed Score Formula</span>
          <code>displayedScore = max(1.0, totalPoints / 10)</code>
        </div>
        <p class="calc-desc">${escapeHTML(data.scoreCalculation?.description || '')}</p>
        
        <div class="calc-example-box">
          <h4>Calculation Example</h4>
          <ol class="example-steps">
            <li><strong>Sum Factor Points:</strong> e.g., 20 (concern) + 12 (exposure) + 10 (frequency) + 14 (evidence) + 6 (concern areas) = <strong>62 Total Points</strong> (out of 100).</li>
            <li><strong>Normalize to 10-point scale:</strong> 62 / 10 = <strong>6.2</strong>.</li>
            <li><strong>Apply minimum floor:</strong> <code>max(1.0, 6.2)</code> = <strong>6.2</strong> &rarr; <em>Moderate identified concern</em>.</li>
          </ol>
        </div>
      </div>
    </section>

    <!-- 3. Score Bands -->
    <section class="methodology-section" aria-labelledby="bands-heading">
      <h2 id="bands-heading">3. Score Bands & Classifications</h2>
      <p class="section-lead">Displayed scores fall into three defined awareness bands:</p>
      <div class="tiers-grid">
        ${bandsHTML}
      </div>
    </section>

    <!-- 4. Limitations -->
    <section class="methodology-section" aria-labelledby="limitations-heading">
      <h2 id="limitations-heading">4. Project Scope & Limitations</h2>
      <p class="section-lead">Users and evaluators should consider the following academic and data boundaries:</p>
      <div class="limitations-card">
        <ul class="limitations-list">
          ${limitationsHTML}
        </ul>
      </div>
    </section>

    <!-- 5. Authoritative Sources -->
    <section class="methodology-section" aria-labelledby="sources-heading">
      <h2 id="sources-heading">5. Authoritative Regulatory & Scientific Databases</h2>
      <p class="section-lead">Scoring criteria are referenced against public monographs from international safety and regulatory authorities:</p>
      <div class="sources-grid">
        ${sourcesHTML}
      </div>
    </section>
  `;
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initMethodologyPage);
}
