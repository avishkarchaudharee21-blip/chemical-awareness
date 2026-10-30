/**
 * Chemical Awareness Scoring Engine & Methodology Calculations
 * 
 * Five-Factor Scoring Model (Total: 100 points):
 * 1. Ingredient concern profile  — 35 points max
 * 2. Exposure characteristics     — 20 points max
 * 3. Frequency of use             — 15 points max
 * 4. Evidence strength            — 20 points max
 * 5. Concern areas                — 10 points max
 * 
 * Displayed score: max(1.0, total / 10) on a 1.0 to 10.0 scale.
 * 
 * Score Bands:
 * - 1.0–3.9 = Lower identified concern
 * - 4.0–6.9 = Moderate identified concern
 * - 7.0–10.0 = Higher identified concern
 * 
 * Higher score means: "Higher level of identified chemical-awareness concerns based on the project's methodology."
 * Educational Disclaimer: "This is an educational project metric and NOT an official medical, regulatory or safety rating."
 */

export const FACTOR_LIMITS = {
  ingredientConcernProfile: 35,
  exposureCharacteristics: 20,
  frequencyOfUse: 15,
  evidenceStrength: 20,
  concernAreas: 10
};

export const TOTAL_MAX_POINTS = 100;

export const SCORE_BANDS = {
  LOWER: {
    min: 1.0,
    max: 3.9,
    label: 'Lower identified concern',
    badgeClass: 'badge-low',
    color: '#059669',
    description: 'Lower level of identified chemical-awareness concerns relative to evaluated categories.'
  },
  MODERATE: {
    min: 4.0,
    max: 6.9,
    label: 'Moderate identified concern',
    badgeClass: 'badge-moderate',
    color: '#d97706',
    description: 'Moderate level of identified chemical-awareness concerns based on formulation and exposure.'
  },
  HIGHER: {
    min: 7.0,
    max: 10.0,
    label: 'Higher identified concern',
    badgeClass: 'badge-high',
    color: '#e11d48',
    description: 'Higher level of identified chemical-awareness concerns based on the project\'s methodology.'
  },
  UNRATED: {
    label: 'Not yet scored',
    badgeClass: 'badge-unrated',
    color: '#64748b',
    description: 'Awaiting verified quantitative scoring assessment.'
  }
};

export const METHODOLOGY_DISCLAIMER = 'This is an educational project metric and NOT an official medical, regulatory or safety rating.';
export const HIGHER_SCORE_INTERPRETATION = 'Higher level of identified chemical-awareness concerns based on the project\'s methodology.';

/**
 * Validate factor points against their allowable ranges and data types
 * @param {Object} factors Factor values map
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateFactors(factors) {
  const errors = [];

  if (!factors || typeof factors !== 'object' || Array.isArray(factors)) {
    return { valid: false, errors: ['Factors input must be an object with numeric factor scores.'] };
  }

  for (const [key, limit] of Object.entries(FACTOR_LIMITS)) {
    const val = factors[key];
    if (val === undefined || val === null) {
      errors.push(`Missing factor '${key}'.`);
    } else if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
      errors.push(`Factor '${key}' must be a finite number.`);
    } else if (val < 0) {
      errors.push(`Factor '${key}' cannot be negative (received: ${val}).`);
    } else if (val > limit) {
      errors.push(`Factor '${key}' exceeds maximum allowable points of ${limit} (received: ${val}).`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate total points from 5 validated factors
 * @param {Object} factors 
 * @returns {number} Sum of factor points (0 to 100)
 */
export function calculateTotalPoints(factors) {
  const validation = validateFactors(factors);
  if (!validation.valid) {
    throw new Error(`Invalid factor points: ${validation.errors.join('; ')}`);
  }

  const total = factors.ingredientConcernProfile +
                factors.exposureCharacteristics +
                factors.frequencyOfUse +
                factors.evidenceStrength +
                factors.concernAreas;

  return Number(total.toFixed(2));
}

