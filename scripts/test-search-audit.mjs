import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { filterProducts, normalizeText } from '../src/js/search.js';
import { renderProductDetail, renderEmptyState } from '../src/js/product.js';
import { CATEGORIES } from '../src/js/data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

console.log('====================================================');
console.log('🔍 FULL 24-PRODUCT SEARCH & LINKING AUDIT SUITE');
console.log('====================================================\n');

let totalChecks = 0;
let passedChecks = 0;
const failures = [];

function assert(condition, message) {
  totalChecks++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failures.push(message);
  } else {
    passedChecks++;
    console.log(`✅ PASS: ${message}`);
  }
}

// 1. GET THE PRODUCT LIST & DUPLICATE CHECK
console.log('\n--- 1. Product Catalog & Duplicate Verification ---');
const productsPath = resolve(rootDir, 'public/data/products.json');
assert(existsSync(productsPath), 'public/data/products.json exists');

const products = JSON.parse(readFileSync(productsPath, 'utf-8'));
assert(Array.isArray(products), 'products.json is an array');
assert(products.length === 24, `products.json contains exactly 24 products (found ${products.length})`);

const seenIds = new Set();
const seenBrandAndNames = new Set();
let duplicatesFound = 0;

const auditList = products.map((p, idx) => {
  if (seenIds.has(p.id)) {
    duplicatesFound++;
    assert(false, `Duplicate product ID detected: ${p.id}`);
  }
  seenIds.add(p.id);

  const brandNameKey = `${p.brand.toLowerCase()}:::${p.name.toLowerCase()}`;
  if (seenBrandAndNames.has(brandNameKey)) {
    duplicatesFound++;
    assert(false, `Duplicate product entry detected: ${p.brand} - ${p.name}`);
  }
  seenBrandAndNames.add(brandNameKey);

  return {
    index: idx + 1,
    id: p.id,
    brand: p.brand,
    name: p.name,
    category: p.category
  };
});

assert(duplicatesFound === 0, `Duplicate check passed with 0 duplicates found.`);

// 2. TEST EVERY PRODUCT SEARCH (Exact, Lowercase, Uppercase, Name, Partial)
console.log('\n--- 2. Individual Search Tests for All 24 Products ---');
let searchPassedCount = 0;
let searchFailedCount = 0;

auditList.forEach((item) => {
  const p = products.find(x => x.id === item.id);
  
  // Test 1: Exact Brand
  const resExactBrand = filterProducts(products, { query: item.brand });
  const exactBrandPass = resExactBrand.some(r => r.id === item.id);

  // Test 2: Lowercase Brand
  const resLowerBrand = filterProducts(products, { query: item.brand.toLowerCase() });
  const lowerBrandPass = resLowerBrand.some(r => r.id === item.id);

  // Test 3: Uppercase Brand
  const resUpperBrand = filterProducts(products, { query: item.brand.toUpperCase() });
  const upperBrandPass = resUpperBrand.some(r => r.id === item.id);

  // Test 4: Product Name
  const resName = filterProducts(products, { query: item.name });
  const namePass = resName.some(r => r.id === item.id);

  // Test 5: Partial Brand or Name token
  const firstBrandWord = item.brand.split(/\s+/)[0];
  const firstOrSecondNameWord = item.name.split(/\s+/).find(w => w.length > 4) || item.name.split(/\s+/)[0];
  const partialQuery = `${firstBrandWord} ${firstOrSecondNameWord}`;
  const resPartial = filterProducts(products, { query: partialQuery });
  const partialPass = resPartial.some(r => r.id === item.id);

  const allSearchPass = exactBrandPass && lowerBrandPass && upperBrandPass && namePass && partialPass;
  
  if (allSearchPass) {
    searchPassedCount++;
    assert(true, `Product #${item.index} [${item.id}] search passed (Brand/Case/Name/Partial)`);
  } else {
    searchFailedCount++;
    assert(false, `Product #${item.index} [${item.id}] search FAILED: exact=${exactBrandPass}, lower=${lowerBrandPass}, upper=${upperBrandPass}, name=${namePass}, partial=${partialPass}`);
  }
});

assert(searchPassedCount === 24 && searchFailedCount === 0, `All 24 products passed search tests (${searchPassedCount}/24 passed)`);

// 3. TEST PRODUCT LINKS & DETAIL RENDERING
console.log('\n--- 3. Product Detail Page & Linking Verification ---');
let productPagesPassed = 0;
let productPagesFailed = 0;

function createMockContainer() {
  return { innerHTML: '' };
}

products.forEach((p, idx) => {
  const container = createMockContainer();
  // Resolve alternatives
  const alts = Array.isArray(p.alternatives)
    ? p.alternatives.map(altId => products.find(x => x.id === altId)).filter(Boolean)
    : [];

  try {
    renderProductDetail(container, p, alts);
    const html = container.innerHTML;

    const escapedName = p.name.replace(/&/g, '&amp;');
    const escapedBrand = p.brand.replace(/&/g, '&amp;');
    const escapedCat = p.category.replace(/&/g, '&amp;');

    const hasName = html.includes(escapedName) || html.includes(p.name);
    const hasBrand = html.includes(escapedBrand) || html.includes(p.brand);
    const hasCategory = html.includes(escapedCat) || html.includes(p.category);
    const hasScoreSec = html.includes('Chemical Awareness Score');
    const hasIngAwareness = html.includes('Ingredients Requiring Awareness');
    const hasAllIng = html.includes('All Ingredients');
    const hasUsage = html.includes('Usage &amp; Application Guidance') || html.includes('Usage & Application Guidance');
    const hasSources = html.includes('Verified Sources &amp; References') || html.includes('Verified Sources & References');

    const pageValid = hasName && hasBrand && hasCategory && hasScoreSec && hasIngAwareness && hasAllIng && hasUsage && hasSources;

    if (pageValid) {
      productPagesPassed++;
      assert(true, `Product #${idx + 1} [${p.id}] page rendered all mandatory sections cleanly`);
    } else {
      productPagesFailed++;
      assert(false, `Product #${idx + 1} [${p.id}] page render missing section(s)`);
    }
  } catch (err) {
    productPagesFailed++;
    assert(false, `Product #${idx + 1} [${p.id}] rendered with exception: ${err.message}`);
  }
});

