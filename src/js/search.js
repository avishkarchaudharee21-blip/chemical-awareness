/**
 * Client-Side Search & Filter Engine for Chemical Awareness
 * Supports multi-word queries, accent stripping, case-insensitivity, URL parameter synchronization,
 * and dynamic product cards rendering.
 */

import { fetchProducts, CATEGORIES } from './data.js';
import { renderScoreBadge, renderVerificationBadge } from './score.js';
import { initNavigation } from './ui.js';

/**
 * Normalize string: lowercase, trim, and strip diacritics/accents
 * @param {string} text 
 * @returns {string} Normalized string
 */
export function normalizeText(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Filter products collection based on search query, category, and other criteria
 * @param {Array} products Array of product objects
 * @param {Object} options Filter options { query, category, status, confidence, sortBy }
 * @returns {Array} Filtered products
 */
export function filterProducts(products, options = {}) {
  const {
    query = '',
    category = 'all',
    status = 'all',
    confidence = 'all',
    sortBy = 'name_asc'
  } = options;

  const normalizedCategoryFilter = normalizeText(category);
  const normalizedQuery = normalizeText(query);
  const searchWords = normalizedQuery.split(/\s+/).filter(Boolean);

  const filtered = products.filter(product => {
    // 1. Category Filter
    if (normalizedCategoryFilter && normalizedCategoryFilter !== 'all') {
      const prodCategory = normalizeText(product.category);
      if (prodCategory !== normalizedCategoryFilter) {
        return false;
      }
    }

    // 2. Verification Status Filter
    if (status && status !== 'all') {
      if (product.verificationStatus !== status) {
        return false;
      }
    }

    // 3. Data Confidence Filter
    if (confidence && confidence !== 'all') {
      if ((product.dataConfidence || '').toLowerCase() !== confidence.toLowerCase()) {
        return false;
      }
    }

    // 4. Multi-word Search matching Brand, Product Name, Category, and Ingredients
    if (searchWords.length > 0) {
      const targetBrand = normalizeText(product.brand);
      const targetName = normalizeText(product.name);
      const targetCategory = normalizeText(product.category);
      const targetIngredients = Array.isArray(product.ingredients)
        ? product.ingredients.map(i => normalizeText(i.name)).join(' ')
        : '';
      const targetCombined = `${targetBrand} ${targetName} ${targetCategory} ${targetIngredients}`;

      // Every word in the search query must be present in the combined product text
      const allWordsMatch = searchWords.every(word => targetCombined.includes(word));
      if (!allWordsMatch) {
        return false;
      }
    }

    return true;
  });

  // 5. Sorting
  if (sortBy) {
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'brand_asc':
          return (a.brand || '').localeCompare(b.brand || '') || (a.name || '').localeCompare(b.name || '');
        case 'ingredients_desc':
          return (b.ingredients?.length || 0) - (a.ingredients?.length || 0);
        case 'ingredients_asc':
          return (a.ingredients?.length || 0) - (b.ingredients?.length || 0);
        case 'name_asc':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });
  }

  return filtered;
}

/**
 * Update browser URL search parameters without page reload
 * @param {string} query 
 * @param {string} category 
 */
function updateURLParams(query, category) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location);
  
  if (query && query.trim()) {
    url.searchParams.set('q', query.trim());
  } else {
    url.searchParams.delete('q');
  }

  if (category && category !== 'all') {
    url.searchParams.set('category', category);
  } else {
    url.searchParams.delete('category');
  }

  window.history.replaceState({}, '', url);
}

/**
 * Initialize Explore Page UI
 */
