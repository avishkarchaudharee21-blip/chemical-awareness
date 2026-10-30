import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { filterProducts, normalizeText } from '../src/js/search.js';
import {
  FACTOR_LIMITS,
  TOTAL_MAX_POINTS,
  SCORE_BANDS,
  validateFactors,
  calculateTotalPoints,
  calculateDisplayedScore,
  getScoreBand,
  calculateScore,
  renderScoreBadge,
  renderVerificationBadge,
  METHODOLOGY_DISCLAIMER,
  HIGHER_SCORE_INTERPRETATION
} from '../src/js/score.js';
import { renderProductDetail, renderEmptyState as renderProductEmptyState } from '../src/js/product.js';
import { renderMethodology } from '../src/js/methodology.js';
import { renderSurvey } from '../src/js/survey.js';
import { validateSurveyPrivacy } from './build-survey.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

console.log('====================================================');
console.log('🔍 RUNNING FULL QA AUDIT & POLISH SUITE');
console.log('====================================================\n');

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

// 1. Audit HTML Files & Structure
console.log('\n--- 1. HTML Pages & Metadata Audit ---');
const HTML_PAGES = [
  'index.html',
  'explore.html',
  'product.html',
  'survey.html',
  'methodology.html',
  'about.html'
];

HTML_PAGES.forEach(page => {
  const filePath = resolve(rootDir, page);
  assert(existsSync(filePath), `File exists: ${page}`);
  const content = readFileSync(filePath, 'utf-8');
  assert(content.includes('<!DOCTYPE html>'), `${page} has standard DOCTYPE`);
  assert(content.includes('<meta name="viewport"'), `${page} has responsive viewport meta`);
  assert(content.includes('<link rel="stylesheet" href="./src/css/styles.css"'), `${page} includes stylesheet`);
  assert(content.includes('Chemical Awareness'), `${page} includes brand title`);
  assert(content.includes('<header class="site-header">'), `${page} includes consistent site header`);
  assert(content.includes('<footer class="site-footer">'), `${page} includes consistent site footer`);

  // Security Check: target="_blank" must include rel="noopener noreferrer"
  const blankRegex = /<a[^>]+target=["']_blank["'][^>]*>/gi;
  const blankMatches = content.match(blankRegex) || [];
  blankMatches.forEach(tag => {
    assert(tag.includes('rel="noopener noreferrer"'), `${page} external link has rel="noopener noreferrer": ${tag}`);
  });
});

// 2. Data Integrity Audit (products.json)
console.log('\n--- 2. Product Dataset Audit (products.json) ---');
const productsPath = resolve(rootDir, 'public/data/products.json');
assert(existsSync(productsPath), 'products.json exists in public/data/');
const products = JSON.parse(readFileSync(productsPath, 'utf-8'));
assert(Array.isArray(products) && products.length > 0, `products.json contains array of ${products.length} products`);

const seenIds = new Set();
const VALID_CATEGORIES = [
  'Shampoo / Conditioner',
  'Body Wash / Bar Soap',
  'Toothpaste',
  'House Cleaning Products',
  'Facial Cleanser / Face Wash',
  'Deodorant / Perfume',
  'Detergent / Cloth Washing Soap',
  'Dishwashing / Utensil Cleaning'
];

products.forEach((p, idx) => {
  assert(p.id && typeof p.id === 'string', `Product #${idx + 1} has valid string id`);
  assert(!seenIds.has(p.id), `Product ID is unique: ${p.id}`);
  seenIds.add(p.id);

  assert(VALID_CATEGORIES.includes(p.category), `Product ${p.id} has valid category: ${p.category}`);
  assert(p.name && typeof p.name === 'string', `Product ${p.id} has name`);
  assert(p.brand && typeof p.brand === 'string', `Product ${p.id} has brand`);
  
  if (p.score !== null) {
    assert(typeof p.score === 'object', `Product ${p.id} score is structured object`);
    assert(p.score.status === 'scored' || p.score.status === 'not_scored', `Product ${p.id} score has valid status`);
    if (p.score.status === 'scored') {
      assert(typeof p.score.displayedScore === 'number' && p.score.displayedScore >= 1.0 && p.score.displayedScore <= 10.0, `Product ${p.id} displayedScore (${p.score.displayedScore}) is within 1.0 - 10.0`);
      assert(p.score.maxPossiblePoints === 100, `Product ${p.id} maxPossiblePoints is 100`);
      assert(p.score.factors && typeof p.score.factors === 'object', `Product ${p.id} has 5 factors object`);
      assert(validateFactors(p.score.factors).valid, `Product ${p.id} factors satisfy limits`);
    }
  }

  assert(p.frequency === null, `Product ${p.id} frequency is null (no invented frequency limit)`);
  assert(p.usage === null || (typeof p.usage === 'string' && p.usage.trim().length > 0), `Product ${p.id} has valid usage guidance`);

  assert(Array.isArray(p.ingredients), `Product ${p.id} has ingredients array`);
  p.ingredients.forEach(ing => {
    assert(ing.name && typeof ing.name === 'string', `Ingredient has name: ${ing.name}`);
    assert(ing.concentration === null, `Ingredient ${ing.name} concentration is null (no invented concentration)`);
  });
});

// 3. Data Integrity Audit (survey.json)
console.log('\n--- 3. Survey Dataset Audit (survey.json) ---');
const surveyPath = resolve(rootDir, 'public/data/survey.json');
assert(existsSync(surveyPath), 'survey.json exists');
const surveyData = JSON.parse(readFileSync(surveyPath, 'utf-8'));
assert(surveyData.schemaVersion === '1.0', 'survey.json schemaVersion is "1.0"');

// Privacy Audit: Strictly zero personal data, zero emails, zero phone numbers
const privacyAudit = validateSurveyPrivacy(surveyData);
assert(privacyAudit.valid, `survey.json adheres strictly to privacy rules: ${privacyAudit.violations.join(', ')}`);

if (surveyData.status === 'no_data' || surveyData.respondents === null) {
  assert(surveyData.respondents === null, 'survey.json respondents is null (zero invented counts)');
  assert(Array.isArray(surveyData.categories), 'survey.json categories is an array');
  assert(Array.isArray(surveyData.observations), 'survey.json observations is an array');
} else {
  assert(typeof surveyData.respondents === 'number' && surveyData.respondents > 0, `survey.json has valid respondents count: ${surveyData.respondents}`);
  assert(Array.isArray(surveyData.categories) && surveyData.categories.length > 0, `survey.json has ${surveyData.categories.length} categories`);
  
  const VALID_SURVEY_CATEGORIES = [
    ...VALID_CATEGORIES,
    'Shampoo',
    'Hand Wash'
  ];

  // Validate each category and brand
  surveyData.categories.forEach(cat => {
    assert(VALID_SURVEY_CATEGORIES.includes(cat.category), `Survey category is valid: ${cat.category}`);
    assert(typeof cat.respondents === 'number' && cat.respondents >= 0, `Category ${cat.category} has valid respondents: ${cat.respondents}`);
    assert(typeof cat.otherCount === 'number' && cat.otherCount >= 0, `Category ${cat.category} has valid otherCount: ${cat.otherCount}`);
    
    let brandCountSum = 0;
    (cat.brands || []).forEach(b => {
      assert(b.brand && typeof b.brand === 'string', `Brand in ${cat.category} has valid name: ${b.brand}`);
      assert(typeof b.count === 'number' && b.count >= 0, `Brand ${b.brand} has valid count: ${b.count}`);
      brandCountSum += b.count;

      // Validate percentage calculation: percentage = count / category respondents * 100 (rounded to 1 decimal place)
      if (cat.respondents > 0) {
        const expectedPercentage = Math.round((b.count / cat.respondents) * 100 * 10) / 10;
        assert(Math.abs(b.percentage - expectedPercentage) <= 0.1, `Brand ${b.brand} percentage (${b.percentage}%) matches formula (${expectedPercentage}%)`);
      }

      // Validate product ID matching
      if (b.productId !== null && b.productId !== undefined) {
        const matchedProd = products.find(p => p.id === b.productId);
        assert(matchedProd !== undefined, `Brand ${b.brand} matches existing product ID: ${b.productId}`);
        assert(matchedProd.category === cat.category, `Matched product ${b.productId} matches category ${cat.category}`);
      }
    });
  });
}

// 4. Data Integrity Audit (methodology.json)
console.log('\n--- 4. Methodology Dataset Audit (methodology.json) ---');
const methodologyPath = resolve(rootDir, 'public/data/methodology.json');
assert(existsSync(methodologyPath), 'methodology.json exists');
const methodologyData = JSON.parse(readFileSync(methodologyPath, 'utf-8'));
assert(Array.isArray(methodologyData.scoringFactors) && methodologyData.scoringFactors.length === 5, 'methodology.json has 5 factors');
assert(methodologyData.totalMaximumPoints === 100, 'methodology.json totalMaximumPoints is 100');
assert(methodologyData.scoreCalculation?.formula === 'max(1.0, total / 10)', 'methodology.json formula is max(1.0, total / 10)');
assert(methodologyData.disclaimer === METHODOLOGY_DISCLAIMER, 'methodology.json includes standard educational disclaimer');

// 5. Search Engine & Normalization Audit
console.log('\n--- 5. Search Engine & Filtering Audit ---');
assert(normalizeText('  Vérified Shampôo  ') === 'verified shampoo', 'normalizeText strips accents and whitespace');
assert(normalizeText('Éléments') === 'elements', 'normalizeText handles complex diacritics');

const multiWordMatches = filterProducts(products, { query: 'dandruff shampoo' });
assert(multiWordMatches.length > 0, 'Multi-word search "dandruff shampoo" succeeds');

const filteredByCat = filterProducts(products, { category: 'Toothpaste' });
assert(filteredByCat.every(p => p.category === 'Toothpaste'), 'Category filter returns only Toothpaste products');

// 6. Scoring Engine & Boundary Value Audit
console.log('\n--- 6. Scoring Engine & Boundary Value Audit ---');
// Factor Limits
assert(FACTOR_LIMITS.ingredientConcernProfile === 35, 'Ingredient concern limit = 35');
assert(FACTOR_LIMITS.exposureCharacteristics === 20, 'Exposure characteristics limit = 20');
assert(FACTOR_LIMITS.frequencyOfUse === 15, 'Frequency of use limit = 15');
assert(FACTOR_LIMITS.evidenceStrength === 20, 'Evidence strength limit = 20');
assert(FACTOR_LIMITS.concernAreas === 10, 'Concern areas limit = 10');

// Score calculations & bands
assert(calculateDisplayedScore(0) === 1.0, '0 total points -> 1.0 floor');
assert(calculateDisplayedScore(35) === 3.5, '35 total points -> 3.5');
assert(getScoreBand(3.5).label === 'Lower identified concern', '3.5 is Lower identified concern');
assert(calculateDisplayedScore(50) === 5.0, '50 total points -> 5.0');
assert(getScoreBand(5.0).label === 'Moderate identified concern', '5.0 is Moderate identified concern');
assert(calculateDisplayedScore(90) === 9.0, '90 total points -> 9.0');
assert(getScoreBand(9.0).label === 'Higher identified concern', '9.0 is Higher identified concern');
assert(calculateDisplayedScore(100) === 10.0, '100 total points -> 10.0');

// Factor Validation Rejections
assert(!validateFactors({ ingredientConcernProfile: 36, exposureCharacteristics: 10, frequencyOfUse: 10, evidenceStrength: 10, concernAreas: 5 }).valid, 'Rejects factor > 35');
assert(!validateFactors({ ingredientConcernProfile: 10, exposureCharacteristics: -1, frequencyOfUse: 10, evidenceStrength: 10, concernAreas: 5 }).valid, 'Rejects negative factor');
assert(!validateFactors({ ingredientConcernProfile: 'ten' }).valid, 'Rejects string factor');

// 7. Renderers & Fallbacks Audit
console.log('\n--- 7. Component Renderers & Clean Fallbacks Audit ---');
const mockContainer = { innerHTML: '' };

// Product details rendering (catalog product)
renderProductDetail(mockContainer, products[0], []);
assert(mockContainer.innerHTML.includes('Product Information'), 'Product Information section rendered');
assert(mockContainer.innerHTML.includes('Chemical Awareness Score'), 'Chemical Awareness Score section rendered');
assert(mockContainer.innerHTML.includes('Five-Factor Methodology Breakdown'), 'Five-factor score breakdown rendered');
assert(mockContainer.innerHTML.includes('Ingredients Requiring Awareness'), 'Ingredients Requiring Awareness rendered');
assert(mockContainer.innerHTML.includes('All Ingredients'), 'All Ingredients table rendered');

// Scored product template breakdown test
const scoredTemplate = {
  ...products[0],
  score: {
    status: 'scored',
    factors: { ingredientConcernProfile: 15, exposureCharacteristics: 5, frequencyOfUse: 5, evidenceStrength: 10, concernAreas: 5 },
    total: 40,
    displayedScore: 4.0
  }
};
renderProductDetail(mockContainer, scoredTemplate, []);
assert(mockContainer.innerHTML.includes('Five-Factor Methodology Breakdown'), 'Five-factor score breakdown rendered');

// Unrated product fallback test
const unratedContainer = { innerHTML: '' };
renderProductDetail(unratedContainer, { ...products[0], score: null, usage: null }, []);
assert(unratedContainer.innerHTML.includes('Not yet scored'), '"Not yet scored" fallback rendered for unrated product');
assert(unratedContainer.innerHTML.includes('Manufacturer guidance not captured'), 'Missing usage displays "Manufacturer guidance not captured"');

// Survey rendering (populated survey state)
renderSurvey(mockContainer, surveyData);
assert(mockContainer.innerHTML.includes('College Survey Results') && mockContainer.innerHTML.includes('53 student survey participants'), 'Survey renders populated results table and participant count');

// Survey no-data fallback rendering
const pendingMock = { innerHTML: '' };
renderSurvey(pendingMock, { schemaVersion: '1.0', status: 'no_data', respondents: null, categories: [] });
assert(pendingMock.innerHTML.includes('Survey results not yet available.'), 'Survey displays "Survey results not yet available." for pending data');

// Methodology rendering
renderMethodology(mockContainer, methodologyData);
assert(mockContainer.innerHTML.includes('Five Scoring Factors'), 'Methodology renders five factors');
assert(mockContainer.innerHTML.includes('max(1.0, totalPoints / 10)'), 'Methodology renders displayed score formula');
assert(mockContainer.innerHTML.includes('This is an educational project metric and NOT an official medical'), 'Methodology renders official disclaimer');

console.log('\n====================================================');
console.log(`🎉 ALL ${passedChecks}/${totalChecks} QA AUDIT CHECKS PASSED WITH 100% SUCCESS!`);
console.log('====================================================');
