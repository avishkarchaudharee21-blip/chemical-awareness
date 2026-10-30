import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

export const VALID_CATEGORIES = [
  'Shampoo / Conditioner',
  'Body Wash / Bar Soap',
  'Toothpaste',
  'House Cleaning Products',
  'Facial Cleanser / Face Wash',
  'Deodorant / Perfume',
  'Detergent / Cloth Washing Soap',
  'Dishwashing / Utensil Cleaning'
];

export const VALID_VERIFICATION_STATUSES = ['verified', 'partial', 'verification_required'];
export const VALID_CONFIDENCE_LEVELS = ['high', 'medium', 'low'];

export function validateProducts(products) {
  const errors = [];
  const seenIds = new Set();

  if (!Array.isArray(products)) {
    return { valid: false, errors: ['Products data must be a JSON array.'] };
  }

  products.forEach((p, idx) => {
    const loc = `Product #${idx + 1} (${p.id || 'missing id'})`;

    // ID Validation
    if (!p.id || typeof p.id !== 'string') {
      errors.push(`${loc}: Missing or non-string 'id'.`);
    } else if (seenIds.has(p.id)) {
      errors.push(`${loc}: Duplicate ID '${p.id}'.`);
    } else {
      seenIds.add(p.id);
    }

    // Category Validation
    if (!p.category || !VALID_CATEGORIES.includes(p.category)) {
      errors.push(`${loc}: Invalid category '${p.category}'. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }

    // Name & Brand
    if (!p.name || typeof p.name !== 'string') {
      errors.push(`${loc}: Missing or non-string 'name'.`);
    }
    if (!p.brand || typeof p.brand !== 'string') {
      errors.push(`${loc}: Missing or non-string 'brand'.`);
    }
    if (!p.brandKey || typeof p.brandKey !== 'string') {
      errors.push(`${loc}: Missing or non-string 'brandKey'.`);
    }

    // Status Validation
    if (!p.verificationStatus || !VALID_VERIFICATION_STATUSES.includes(p.verificationStatus)) {
      errors.push(`${loc}: Invalid verificationStatus '${p.verificationStatus}'. Must be one of: ${VALID_VERIFICATION_STATUSES.join(', ')}`);
    }
    if (!p.dataConfidence || !VALID_CONFIDENCE_LEVELS.includes(p.dataConfidence)) {
      errors.push(`${loc}: Invalid dataConfidence '${p.dataConfidence}'. Must be one of: ${VALID_CONFIDENCE_LEVELS.join(', ')}`);
    }

    // Ingredients Validation
    if (!Array.isArray(p.ingredients)) {
      errors.push(`${loc}: 'ingredients' must be an array.`);
    } else {
      p.ingredients.forEach((ing, ingIdx) => {
        const ingLoc = `${loc} > Ingredient #${ingIdx + 1} (${ing.name || 'unnamed'})`;
        if (!ing.name || typeof ing.name !== 'string') {
          errors.push(`${ingLoc}: Missing or non-string 'name'.`);
        }
        if (ing.sourceIds !== undefined && !Array.isArray(ing.sourceIds)) {
          errors.push(`${ingLoc}: 'sourceIds' must be an array.`);
        }
      });
    }

    // Sources & Alternatives
    if (!Array.isArray(p.sources)) {
      errors.push(`${loc}: 'sources' must be an array.`);
    }
    if (!Array.isArray(p.alternatives)) {
      errors.push(`${loc}: 'alternatives' must be an array.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    totalCount: products.length
  };
}

export function runValidation() {
  const productsPath = resolve(rootDir, 'public/data/products.json');

  if (!existsSync(productsPath)) {
    console.error(`❌ Products file not found at: ${productsPath}`);
    process.exit(1);
  }

  let products;
  try {
    const raw = readFileSync(productsPath, 'utf-8');
    products = JSON.parse(raw);
  } catch (err) {
    console.error(`❌ JSON parse error in ${productsPath}:`, err.message);
    process.exit(1);
  }

  const result = validateProducts(products);
  if (!result.valid) {
    console.error(`❌ Products validation failed with ${result.errors.length} error(s):`);
    result.errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log(`✅ Products database validation successful: ${result.totalCount} products loaded and verified without errors.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runValidation();
}
