import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

export function normalizeBrandKey(brand) {
  if (!brand || typeof brand !== 'string') return '';
  return brand
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates privacy rules on any survey object
 * Returns { valid: boolean, violations: string[] }
 */
export function validateSurveyPrivacy(data) {
  const violations = [];
  const forbiddenKeywords = ['email', 'phone', 'mobile', 'student', 'rollno', 'individual', 'personal', 'fullname', 'firstname', 'lastname', 'respondentname'];
  
  function checkObject(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      const keyLower = key.toLowerCase();

      if (forbiddenKeywords.some(kw => keyLower.includes(kw))) {
        violations.push(`PII field detected at '${currentPath}'`);
      } else if (keyLower === 'name' && !['categories', 'brands'].includes(path.split('.').pop())) {
        violations.push(`Personal name field detected at '${currentPath}'`);
      }

      if (typeof obj[key] === 'string') {
        // Check for email patterns
        if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(obj[key])) {
          violations.push(`Email address detected in value at '${currentPath}'`);
        }
        // Check for 10-digit phone number patterns
        if (/\b\d{10}\b/.test(obj[key].replace(/[\s-]/g, '')) && !['schemaVersion'].includes(key)) {
          violations.push(`Potential phone number pattern detected at '${currentPath}'`);
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        checkObject(obj[key], currentPath);
      }
    }
  }

  checkObject(data);
  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Builds and validates aggregated survey dataset
 */
export function buildSurveyDataset(inputSurveyData, products) {
  const privacyCheck = validateSurveyPrivacy(inputSurveyData);
  if (!privacyCheck.valid) {
    throw new Error(`Survey privacy validation failed: ${privacyCheck.violations.join(', ')}`);
  }

  if (!inputSurveyData || inputSurveyData.status === 'no_data' || inputSurveyData.respondents === null) {
    return {
      schemaVersion: "1.0",
      status: "no_data",
      collectedOn: inputSurveyData?.collectedOn || null,
      selectionMode: inputSurveyData?.selectionMode || null,
      respondents: null,
      categories: [],
      observations: []
    };
  }

  const totalRespondents = inputSurveyData.respondents;
  const processedCategories = (inputSurveyData.categories || []).map(cat => {
    const catRespondents = cat.respondents !== undefined ? cat.respondents : (cat.count !== undefined ? cat.count : totalRespondents);
    const otherCount = cat.otherCount !== undefined ? cat.otherCount : 0;
    
    const processedBrands = (cat.brands || []).map(b => {
      const brandName = b.brand || b.name;
      const brandKey = b.brandKey || normalizeBrandKey(brandName);
      const count = typeof b.count === 'number' ? b.count : 0;
      
      // Calculate percentage automatically: percentage = count / category respondents * 100 (rounded to 1 decimal place)
      const calculatedPercentage = catRespondents > 0 
        ? Math.round((count / catRespondents) * 100 * 10) / 10 
        : 0;

      // Match product ID where category and brandKey match
      const matchedProduct = products.find(p => p.category === cat.category && p.brandKey === brandKey);
      const productId = matchedProduct ? matchedProduct.id : null;

      return {
        brand: brandName,
        brandKey: brandKey,
        count: count,
        percentage: calculatedPercentage,
        productId: productId,
        otherResponses: b.otherResponses || null
      };
    });

    const categoryPercentage = totalRespondents > 0
      ? Math.round((catRespondents / totalRespondents) * 100 * 10) / 10
      : 0;

    return {
      category: cat.category,
      respondents: catRespondents,
      count: catRespondents,
      percentage: categoryPercentage,
      otherCount: otherCount,
      brands: processedBrands
    };
  });

  return {
    schemaVersion: "1.0",
    status: inputSurveyData.status || "aggregated",
    collectedOn: inputSurveyData.collectedOn || null,
    selectionMode: inputSurveyData.selectionMode || "Voluntary Campus Sampling",
    respondents: totalRespondents,
    categories: processedCategories,
    observations: inputSurveyData.observations || []
  };
}
