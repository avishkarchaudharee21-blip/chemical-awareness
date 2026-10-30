/**
 * Survey Results Controller for Chemical Awareness
 * 
 * Supports both pending ('no_data') and populated survey states.
 * When data is pending, displays: "Survey results not yet available."
 * Prepared to handle future structured fields:
 * - respondents
 * - category
 * - brand
 * - count
 * - percentage
 * - other responses
 * - observations
 */

import { fetchSurveyData } from './data.js';
import { initNavigation } from './ui.js';

export async function initSurveyPage() {
  if (typeof document === 'undefined') return;
  initNavigation();

  const container = document.getElementById('survey-container');
  if (!container) return;

  container.innerHTML = `
    <div class="loading-state" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p>Checking survey registry...</p>
    </div>
  `;

  try {
    const data = await fetchSurveyData();
    if (!data) {
      renderNoDataState(container, 'Survey results not yet available.');
      return;
    }

    renderSurvey(container, data);
  } catch (error) {
    console.error('Error loading survey:', error);
    renderNoDataState(container, 'Survey results not yet available.');
  }
}

export function renderSurvey(container, data) {
  // Check if survey data is in 'no_data' status or missing respondents/categories
  const hasNoData = !data || 
                    data.status === 'no_data' || 
                    data.respondents === null || 
                    data.respondents === undefined || 
                    !Array.isArray(data.categories) || 
                    data.categories.length === 0;

  if (hasNoData) {
    renderNoDataState(container, 'Survey results not yet available.', data);
    return;
  }

  // Populated Survey State (for future data ingestion)
  const respondentsCount = data.respondents !== null && data.respondents !== undefined ? data.respondents : 'N/A';
  const collectedOnDate = data.collectedOn 
    ? new Date(data.collectedOn).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Not Specified';

  // Categories Breakdown Table (Category, Brand, Count, Percentage, Other Responses)
  const categoriesHTML = (data.categories || []).map(cat => {
    const catRespondents = cat.respondents !== undefined && cat.respondents !== null ? cat.respondents : respondentsCount;
    const denominatorText = cat.denominatorNote || `${catRespondents} respondents answered this category`;

    // Sort brands descending by count
    const sortedBrands = Array.isArray(cat.brands)
      ? [...cat.brands].sort((a, b) => (b.count || 0) - (a.count || 0))
      : [];

    const brandsHTML = sortedBrands.length > 0
      ? sortedBrands.map(b => {
          const brandLabel = b.name || b.brand || 'Unspecified Brand';
          const isLinkable = b.productId && !b.isNonBrand && !b.isOther;
          const brandDisplay = isLinkable
            ? `<a href="product.html?id=${encodeURIComponent(b.productId)}" class="product-inline-link"><strong>${escapeHTML(brandLabel)}</strong> <span class="inline-tag">View Product</span></a>`
            : `<span><strong>${escapeHTML(brandLabel)}</strong>${b.isNonBrand ? ' <em class="text-muted">(Non-brand response)</em>' : ''}${b.isOther ? ' <em class="text-muted">(Write-in / Unlisted)</em>' : ''}</span>`;

          const countVal = b.count !== undefined && b.count !== null ? b.count : 0;
          const pctVal = b.percentage !== undefined && b.percentage !== null ? b.percentage : (catRespondents > 0 ? Math.round((countVal / catRespondents) * 1000) / 10 : 0);

          return `
          <tr>
            <td class="brand-cell">${brandDisplay}</td>
            <td class="count-cell"><strong>${countVal}</strong></td>
            <td class="percentage-cell">
              <div class="survey-bar-cell">
                <span class="pct-text">${pctVal}%</span>
                <div class="survey-progress-track" role="progressbar" aria-valuenow="${pctVal}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHTML(brandLabel)}: ${pctVal}% of responses in ${escapeHTML(cat.category)}">
                  <div class="survey-progress-fill" style="width: ${Math.min(pctVal, 100)}%"></div>
                </div>
              </div>
            </td>
            <td class="notes-cell">${b.otherResponses ? escapeHTML(b.otherResponses) : '<span class="text-subtle">-</span>'}</td>
          </tr>
        `;
        }).join('')
      : `<tr><td colspan="4" class="text-muted">No specific brand counts recorded</td></tr>`;

    const otherSummaryHTML = cat.otherCount && cat.otherCount > 0
      ? `<div class="other-count-note"><strong>Other / Unlisted mentions:</strong> Recorded ${cat.otherCount} responses in this category.</div>`
      : '';

    return `
      <section class="survey-category-block" aria-labelledby="cat-heading-${escapeHTML(cat.categoryKey || cat.category)}">
        <div class="category-summary-header">
          <div>
            <h3 id="cat-heading-${escapeHTML(cat.categoryKey || cat.category)}">${escapeHTML(cat.category || cat.name || 'Category')}</h3>
            <p class="category-denominator-note">${escapeHTML(denominatorText)}</p>
          </div>
          <div class="cat-stat-pills">
            <span class="stat-pill">Responses: <strong>${catRespondents}</strong></span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="chemical-table survey-table" aria-label="Survey results for ${escapeHTML(cat.category || cat.name)}">
            <thead>
              <tr>
                <th scope="col" style="width: 32%;">Surveyed Brand / Option</th>
                <th scope="col" style="width: 12%;">Count</th>
                <th scope="col" style="width: 30%;">Share / Distribution</th>
                <th scope="col" style="width: 26%;">Notes / Context</th>
              </tr>
            </thead>
            <tbody>
              ${brandsHTML}
            </tbody>
          </table>
        </div>
        ${otherSummaryHTML}
      </section>
    `;
  }).join('');

  // Observations Section
  const observationsHTML = Array.isArray(data.observations) && data.observations.length > 0
    ? `
      <section class="detail-section survey-observations-section" aria-labelledby="observations-heading">
        <h2 id="observations-heading" class="section-title">Key Survey Observations & Literacy Analysis</h2>
        <div class="observations-cards-grid">
          ${data.observations.map(obs => `
            <div class="observation-card">
              <div class="observation-icon" aria-hidden="true">💡</div>
              <p class="observation-text">${escapeHTML(obs)}</p>
            </div>
          `).join('')}
        </div>
      </section>
    `
    : '';

  container.innerHTML = `
    <header class="page-intro">
      <div class="academic-tag">Consumer Chemical Literacy Survey</div>
      <h1>College Survey Results</h1>
      <p class="intro-lead">Empirical findings from <strong>${respondentsCount} student survey participants</strong> evaluating daily product choices, brand market penetration, and category usage frequency across campus cohorts.</p>
      
      <div class="survey-meta-pills">
        <span class="meta-pill">Total Survey Participants: <strong>${respondentsCount}</strong></span>
        <span class="meta-pill">Collection Date: <strong>${collectedOnDate}</strong></span>
        <span class="meta-pill">Selection Mode: <strong>Single Choice (Most Frequently Used)</strong></span>
      </div>
    </header>

    <div class="survey-data-sections">
      ${categoriesHTML}
    </div>

    ${observationsHTML}
  `;
}