export async function initExplorePage() {
  if (typeof document === 'undefined') return;
  initNavigation();

  const gridContainer = document.getElementById('explore-products-grid');
  if (!gridContainer) return;

  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-filter');
  const statusSelect = document.getElementById('status-filter');
  const confidenceSelect = document.getElementById('confidence-filter');
  const sortSelect = document.getElementById('sort-by');
  const resultsCount = document.getElementById('results-count');
  const resetBtn = document.getElementById('reset-filters-btn');

  gridContainer.innerHTML = `
    <div class="loading-state" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p>Loading chemical catalog...</p>
    </div>
  `;

  let allProducts = [];
  try {
    allProducts = await fetchProducts();
  } catch (error) {
    gridContainer.innerHTML = `<p class="error-notice">Failed to load product database.</p>`;
    return;
  }

  // Populate category options if not already populated
  if (categorySelect && categorySelect.options.length <= 1) {
    CATEGORIES.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
    });
  }

  // Parse initial URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';
  const initialCategory = urlParams.get('category') || 'all';

  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }
  if (categorySelect && initialCategory) {
    // Match exact or normalized option value
    const matchingOption = Array.from(categorySelect.options).find(
      opt => normalizeText(opt.value) === normalizeText(initialCategory)
    );
    if (matchingOption) {
      categorySelect.value = matchingOption.value;
    }
  }

  function render() {
    const currentQuery = searchInput ? searchInput.value : '';
    const currentCategory = categorySelect ? categorySelect.value : 'all';
    const currentStatus = statusSelect ? statusSelect.value : 'all';
    const currentConfidence = confidenceSelect ? confidenceSelect.value : 'all';
    const currentSort = sortSelect ? sortSelect.value : 'name_asc';

    // Synchronize URL
    updateURLParams(currentQuery, currentCategory);

    const filtered = filterProducts(allProducts, {
      query: currentQuery,
      category: currentCategory,
      status: currentStatus,
      confidence: currentConfidence,
      sortBy: currentSort
    });

    // Update Result Count
    if (resultsCount) {
      if (filtered.length === 1) {
        resultsCount.textContent = `Showing 1 product`;
      } else {
        resultsCount.textContent = `Showing ${filtered.length} products`;
      }
    }

    // Render Empty State if no products match
    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state-card full-width" role="status" aria-live="polite">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3>No products found</h3>
          <p>No products match your current search criteria. Try adjusting your keywords or clearing the category filter.</p>
          <button id="clear-search-btn" class="btn btn-secondary btn-sm" type="button">Clear Search & Filters</button>
        </div>
      `;

      const clearBtn = document.getElementById('clear-search-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          if (categorySelect) categorySelect.value = 'all';
          if (statusSelect) statusSelect.value = 'all';
          if (confidenceSelect) confidenceSelect.value = 'all';
          if (sortSelect) sortSelect.value = 'name_asc';
          render();
        });
      }
      return;
    }

    // Render Product Cards
    gridContainer.innerHTML = filtered.map(p => {
      const confidenceClass = p.dataConfidence ? `confidence-${p.dataConfidence.toLowerCase()}` : 'confidence-medium';
      const confidenceLabel = p.dataConfidence 
        ? (p.dataConfidence.charAt(0).toUpperCase() + p.dataConfidence.slice(1) + ' Confidence')
        : 'Confidence Not Stated';

      return `
        <article class="product-card" aria-labelledby="prod-title-${p.id}">
          <div class="card-header">
            <span class="category-tag">${escapeHTML(p.category || 'Uncategorized')}</span>
            <div class="card-badges-wrap">
              ${renderVerificationBadge(p.verificationStatus)}
              <span class="confidence-pill ${confidenceClass}" title="Data Confidence Level">${escapeHTML(confidenceLabel)}</span>
            </div>
          </div>

          <div class="card-body">
            <h3 id="prod-title-${p.id}" class="product-card-title">
              <a href="product.html?id=${encodeURIComponent(p.id)}">${escapeHTML(p.name)}</a>
            </h3>
            <span class="product-card-brand">Brand: <strong>${escapeHTML(p.brand || 'Unspecified Brand')}</strong></span>
          </div>

          <div class="card-footer">
            <div class="score-container">
              ${renderScoreBadge(p.score)}
            </div>
            <a href="product.html?id=${encodeURIComponent(p.id)}" class="btn btn-sm btn-primary" aria-label="View chemical details for ${escapeHTML(p.name)}">
              Inspect &rarr;
            </a>
          </div>
        </article>
      `;
    }).join('');
  }

  // Attach search listeners
  if (searchInput) {
    searchInput.addEventListener('input', render);
  }
  if (categorySelect) {
    categorySelect.addEventListener('change', render);
  }
  if (statusSelect) {
    statusSelect.addEventListener('change', render);
  }
  if (confidenceSelect) {
    confidenceSelect.addEventListener('change', render);
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', render);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (categorySelect) categorySelect.value = 'all';
      if (statusSelect) statusSelect.value = 'all';
      if (confidenceSelect) confidenceSelect.value = 'all';
      if (sortSelect) sortSelect.value = 'name_asc';
      render();
    });
  }

  // Handle popstate for browser Back/Forward navigation
  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    if (searchInput) searchInput.value = params.get('q') || '';
    if (categorySelect) categorySelect.value = params.get('category') || 'all';
    render();
  });

  // Initial render
  render();
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
  document.addEventListener('DOMContentLoaded', initExplorePage);
}
