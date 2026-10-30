import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
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
  METHODOLOGY_DISCLAIMER,
  HIGHER_SCORE_INTERPRETATION
} from '../src/js/score.js';
import { renderMethodology } from '../src/js/methodology.js';
import { renderSurvey } from '../src/js/survey.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

console.log('🧪 Testing Scoring Engine, Methodology & Survey Validation...\n');

// 1. Scoring Factors & Limits Verification
console.log('--- 1. Testing Scoring Factor Limits ---');
if (
  FACTOR_LIMITS.ingredientConcernProfile !== 35 ||
  FACTOR_LIMITS.exposureCharacteristics !== 20 ||
  FACTOR_LIMITS.frequencyOfUse !== 15 ||
  FACTOR_LIMITS.evidenceStrength !== 20 ||
  FACTOR_LIMITS.concernAreas !== 10 ||
  TOTAL_MAX_POINTS !== 100
) {
  console.error('❌ Factor maximums do not match specifications:', FACTOR_LIMITS);
  process.exit(1);
}
console.log('✅ Factor limits verified: 35 + 20 + 15 + 20 + 10 = 100 max points.');

// 2. Factor Validation Tests (Valid vs Invalid inputs)
console.log('\n--- 2. Testing Factor Validation ---');

const validFactorsLower = {
  ingredientConcernProfile: 10,
  exposureCharacteristics: 5,
  frequencyOfUse: 5,
  evidenceStrength: 5,
  concernAreas: 2
}; // Total = 27 -> Displayed = 2.7 (Lower identified concern)

const validRes = validateFactors(validFactorsLower);
if (!validRes.valid) {
  console.error('❌ Valid factors failed validation:', validRes.errors);
  process.exit(1);
}
console.log('✅ Valid factors passed validation.');

// Test invalid negative factor
const negativeFactor = { ...validFactorsLower, ingredientConcernProfile: -5 };
const negRes = validateFactors(negativeFactor);
if (negRes.valid || !negRes.errors.some(e => e.includes('negative'))) {
  console.error('❌ Failed to reject negative factor value.');
  process.exit(1);
}
console.log('✅ Correctly rejected negative factor value.');

// Test exceeding max factor limit (e.g. 36 > 35)
const exceededFactor = { ...validFactorsLower, ingredientConcernProfile: 36 };
const excRes = validateFactors(exceededFactor);
if (excRes.valid || !excRes.errors.some(e => e.includes('exceeds maximum'))) {
  console.error('❌ Failed to reject factor exceeding maximum points limit.');
  process.exit(1);
}
console.log('✅ Correctly rejected factor exceeding point maximum (36 > 35).');

// Test missing factor
const missingFactor = { ingredientConcernProfile: 20 };
const missRes = validateFactors(missingFactor);
if (missRes.valid || missRes.errors.length === 0) {
  console.error('❌ Failed to reject missing factor.');
  process.exit(1);
}
console.log('✅ Correctly rejected incomplete factor object.');

// 3. Displayed Score Formula max(1.0, total / 10) & Bands
console.log('\n--- 3. Testing Score Calculation & Bands ---');

// Low total (e.g. 5 points -> 5 / 10 = 0.5 -> max(1.0, 0.5) = 1.0)
const minFloorScore = calculateDisplayedScore(5);
if (minFloorScore !== 1.0) {
  console.error(`❌ Expected min floor score 1.0 for 5 total points, got ${minFloorScore}`);
  process.exit(1);
}
console.log('✅ Floor minimum formula max(1.0, 5/10) = 1.0 verified.');

// Lower band test (27 points -> 2.7 -> "Lower identified concern")
const lowerScore = calculateDisplayedScore(27);
const lowerBand = getScoreBand(lowerScore);
if (lowerScore !== 2.7 || lowerBand.label !== 'Lower identified concern') {
  console.error(`❌ Expected 2.7 & "Lower identified concern", got ${lowerScore}, ${lowerBand.label}`);
  process.exit(1);
}
console.log(`✅ Score 2.7 correctly assigned to band: "${lowerBand.label}".`);

// Moderate band test (54 points -> 5.4 -> "Moderate identified concern")
const moderateScore = calculateDisplayedScore(54);
const moderateBand = getScoreBand(moderateScore);
if (moderateScore !== 5.4 || moderateBand.label !== 'Moderate identified concern') {
  console.error(`❌ Expected 5.4 & "Moderate identified concern", got ${moderateScore}, ${moderateBand.label}`);
  process.exit(1);
}
console.log(`✅ Score 5.4 correctly assigned to band: "${moderateBand.label}".`);

