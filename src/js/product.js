/**
 * Product Detail Controller for Chemical Awareness
 * Renders complete product information, chemical awareness score, flagged ingredients table,
 * all ingredients review status, usage guidance, alternatives, and verified sources.
 */

import { fetchProductById, fetchProducts } from './data.js';
import { renderScoreBadge, renderVerificationBadge, getScoreBand } from './score.js';
import { initNavigation } from './ui.js';

export async function initProductPage() {
  if (typeof document === 'undefined') return;
  initNavigation();

  const container = document.getElementById('product-detail-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId || !productId.trim()) {
    renderEmptyState(
      container,
      'No Product Selected',
      'Please select a product from the Explore catalog to inspect its chemical formulation.'
    );
    return;
  }

  container.innerHTML = `
    <div class="loading-state" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p>Loading chemical formulation data...</p>
    </div>
  `;

  try {
    const product = await fetchProductById(productId.trim());

    if (!product) {
      renderEmptyState(
        container,
        'Product Not Found',
        `No cataloged chemical profile matching ID "${productId}" was found in our academic registry.`
      );
      return;
    }

    // Fetch all products to resolve alternative objects
    let alternatives = [];
    if (Array.isArray(product.alternatives) && product.alternatives.length > 0) {
      const allProducts = await fetchProducts();
      alternatives = product.alternatives
        .map(altId => allProducts.find(p => p.id === altId))
        .filter(Boolean);
    }

    renderProductDetail(container, product, alternatives);
  } catch (error) {
    console.error('Error loading product details:', error);
    renderEmptyState(
      container,
      'Error Loading Data',
      'An unexpected error occurred while retrieving the chemical profile. Please return to the explore catalog.'
    );
  }
}

