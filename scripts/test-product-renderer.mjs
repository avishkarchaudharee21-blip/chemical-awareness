import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderProductDetail, renderEmptyState } from '../src/js/product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

console.log('🧪 Testing Product Page Rendering & Edge Cases...\n');

const products = JSON.parse(readFileSync(resolve(rootDir, 'public/data/products.json'), 'utf-8'));

// Helper container mock
function createMockContainer() {
  return {
    innerHTML: ''
  };
}

// 1. Valid Product Test (Imported Catalog Product SH-001)
const validProduct = products[0]; // SH-001
const container1 = createMockContainer();
renderProductDetail(container1, validProduct, []);

const html1 = container1.innerHTML;

// Assertions for Imported Catalog Product
if (!html1.includes('Smooth &amp; Silky Anti-Dandruff Shampoo') && !html1.includes('Smooth & Silky Anti-Dandruff Shampoo')) {
  console.error('❌ Missing product name in output');
  process.exit(1);
}
if (!html1.includes('Product Information')) {
  console.error('❌ Missing "Product Information" section');
  process.exit(1);
}
if (!html1.includes('Chemical Awareness Score') || !html1.includes('Five-Factor Methodology Breakdown')) {
  console.error('❌ Missing Chemical Awareness Score or factor breakdown for catalog product');
  process.exit(1);
}

// 1c. Unrated Product Test
const mockUnratedProduct = { ...validProduct, id: 'mock-unrated-prod', score: null };
const containerUnrated = createMockContainer();
renderProductDetail(containerUnrated, mockUnratedProduct, []);
if (!containerUnrated.innerHTML.includes('Not yet scored')) {
  console.error('❌ Missing "Not yet scored" notice for unrated product');
  process.exit(1);
}

// 1b. Mock Scored Product with Ingredients Test
const mockScoredProduct = {
  ...validProduct,
  id: 'mock-scored-prod',
  score: {
    status: 'scored',
    factors: {
      ingredientConcernProfile: 15,
      exposureCharacteristics: 5,
      frequencyOfUse: 5,
      evidenceStrength: 10,
      concernAreas: 5
    },
    total: 40,
    displayedScore: 4.0,
    rationale: 'Calculated test score'
  },
  ingredients: [
    {
      name: 'Sodium Laureth Sulfate (SLES)',
      function: 'Surfactant',
      flag: true,
      concern: 'Potential mucosal irritation',
      evidence: 'CIR review',
      sourceIds: ['CIR']
    },
    {
      name: 'Glycerin',
      function: 'Humectant',
      flag: false,
      concern: 'Non-irritating',
      evidence: 'USP',
      sourceIds: ['CIR']
    }
  ]
};

const containerScored = createMockContainer();
renderProductDetail(containerScored, mockScoredProduct, []);
const htmlScored = containerScored.innerHTML;

if (!htmlScored.includes('Chemical Awareness Score') || !htmlScored.includes('Five-Factor Methodology Breakdown')) {
  console.error('❌ Missing Chemical Awareness Score or factor breakdown for scored product');
  process.exit(1);
}
if (!htmlScored.includes('Ingredients Requiring Awareness')) {
  console.error('❌ Missing "Ingredients Requiring Awareness" section');
  process.exit(1);
}
if (!htmlScored.includes('Potential Concern') || !htmlScored.includes('Evidence')) {
  console.error('❌ Missing table headers in Ingredients Requiring Awareness');
  process.exit(1);
}
if (!htmlScored.includes('All Ingredients')) {
  console.error('❌ Missing "All Ingredients" section');
  process.exit(1);
}
if (htmlScored.toLowerCase().includes('is safe') || htmlScored.toLowerCase().includes('totally safe')) {
  console.error('❌ VIOLATION: Ingredient was marked as "safe"');
  process.exit(1);
}

console.log('✅ Valid unrated & scored products rendered with exact required sections and zero "safe" labels.');

// 2. Edge Case: Missing Ingredients
const productNoIngredients = {
  ...validProduct,
  id: 'test-no-ing',
  ingredients: []
};
const container2 = createMockContainer();
renderProductDetail(container2, productNoIngredients, []);
const html2 = container2.innerHTML;
if (!html2.includes('No ingredient formulation list captured')) {
  console.error('❌ Missing clean notice for empty ingredients');
  process.exit(1);
}
console.log('✅ Missing ingredients rendered cleanly with fallback notice.');

// 3. Edge Case: Missing Usage Guidance
const productNoUsage = {
  ...validProduct,
  id: 'test-no-usage',
  usage: null
};
const container3 = createMockContainer();
renderProductDetail(container3, productNoUsage, []);
const html3 = container3.innerHTML;
if (!html3.includes('Manufacturer guidance not captured')) {
  console.error('❌ Missing "Manufacturer guidance not captured" fallback');
  process.exit(1);
}
console.log('✅ Missing usage guidance correctly displayed "Manufacturer guidance not captured".');

// 4. Edge Case: Missing Alternatives
const productNoAlts = {
  ...validProduct,
  id: 'test-no-alts',
  alternatives: []
};
const container4 = createMockContainer();
renderProductDetail(container4, productNoAlts, []);
const html4 = container4.innerHTML;
if (!html4.includes('Alternative not yet verified')) {
  console.error('❌ Missing "Alternative not yet verified" fallback');
  process.exit(1);
}
console.log('✅ Missing alternatives correctly displayed "Alternative not yet verified".');

// 5. Edge Case: Missing Sources
const productNoSources = {
  ...validProduct,
  id: 'test-no-sources',
  sources: []
};
const container5 = createMockContainer();
renderProductDetail(container5, productNoSources, []);
const html5 = container5.innerHTML;
if (!html5.includes('Source verification required')) {
  console.error('❌ Missing "Source verification required" fallback');
  process.exit(1);
}
console.log('✅ Missing sources correctly displayed "Source verification required".');

// 6. Edge Case: Invalid Product ID Empty State
const container6 = createMockContainer();
renderEmptyState(container6, 'Product Not Found', 'No cataloged chemical profile matching ID "fake-id" was found.');
const html6 = container6.innerHTML;
if (!html6.includes('Product Not Found') || !html6.includes('Browse All Cataloged Products')) {
  console.error('❌ Invalid product ID empty state error');
  process.exit(1);
}
console.log('✅ Invalid product ID empty state rendered cleanly.');

console.log('\n🎉 ALL PRODUCT PAGE EDGE-CASE TESTS COMPLETED SUCCESSFULLY!');