/**
 * Calculate displayed score using formula: max(1.0, total / 10)
 * Clamped between 1.0 and 10.0, rounded to 1 decimal place.
 * @param {number} totalPoints 
 * @returns {number} Score on 1.0 - 10.0 scale
 */
export function calculateDisplayedScore(totalPoints) {
  if (typeof totalPoints !== 'number' || isNaN(totalPoints) || !isFinite(totalPoints) || totalPoints < 0 || totalPoints > 100) {
    throw new Error(`Total points must be a number between 0 and 100 (received: ${totalPoints}).`);
  }

  const rawScore = totalPoints / 10;
  const displayed = Math.max(1.0, Math.min(10.0, rawScore));
  return Number(displayed.toFixed(1));
}

/**
 * Determine score band from displayed score
 * 1.0–3.9 = Lower identified concern
 * 4.0–6.9 = Moderate identified concern
 * 7.0–10.0 = Higher identified concern
 * @param {number|null} displayedScore 
 * @returns {Object} Score band object
 */
export function getScoreBand(displayedScore) {
  if (displayedScore === null || displayedScore === undefined || typeof displayedScore !== 'number' || isNaN(displayedScore)) {
    return SCORE_BANDS.UNRATED;
  }

  if (displayedScore >= 1.0 && displayedScore <= 3.9) {
    return SCORE_BANDS.LOWER;
  }
  if (displayedScore >= 4.0 && displayedScore <= 6.9) {
    return SCORE_BANDS.MODERATE;
  }
  if (displayedScore >= 7.0 && displayedScore <= 10.0) {
    return SCORE_BANDS.HIGHER;
  }

  return SCORE_BANDS.UNRATED;
}

// Alias for backwards compatibility
export const getHazardTier = getScoreBand;

/**
 * Comprehensive Chemical Awareness Score calculation pipeline
 * @param {Object} factors 
 * @returns {Object} Full score breakdown object
 */
export function calculateScore(factors) {
  const validation = validateFactors(factors);
  if (!validation.valid) {
    return {
      valid: false,
      errors: validation.errors
    };
  }

  const totalPoints = calculateTotalPoints(factors);
  const displayedScore = calculateDisplayedScore(totalPoints);
  const band = getScoreBand(displayedScore);

  return {
    valid: true,
    factors: { ...factors },
    limits: { ...FACTOR_LIMITS },
    totalPoints,
    maxPossiblePoints: TOTAL_MAX_POINTS,
    displayedScore,
    band: band.label,
    badgeClass: band.badgeClass,
    interpretation: HIGHER_SCORE_INTERPRETATION,
    disclaimer: METHODOLOGY_DISCLAIMER
  };
}

/**
 * Render an HTML badge for score
 * @param {number|Object|null} score 
 * @returns {string} HTML markup for badge
 */
export function renderScoreBadge(score) {
  let numScore = score;
  if (score && typeof score === 'object') {
    if (score.status === 'not_scored' || score.displayedScore === null || score.displayedScore === undefined) {
      numScore = null;
    } else {
      numScore = score.displayedScore;
    }
  }
  if (numScore === null || numScore === undefined || typeof numScore !== 'number' || isNaN(numScore)) {
    return `<span class="badge badge-unrated" title="Product has not yet been assigned a numerical score">Not yet scored</span>`;
  }
  const band = getScoreBand(numScore);
  return `<span class="badge ${band.badgeClass}" title="${band.description}">${numScore.toFixed(1)} &bull; ${band.label}</span>`;
}

/**
 * Render verification status badge
 * @param {string} status 'verified' | 'partial' | 'verification_required'
 * @returns {string} HTML markup
 */
export function renderVerificationBadge(status) {
  switch (status) {
    case 'verified':
      return `<span class="badge badge-verified" title="Formulation verified against public label"><svg class="icon-sm" viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg> Verified</span>`;
    case 'partial':
      return `<span class="badge badge-partial" title="Partial formulation data available">Partial</span>`;
    case 'verification_required':
    default:
      return `<span class="badge badge-required" title="Requires additional primary source validation">Verification Required</span>`;
  }
}