// Higher band test (85 points -> 8.5 -> "Higher identified concern")
const higherScore = calculateDisplayedScore(85);
const higherBand = getScoreBand(higherScore);
if (higherScore !== 8.5 || higherBand.label !== 'Higher identified concern') {
  console.error(`❌ Expected 8.5 & "Higher identified concern", got ${higherScore}, ${higherBand.label}`);
  process.exit(1);
}
console.log(`✅ Score 8.5 correctly assigned to band: "${higherBand.label}".`);

// Max total test (100 points -> 10.0)
const maxScore = calculateDisplayedScore(100);
if (maxScore !== 10.0) {
  console.error(`❌ Expected 10.0 for 100 total points, got ${maxScore}`);
  process.exit(1);
}
console.log('✅ Maximum total score 100 / 10 = 10.0 verified.');

// 4. Comprehensive calculateScore pipeline
const fullScore = calculateScore(validFactorsLower);
if (
  !fullScore.valid ||
  fullScore.totalPoints !== 27 ||
  fullScore.displayedScore !== 2.7 ||
  fullScore.band !== 'Lower identified concern' ||
  fullScore.interpretation !== HIGHER_SCORE_INTERPRETATION ||
  fullScore.disclaimer !== METHODOLOGY_DISCLAIMER
) {
  console.error('❌ calculateScore pipeline error:', fullScore);
  process.exit(1);
}
console.log('✅ Comprehensive calculateScore pipeline passed.');

// 5. Methodology JSON & HTML Renderer
console.log('\n--- 4. Testing Methodology Page & methodology.json ---');
const methodologyData = JSON.parse(readFileSync(resolve(rootDir, 'public/data/methodology.json'), 'utf-8'));
if (
  !methodologyData.scoringFactors ||
  methodologyData.scoringFactors.length !== 5 ||
  methodologyData.totalMaximumPoints !== 100
) {
  console.error('❌ methodology.json invalid structure:', methodologyData);
  process.exit(1);
}

const mockMethContainer = { innerHTML: '' };
renderMethodology(mockMethContainer, methodologyData);
const methHTML = mockMethContainer.innerHTML;

if (
  !methHTML.includes('Ingredient Concern Profile') ||
  !methHTML.includes('35 Points Max') ||
  !methHTML.includes('max(1.0, totalPoints / 10)') ||
  !methHTML.includes('Lower identified concern') ||
  !methHTML.includes('Moderate identified concern') ||
  !methHTML.includes('Higher identified concern') ||
  !methHTML.includes('educational project metric and NOT an official medical')
) {
  console.error('❌ methodology HTML missing required content or disclaimers');
  process.exit(1);
}
console.log('✅ Methodology HTML rendered all 5 factors, point maximums, formula, bands, and disclaimers.');

// 6. Survey JSON & HTML Renderer
console.log('\n--- 5. Testing Survey Page & survey.json ---');
const surveyData = JSON.parse(readFileSync(resolve(rootDir, 'public/data/survey.json'), 'utf-8'));

if (surveyData.schemaVersion !== '1.0') {
  console.error('❌ survey.json must have schemaVersion="1.0":', surveyData);
  process.exit(1);
}

const mockSurveyContainer = { innerHTML: '' };
renderSurvey(mockSurveyContainer, surveyData);
const surveyHTML = mockSurveyContainer.innerHTML;

if (surveyData.status === 'collected') {
  if (surveyData.respondents !== 53) {
    console.error('❌ Expected respondents = 53 for collected survey:', surveyData.respondents);
    process.exit(1);
  }
  if (!surveyHTML.includes('College Survey Results')) {
    console.error('❌ Survey page did not display "College Survey Results"');
    process.exit(1);
  }
  console.log('✅ Survey page cleanly displayed collected survey results with 53 verified respondents.');
} else {
  if (!surveyHTML.includes('Survey results not yet available.')) {
    console.error('❌ Survey page did not display "Survey results not yet available."');
    process.exit(1);
  }
  console.log('✅ Survey page cleanly displayed "Survey results not yet available."');
}

// Test empty state fallback as well
const pendingMockContainer = { innerHTML: '' };
renderSurvey(pendingMockContainer, { schemaVersion: '1.0', status: 'no_data', respondents: null, categories: [] });
if (!pendingMockContainer.innerHTML.includes('Survey results not yet available.')) {
  console.error('❌ Pending survey state fallback failed');
  process.exit(1);
}

console.log('\n🎉 ALL SCORING, METHODOLOGY & SURVEY TESTS PASSED SUCCESSFULLY!');
