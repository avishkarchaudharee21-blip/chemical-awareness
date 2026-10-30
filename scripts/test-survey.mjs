import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSurveyDataset, validateSurveyPrivacy, normalizeBrandKey } from './build-survey.mjs';
import { renderSurvey } from '../src/js/survey.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const products = JSON.parse(readFileSync(resolve(rootDir, 'public/data/products.json'), 'utf-8'));

console.log('🧪 Starting Survey Unit & Pipeline Verification Tests...\n');

let totalChecks = 0;
let passedChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    passedChecks++;
    console.log(`✅ PASS: ${message}`);
  }
}

// 1. Test normalizeBrandKey
assert(normalizeBrandKey('Head & Shoulders') === 'head-and-shoulders', 'normalizeBrandKey handles & and spaces');
assert(normalizeBrandKey('TRESemmé') === 'tresemme', 'normalizeBrandKey strips accents');
assert(normalizeBrandKey('Patanjali Dant Kanti') === 'patanjali-dant-kanti', 'normalizeBrandKey hyphenates multi-word brands');

// 2. Test Privacy Enforcement
const cleanData = {
  status: 'aggregated',
  respondents: 150,
  categories: [
    {
      category: 'Toothpaste',
      respondents: 150,
      otherCount: 5,
      brands: [
        { brand: 'Colgate', count: 65 },
        { brand: 'Uncataloged Brand', count: 45 }
      ]
    }
  ]
};
assert(validateSurveyPrivacy(cleanData).valid, 'Clean aggregated dataset passes privacy audit');

const piiEmailData = {
  ...cleanData,
  email: 'student@college.edu'
};
assert(!validateSurveyPrivacy(piiEmailData).valid, 'Rejects dataset with email address');

const piiNameData = {
  ...cleanData,
  studentName: 'Avishkar'
};
assert(!validateSurveyPrivacy(piiNameData).valid, 'Rejects dataset with personal names');

// 3. Test Percentage Calculation & Product Matching
const processed = buildSurveyDataset(cleanData, products);
assert(processed.respondents === 150, 'Total respondents preserved');
assert(processed.categories.length === 1, 'Category processed');

const colgate = processed.categories[0].brands.find(b => b.brand === 'Colgate');
assert(colgate.count === 65, 'Colgate count preserved');
// 65 / 150 * 100 = 43.333333333333336 -> 43.3%
assert(colgate.percentage === 43.3, `Colgate percentage calculated correctly as 43.3% (got ${colgate.percentage}%)`);
assert(colgate.productId === 'TP-001', `Colgate matched catalog product ID: ${colgate.productId}`);

const uncataloged = processed.categories[0].brands.find(b => b.brand === 'Uncataloged Brand');
assert(uncataloged.count === 45, 'Uncataloged count preserved');
// 45 / 150 * 100 = 30.0%
assert(uncataloged.percentage === 30.0, `Uncataloged percentage calculated correctly as 30.0% (got ${uncataloged.percentage}%)`);
assert(uncataloged.productId === null, 'Uncataloged brand has productId: null (no catalog product match)');

// 4. Test UI Rendering for Populated Survey
const mockContainer = { innerHTML: '' };
renderSurvey(mockContainer, processed);
assert(mockContainer.innerHTML.includes('College Survey Results'), 'Renders populated survey header');
assert(mockContainer.innerHTML.includes('Toothpaste'), 'Renders Toothpaste category');
assert(mockContainer.innerHTML.includes('Colgate'), 'Renders Colgate brand');
assert(mockContainer.innerHTML.includes('43.3%'), 'Renders calculated percentage');
assert(mockContainer.innerHTML.includes('product.html?id=TP-001'), 'Renders product link for matched product');
assert(mockContainer.innerHTML.includes('Other / Unlisted mentions:') && mockContainer.innerHTML.includes('5'), 'Renders otherCount note');

// 5. Test Live public/data/survey.json Dataset
console.log('\n--- 5. Live public/data/survey.json Verification ---');
const liveSurveyPath = resolve(rootDir, 'public/data/survey.json');
assert(existsSync(liveSurveyPath), 'public/data/survey.json exists');
const liveSurvey = JSON.parse(readFileSync(liveSurveyPath, 'utf-8'));