// Test empty state and invalid product IDs
const invalidContainer = createMockContainer();
renderEmptyState(invalidContainer, 'Product Not Found', 'No product found with ID "non-existent-id"');
assert(invalidContainer.innerHTML.includes('Product Not Found') && invalidContainer.innerHTML.includes('Browse All Cataloged Products'), 'Invalid product ID empty state rendered cleanly');

const emptySelectionContainer = createMockContainer();
renderEmptyState(emptySelectionContainer, 'No Product Selected', 'Please select a product');
assert(emptySelectionContainer.innerHTML.includes('No Product Selected'), 'Missing product ID empty state rendered cleanly');

assert(productPagesPassed === 24 && productPagesFailed === 0, `All 24 product detail pages passed (${productPagesPassed}/24 passed)`);

// 4. TEST CATEGORY FILTERS
console.log('\n--- 4. Category Filter Tests ---');
const testCategories = CATEGORIES;
testCategories.forEach(cat => {
  const catResults = filterProducts(products, { category: cat });
  const allMatchCategory = catResults.every(p => p.category === cat);
  const countExpected = products.filter(p => p.category === cat).length;
  assert(catResults.length === countExpected && allMatchCategory, `Category filter "${cat}" returned exactly ${countExpected} matching products`);
});

// Combined search + category test
const sampleCat = 'Shampoo / Conditioner';
const sampleQuery = 'Head & Shoulders';
const combinedRes = filterProducts(products, { query: sampleQuery, category: sampleCat });
assert(combinedRes.length === 1 && combinedRes[0].id === 'SH-001', 'Combined search + category filter returned exact matches');

// Reset / All category test
const allCategoryRes = filterProducts(products, { category: 'all' });
assert(allCategoryRes.length === 24, 'Category "all" returns all 24 catalog products');

// 5. TEST URL QUERY PARAMETERS & CASE / ACCENT NORMALIZATION
console.log('\n--- 5. URL Query Parameters & Edge Cases ---');

// Edge Case 1: Mixed Case (e.g., hArPiC bAtHrOoM)
const mixedQueryRes = filterProducts(products, { query: 'hArPiC bAtHrOoM' });
assert(mixedQueryRes.length === 1 && mixedQueryRes[0].id === 'HC-001', 'Case-insensitive mixed-case query matched correctly');

// Edge Case 2: Accents / Diacritics (e.g., TRESemmé vs Tresemme)
const accentedQueryRes = filterProducts(products, { query: 'Tresemme' });
const accentedExactRes = filterProducts(products, { query: 'TRESemmé' });
assert(accentedQueryRes.length >= 1 && accentedExactRes.length >= 1 && accentedQueryRes[0].id === 'SH-003', `Accented query stripped diacritics and matched product SH-003`);

// Edge Case 3: Extra Whitespace
const spacedQueryRes = filterProducts(products, { query: '   Himalaya    Neem   ' });
assert(spacedQueryRes.length === 1 && spacedQueryRes[0].id === 'FW-001', 'Query with excess whitespace handled properly');

// Edge Case 4: Non-matching queries
const nonMatchRes = filterProducts(products, { query: 'xyznonexistentchemicalproduct999' });
assert(nonMatchRes.length === 0, 'Non-matching query returns empty results array for graceful UI fallback');

// 6. TEST SURVEY TO PRODUCT LINKS
console.log('\n--- 6. Survey Dataset Linking Verification ---');
const surveyPath = resolve(rootDir, 'public/data/survey.json');
assert(existsSync(surveyPath), 'public/data/survey.json exists');
const surveyData = JSON.parse(readFileSync(surveyPath, 'utf-8'));

let surveyProductLinksVerified = 0;
let surveyBrokenLinks = 0;

(surveyData.categories || []).forEach(cat => {
  (cat.brands || []).forEach(b => {
    if (b.productId !== null && b.productId !== undefined) {
      const matchedProd = products.find(p => p.id === b.productId);
      if (!matchedProd) {
        surveyBrokenLinks++;
        assert(false, `Survey brand "${b.brand}" links to missing product ID: ${b.productId}`);
      } else {
        surveyProductLinksVerified++;
        const catMatches = matchedProd.category === cat.category;
        assert(catMatches, `Survey brand "${b.brand}" correctly maps to product "${matchedProd.name}" in category "${cat.category}"`);
      }
    }
  });
});

assert(surveyBrokenLinks === 0, `Survey link check completed with 0 broken links.`);

// FINAL SUMMARY
console.log('\n====================================================');
if (failures.length === 0) {
  console.log(`🎉 ALL ${passedChecks}/${totalChecks} SEARCH AUDIT CHECKS PASSED WITH 100% SUCCESS!`);
} else {
  console.error(`⚠️ ${failures.length} CHECKS FAILED!`);
  process.exit(1);
}
console.log('====================================================\n');