function renderNoDataState(container, mainMessage, data = {}) {
  container.innerHTML = `
    <!-- Page Header -->
    <header class="page-intro">
      <div class="academic-tag">College Research Survey</div>
      <h1>Chemical Awareness Survey</h1>
      <p class="intro-lead">Campus-wide research evaluating consumer understanding of product chemical formulations, hazard awareness, and label transparency.</p>
    </header>

    <!-- Empty / Pending Survey State Card -->
    <section class="survey-pending-card" aria-label="Survey Status">
      <div class="pending-icon-wrap" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      </div>

      <h2 class="pending-title">${escapeHTML(mainMessage)}</h2>
      <p class="pending-desc">
        The Chemical Awareness project survey data collection and response aggregation are currently underway. No official response counts or statistics have been published yet for this academic cohort.
      </p>

      <div class="pending-schema-preview">
        <h4>Prepared Data Pipeline Structure</h4>
        <p class="schema-note">Once the sampling window concludes, this page will dynamically display aggregated metrics across the following dimensions:</p>
        
        <div class="schema-tags-grid">
          <div class="schema-tag-item">
            <span class="tag-title">Total Respondents</span>
            <span class="tag-desc">Verified sample count across student and campus cohorts</span>
          </div>
          <div class="schema-tag-item">
            <span class="tag-title">Category Breakdown</span>
            <span class="tag-desc">Distribution across all 8 consumer product categories</span>
          </div>
          <div class="schema-tag-item">
            <span class="tag-title">Brand Usage Counts</span>
            <span class="tag-desc">Specific consumer product brands and formulation mentions</span>
          </div>
          <div class="schema-tag-item">
            <span class="tag-title">Percentages & Share</span>
            <span class="tag-desc">Normalized awareness metrics and concern prevalence</span>
          </div>
          <div class="schema-tag-item">
            <span class="tag-title">Other Responses</span>
            <span class="tag-desc">Qualitative student commentary and write-in feedback</span>
          </div>
          <div class="schema-tag-item">
            <span class="tag-title">Academic Observations</span>
            <span class="tag-desc">Synthesized findings and chemical literacy takeaways</span>
          </div>
        </div>
      </div>

      <div class="pending-actions">
        <a href="explore.html" class="btn btn-primary">Explore Product Catalog</a>
        <a href="methodology.html" class="btn btn-secondary">Review Scoring Methodology</a>
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
  document.addEventListener('DOMContentLoaded', initSurveyPage);
}