assert(liveSurvey.schemaVersion === '1.0', 'liveSurvey schemaVersion is "1.0"');
assert(liveSurvey.status === 'collected', 'liveSurvey status is "collected"');
assert(liveSurvey.respondents === 53, 'liveSurvey total respondents is 53');
assert(liveSurvey.selectionMode === 'single', 'liveSurvey selectionMode is "single"');

// Privacy Check
const livePrivacy = validateSurveyPrivacy(liveSurvey);
assert(livePrivacy.valid, `liveSurvey passes strict privacy audit: ${livePrivacy.violations.join(', ')}`);

// Verify no raw CSV in public/data
assert(!existsSync(resolve(rootDir, 'public/data/survey.csv')), 'Zero raw survey CSV files in public/data');
assert(!existsSync(resolve(rootDir, 'public/data/responses.csv')), 'Zero raw responses CSV files in public/data');

// Verify all 9 categories and their exact denominators
const expectedCategories = [
  { name: 'Shampoo', respondents: 53, brandCount: 7 },
  { name: 'Body Wash / Bar Soap', respondents: 53, brandCount: 6 },
  { name: 'Toothpaste', respondents: 53, brandCount: 7 },
  { name: 'House Cleaning Products', respondents: 53, brandCount: 4 },
  { name: 'Facial Cleanser / Face Wash', respondents: 53, brandCount: 12 },
  { name: 'Hand Wash', respondents: 50, brandCount: 5 },
  { name: 'Deodorant / Perfume', respondents: 53, brandCount: 6 },
  { name: 'Detergent / Cloth Washing Soap', respondents: 51, brandCount: 6 },
  { name: 'Dishwashing / Utensil Cleaning', respondents: 11, brandCount: 4 }
];

assert(liveSurvey.categories.length === 9, `liveSurvey contains 9 categories (got ${liveSurvey.categories.length})`);

expectedCategories.forEach(exp => {
  const cat = liveSurvey.categories.find(c => c.category === exp.name);
  assert(cat !== undefined, `Category '${exp.name}' exists in liveSurvey`);
  assert(cat.respondents === exp.respondents, `Category '${exp.name}' has correct denominator ${exp.respondents} (got ${cat.respondents})`);
  assert(cat.brands.length === exp.brandCount, `Category '${exp.name}' has ${exp.brandCount} brand entries (got ${cat.brands.length})`);

  let countSum = 0;
  cat.brands.forEach(b => {
    countSum += b.count;
    const expectedPct = Math.round((b.count / exp.respondents) * 100 * 10) / 10;
    assert(Math.abs(b.percentage - expectedPct) <= 0.1, `Brand '${b.brand}' percentage (${b.percentage}%) matches formula (${expectedPct}%)`);

    // Verify product IDs
    if (b.productId) {
      const match = products.find(p => p.id === b.productId);
      assert(match !== undefined, `Brand '${b.brand}' productId '${b.productId}' exists in catalog`);
    }

    // Verify non-brand responses have no product link
    if (b.isNonBrand) {
      assert(!b.productId, `Non-brand response '${b.brand}' has no product link`);
    }
  });

  assert(countSum === exp.respondents, `Category '${exp.name}' sum of brand counts (${countSum}) equals denominator (${exp.respondents})`);
});

// 6. Test UI Rendering with Live Dataset
const liveContainer = { innerHTML: '' };
renderSurvey(liveContainer, liveSurvey);
assert(liveContainer.innerHTML.includes('53 student survey participants'), 'Renders 53 participants lead');
assert(liveContainer.innerHTML.includes('53 respondents answered this category'), 'Renders 53 respondents denominator');
assert(liveContainer.innerHTML.includes('11 respondents answered this category'), 'Renders 11 respondents denominator for dishwashing');
assert(liveContainer.innerHTML.includes('50 respondents answered this category'), 'Renders 50 respondents denominator for hand wash');
assert(liveContainer.innerHTML.includes('51 respondents answered this category'), 'Renders 51 respondents denominator for detergent');
assert(liveContainer.innerHTML.includes('survey-progress-track'), 'Renders accessible horizontal progress tracks');

console.log(`\n🎉 ALL ${passedChecks}/${totalChecks} SURVEY VERIFICATION CHECKS PASSED!`);