export function renderProductDetail(container, product, alternatives = []) {
  // 1. Formatting Product Information
  const brandDisplay = product.brand || 'Unspecified Brand';
  const nameDisplay = product.name || 'Unnamed Product';
  const categoryDisplay = product.category || 'Uncategorized';
  const productTypeDisplay = product.productType || 'Standard Formulation';
  const exposureTypeDisplay = product.exposureType || 'Standard Topical';
  const confidenceDisplay = product.dataConfidence 
    ? (product.dataConfidence.charAt(0).toUpperCase() + product.dataConfidence.slice(1) + ' Confidence')
    : 'Not Recorded';
  
  const lastVerifiedDisplay = product.lastVerified
    ? new Date(product.lastVerified).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Not Recorded';

  // 2. Chemical Awareness Score
  let scoreSectionHTML = '';
  const scoreObj = (product.score && typeof product.score === 'object') ? product.score : null;
  const numericScore = typeof product.score === 'number' ? product.score : (scoreObj?.displayedScore ?? null);

  if (numericScore !== null && numericScore !== undefined && typeof numericScore === 'number' && scoreObj?.status !== 'not_scored') {
    const band = getScoreBand(numericScore);
    const factors = scoreObj?.factors;
    
    let breakdownHTML = '';
    if (factors) {
      breakdownHTML = `
        <div class="score-breakdown-box">
          <h4 class="breakdown-title">Five-Factor Methodology Breakdown</h4>
          <div class="factor-grid">
            <div class="factor-item">
              <span class="factor-label">Ingredient Concern Profile</span>
              <span class="factor-val"><strong>${factors.ingredientConcernProfile}</strong> / 35</span>
            </div>
            <div class="factor-item">
              <span class="factor-label">Exposure Characteristics</span>
              <span class="factor-val"><strong>${factors.exposureCharacteristics}</strong> / 20</span>
            </div>
            <div class="factor-item">
              <span class="factor-label">Frequency of Use</span>
              <span class="factor-val"><strong>${factors.frequencyOfUse}</strong> / 15</span>
            </div>
            <div class="factor-item">
              <span class="factor-label">Evidence Strength</span>
              <span class="factor-val"><strong>${factors.evidenceStrength}</strong> / 20</span>
            </div>
            <div class="factor-item">
              <span class="factor-label">Concern Areas</span>
              <span class="factor-val"><strong>${factors.concernAreas}</strong> / 10</span>
            </div>
            <div class="factor-item factor-total-item">
              <span class="factor-label">Total Evaluated Points</span>
              <span class="factor-val"><strong>${scoreObj.total}</strong> / 100</span>
            </div>
          </div>
          ${scoreObj.rationale ? `<p class="score-rationale-text"><strong>Scoring Rationale:</strong> ${escapeHTML(scoreObj.rationale)}</p>` : ''}
        </div>
      `;
    }

    scoreSectionHTML = `
      <div class="score-display-card">
        <div class="score-header-flex">
          <div class="score-main-value">${numericScore.toFixed(1)}</div>
          <div class="score-details">
            <h4>Chemical Awareness Score</h4>
            <p>${renderScoreBadge(numericScore)}</p>
            <span class="score-subtext">Evaluated on a 1.0 – 10.0 scale (higher score indicates higher level of identified concerns)</span>
          </div>
        </div>
        ${breakdownHTML}
      </div>
    `;
  } else {
    const unratedReason = scoreObj?.explanation || 'This formulation has been cataloged for chemical composition review, but a quantitative hazard score has not yet been computed in this educational phase.';
    scoreSectionHTML = `
      <div class="score-unrated-card">
        <div class="score-unrated-pill">Not yet scored</div>
        <p class="score-unrated-note">${escapeHTML(unratedReason)}</p>
      </div>
    `;
  }

  // 3. Ingredients Processing (Flagged vs All)
  const ingredients = Array.isArray(product.ingredients) ? product.ingredients : [];
  
  // Flagged ingredients for "Ingredients Requiring Awareness"
  const flaggedIngredients = ingredients.filter(ing => {
    return ing.flag === true || (typeof ing.flag === 'string' && ing.flag.trim().length > 0);
  });

  let flaggedTableHTML = '';
  if (flaggedIngredients.length > 0) {
    flaggedTableHTML = `
      <div class="table-responsive">
        <table class="chemical-table" aria-label="Ingredients Requiring Awareness">
          <thead>
            <tr>
              <th scope="col">Ingredient</th>
              <th scope="col">Function</th>
              <th scope="col">Potential Concern</th>
              <th scope="col">Evidence</th>
              <th scope="col">Source</th>
            </tr>
          </thead>
          <tbody>
            ${flaggedIngredients.map(ing => {
              const sourceTags = (ing.sourceIds && ing.sourceIds.length > 0)
                ? ing.sourceIds.map(src => `<span class="source-tag">${escapeHTML(src)}</span>`).join(' ')
                : (ing.evidence ? '<span class="source-tag">Literature</span>' : '<span class="text-muted">Not specified</span>');

              const flagBadgeHTML = typeof ing.flag === 'string'
                ? `<span class="flag-badge flag-${escapeHTML(ing.flag.toLowerCase())}">${escapeHTML(ing.flag)}</span>`
                : (ing.flag === true ? `<span class="flag-badge flag-concern">Awareness Flag</span>` : '');

              return `
                <tr>
                  <td class="col-ingredient">
                    <strong>${escapeHTML(ing.name || 'Unnamed')}</strong>
                    ${flagBadgeHTML}
                  </td>
                  <td class="col-function">${escapeHTML(ing.function || 'Not specified')}</td>
                  <td class="col-concern">${escapeHTML(ing.concern || 'Specific concern flagged in review')}</td>
                  <td class="col-evidence">${escapeHTML(ing.evidence || 'Documented in toxicological dossiers')}</td>
                  <td class="col-source">${sourceTags}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    flaggedTableHTML = `
      <div class="info-notice-box">
        <p>No ingredients requiring specific awareness identified in current review.</p>
      </div>
    `;
  }

  // All Ingredients Table with Review Status
  let allIngredientsTableHTML = '';
  if (ingredients.length > 0) {
    allIngredientsTableHTML = `
      <div class="table-responsive">
        <table class="chemical-table all-ingredients-table" aria-label="All Ingredients">
          <thead>
            <tr>
              <th scope="col">Ingredient</th>
              <th scope="col">Function</th>
              <th scope="col">Review Status</th>
            </tr>
          </thead>
          <tbody>
            ${ingredients.map(ing => {
              // Rule: Never call an ingredient automatically "safe"
              // Use "Reviewed, no concern identified" or "Not yet reviewed"
              let reviewStatusHTML = '';
              if (ing.flag === true || (typeof ing.flag === 'string' && ing.flag.trim().length > 0)) {
                reviewStatusHTML = `<span class="status-pill status-flagged">Flagged for Awareness</span>`;
              } else if (ing.flag === false || (!ing.flag && (ing.function || ing.evidence || ing.note))) {
                reviewStatusHTML = `<span class="status-pill status-reviewed">Reviewed, no concern identified</span>`;
              } else {
                reviewStatusHTML = `<span class="status-pill status-pending">Not yet reviewed</span>`;
              }

              return `
                <tr>
                  <td class="col-ingredient">
                    <strong>${escapeHTML(ing.name || 'Unnamed Ingredient')}</strong>
                  </td>
                  <td class="col-function">${escapeHTML(ing.function || 'Not specified')}</td>
                  <td class="col-status">${reviewStatusHTML}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    allIngredientsTableHTML = `
      <div class="info-notice-box">
        <p>No ingredient formulation list captured for this product record.</p>
      </div>
    `;
  }

  // 4. Usage Guidance
  let usageHTML = '';
  if (product.usage && product.usage.trim()) {
    usageHTML = `<p class="usage-text">${escapeHTML(product.usage)}</p>`;
  } else {
    usageHTML = `<p class="missing-text text-muted">Manufacturer guidance not captured</p>`;
  }

  // 5. Alternatives
  let alternativesHTML = '';
  if (alternatives.length > 0) {
    alternativesHTML = `
      <div class="alternatives-grid">
        ${alternatives.map(alt => `
          <a href="product.html?id=${encodeURIComponent(alt.id)}" class="alt-card" aria-label="Inspect alternative ${escapeHTML(alt.name)}">
            <span class="alt-category">${escapeHTML(alt.category)}</span>
            <h4>${escapeHTML(alt.name)}</h4>
            <span class="alt-brand">Brand: ${escapeHTML(alt.brand)}</span>
            <div class="alt-footer">
              ${renderScoreBadge(alt.score)}
              <span class="alt-link-text">Inspect Details &rarr;</span>
            </div>
          </a>
        `).join('')}
      </div>
    `;
  } else {
    alternativesHTML = `<p class="missing-text text-muted">Alternative not yet verified</p>`;
  }

  // 6. Sources
  let sourcesHTML = '';
  const sources = Array.isArray(product.sources) ? product.sources.filter(Boolean) : [];
  if (sources.length > 0) {
    sourcesHTML = `
      <ul class="sources-bullet-list">
        ${sources.map(s => `<li>${escapeHTML(s)}</li>`).join('')}
      </ul>
    `;
  } else {
    sourcesHTML = `<p class="missing-text text-muted">Source verification required</p>`;
  }

  // Render Full Template
  container.innerHTML = `
    <!-- Breadcrumbs -->
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a>
      <span class="separator">/</span>
      <a href="explore.html">Explore Products</a>
      <span class="separator">/</span>
      <span aria-current="page">${escapeHTML(nameDisplay)}</span>
    </nav>

    <!-- Page Title Header -->
    <header class="product-page-header">
      <div class="category-pill">${escapeHTML(categoryDisplay)}</div>
      <h1 class="product-main-title">${escapeHTML(nameDisplay)}</h1>
      <p class="product-brand-sub">Brand: <strong>${escapeHTML(brandDisplay)}</strong></p>
    </header>

    <div class="product-layout-grid">
      <!-- Left Column / Main Information -->
      <div class="product-main-column">

        <!-- 1. Product Information Section -->
        <section class="detail-section" aria-labelledby="sec-product-info">
          <h2 id="sec-product-info" class="section-title">Product Information</h2>
          <div class="info-table-card">
            <dl class="meta-definition-list">
              <div class="meta-row">
                <dt>Brand</dt>
                <dd>${escapeHTML(brandDisplay)}</dd>
              </div>
              <div class="meta-row">
                <dt>Product Name</dt>
                <dd>${escapeHTML(nameDisplay)}</dd>
              </div>
              <div class="meta-row">
                <dt>Category</dt>
                <dd>${escapeHTML(categoryDisplay)}</dd>
              </div>
              <div class="meta-row">
                <dt>Product Type</dt>
                <dd>${escapeHTML(productTypeDisplay)}</dd>
              </div>
              <div class="meta-row">
                <dt>Exposure Type</dt>
                <dd>${escapeHTML(exposureTypeDisplay)}</dd>
              </div>
              <div class="meta-row">
                <dt>Verification Status</dt>
                <dd>${renderVerificationBadge(product.verificationStatus)}</dd>
              </div>
              <div class="meta-row">
                <dt>Data Confidence</dt>
                <dd><span class="confidence-pill confidence-${product.dataConfidence ? product.dataConfidence.toLowerCase() : 'medium'}">${escapeHTML(confidenceDisplay)}</span></dd>
              </div>
              <div class="meta-row">
                <dt>Last Verified</dt>
                <dd>${lastVerifiedDisplay}</dd>
              </div>
            </dl>
          </div>
        </section>

        <!-- 2. Chemical Awareness Score Section -->
        <section class="detail-section" aria-labelledby="sec-score">
          <h2 id="sec-score" class="section-title">Chemical Awareness Score</h2>
          ${scoreSectionHTML}
        </section>

        <!-- 3. Ingredients Requiring Awareness -->
        <section class="detail-section" aria-labelledby="sec-flagged-ing">
          <div class="section-header-wrap">
            <h2 id="sec-flagged-ing" class="section-title">Ingredients Requiring Awareness</h2>
            <span class="count-tag">${flaggedIngredients.length} Flagged</span>
          </div>
          <p class="section-desc">Chemical compounds identified with potential irritation, contact allergenicity, or environmental concerns:</p>
          ${flaggedTableHTML}
        </section>

        <!-- 4. All Ingredients -->
        <section class="detail-section" aria-labelledby="sec-all-ing">
          <div class="section-header-wrap">
            <h2 id="sec-all-ing" class="section-title">All Ingredients</h2>
            <span class="count-tag">${ingredients.length} Total</span>
          </div>
          <p class="section-desc">Complete formulation composition as recorded from packaging and regulatory filings:</p>
          ${allIngredientsTableHTML}
        </section>

        <!-- 5. Usage Section -->
        <section class="detail-section" aria-labelledby="sec-usage">
          <h2 id="sec-usage" class="section-title">Usage & Application Guidance</h2>
          <div class="content-box">
            ${usageHTML}
          </div>
        </section>

        <!-- 6. Alternative Section -->
        <section class="detail-section" aria-labelledby="sec-alternatives">
          <h2 id="sec-alternatives" class="section-title">Alternative Formulations</h2>
          ${alternativesHTML}
        </section>

        <!-- 7. Sources Section -->
        <section class="detail-section" aria-labelledby="sec-sources">
          <h2 id="sec-sources" class="section-title">Verified Sources & References</h2>
          <div class="content-box">
            ${sourcesHTML}
          </div>
        </section>

      </div>
    </div>
  `;
}

export function renderEmptyState(container, title, message) {
  container.innerHTML = `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a>
      <span class="separator">/</span>
      <a href="explore.html">Explore Products</a>
    </nav>
    <div class="empty-state-card" role="status">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h2>${escapeHTML(title)}</h2>
      <p>${escapeHTML(message)}</p>
      <a href="explore.html" class="btn btn-primary">Browse All Cataloged Products</a>
    </div>
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
  document.addEventListener('DOMContentLoaded', initProductPage);
}
