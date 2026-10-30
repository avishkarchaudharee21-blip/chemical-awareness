/**
 * Data layer for Chemical Awareness College Project
 * Handles fetching, caching, and querying local datasets (products, survey, methodology).
 */

const DATA_CACHE = {
  products: null,
  survey: null,
  methodology: null
};

export const CATEGORIES = [
  'Shampoo / Conditioner',
  'Body Wash / Bar Soap',
  'Toothpaste',
  'House Cleaning Products',
  'Facial Cleanser / Face Wash',
  'Deodorant / Perfume',
  'Detergent / Cloth Washing Soap',
  'Dishwashing / Utensil Cleaning'
];

/**
 * Fetch all products from products.json
 * @returns {Promise<Array>} Array of product objects
 */
export async function fetchProducts() {
  if (DATA_CACHE.products) {
    return DATA_CACHE.products;
  }
  try {
    const res = await fetch('/data/products.json');
    if (!res.ok) {
      throw new Error(`Failed to load products.json (${res.status} ${res.statusText})`);
    }
    const data = await res.json();
    DATA_CACHE.products = data;
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetch a single product by ID
 * @param {string} id Product identifier
 * @returns {Promise<Object|null>} Product object or null
 */
export async function fetchProductById(id) {
  const products = await fetchProducts();
  return products.find(p => p.id === id) || null;
}

/**
 * Fetch survey findings dataset
 * @returns {Promise<Object|null>} Survey dataset
 */
export async function fetchSurveyData() {
  if (DATA_CACHE.survey) {
    return DATA_CACHE.survey;
  }
  try {
    const res = await fetch('/data/survey.json');
    if (!res.ok) {
      throw new Error(`Failed to load survey.json (${res.status} ${res.statusText})`);
    }
    const data = await res.json();
    DATA_CACHE.survey = data;
    return data;
  } catch (error) {
    console.error('Error fetching survey data:', error);
    return null;
  }
}

/**
 * Fetch scientific methodology dataset
 * @returns {Promise<Object|null>} Methodology dataset
 */
export async function fetchMethodologyData() {
  if (DATA_CACHE.methodology) {
    return DATA_CACHE.methodology;
  }
  try {
    const res = await fetch('/data/methodology.json');
    if (!res.ok) {
      throw new Error(`Failed to load methodology.json (${res.status} ${res.statusText})`);
    }
    const data = await res.json();
    DATA_CACHE.methodology = data;
    return data;
  } catch (error) {
    console.error('Error fetching methodology data:', error);
    return null;
  }
}
