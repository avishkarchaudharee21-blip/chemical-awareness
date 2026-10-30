import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FACTOR_LIMITS,
  TOTAL_MAX_POINTS,
  calculateScore,
  validateFactors
} from '../src/js/score.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const productsPath = resolve(rootDir, 'public/data/products.json');
const products = JSON.parse(readFileSync(productsPath, 'utf-8'));

// Scientific 5-Factor evaluation for each product grounded in verified formulation data
const PRODUCT_FACTOR_EVALUATIONS = {
  // 1. Clarifying Citrus Shampoo (SLS, Fragrance, Phenoxyethanol -> Rinse-off, 2-3x/wk)
  'clarifying-citrus-shampoo': {
    factors: {
      ingredientConcernProfile: 19.5, // SLS primary irritant + Fragrance allergen + Phenoxyethanol
      exposureCharacteristics: 6.0,   // Rinse-off hair wash, contact < 3 min
      frequencyOfUse: 6.0,            // 2-3 times per week
      evidenceStrength: 15.0,         // Strong CIR, ECHA, SCCS regulatory dossiers
      concernAreas: 4.5               // Dermal barrier irritation + contact allergy
    },
    rationale: 'Contains anionic SLS surfactant and synthetic fragrance in a short-contact rinse-off formulation, presenting moderate dermal barrier and fragrance sensitivity considerations under regular use.'
  },

  // 2. Botanic Balance Sulfate-Free Scalp Shampoo (Coco-Glucoside, Glycerin, Citric Acid -> Rinse-off, daily/weekly)
  'botanic-gentle-scalp-shampoo': {
    factors: {
      ingredientConcernProfile: 4.0,  // Ultra-mild non-ionic glucosides, biocompatible glycerin
      exposureCharacteristics: 5.0,   // Rinse-off hair wash
      frequencyOfUse: 6.0,            // 2-3 times per week / daily
      evidenceStrength: 13.0,         // CIR, ECHA assessments of alkyl polyglucosides
      concernAreas: 1.5               // Low ocular/dermal reactivity
    },
    rationale: 'Formulated with ultra-mild non-ionic surfactants and skin-identical humectants with negligible irritation potential in rinse-off applications.'
  },

  // 3. Botanic Nourish Hair Conditioner (Glycerin, Tocopherol, Citric Acid, Phenoxyethanol, Sodium Benzoate)
  'botanic-nourish-hair-conditioner': {
    factors: {
      ingredientConcernProfile: 7.5,  // Mild conditioning lipids with low-concentration preservation (<1%)
      exposureCharacteristics: 5.5,   // Rinse-off hair conditioner
      frequencyOfUse: 6.0,            // 2-3 times per week
      evidenceStrength: 14.0,         // CIR and EU SCCS dossiers for preservatives and antioxidants
      concernAreas: 2.0               // Minimal dermal sensitization potential
    },
    rationale: 'Conditioning formulation based on biocompatible emollients and mild food-grade/cosmetic preservation with low overall concern profile.'
  },

  // 4. ShieldCare Antibacterial Liquid Hand Wash (Triclosan, SLS, Fragrance -> Frequent daily wash)
  'antibac-shield-hand-soap': {
    factors: {
      ingredientConcernProfile: 28.0, // Triclosan biocide (endocrine screening) + SLS + Fragrance
      exposureCharacteristics: 8.0,   // Rinse-off hand wash with repeated barrier exposure
      frequencyOfUse: 13.0,           // Multiple times daily (>5x/day)
      evidenceStrength: 17.5,         // FDA 2016 wash ban, SCCS endocrine & resistance dossiers
      concernAreas: 8.0               // Endocrine disruption screening + aquatic toxicity + contact dermatitis
    },
    rationale: 'Contains chlorinated antimicrobial biocide (Triclosan) and anionic surfactants with high cumulative daily exposure and documented environmental/endocrine review.'
  },

  // 5. Traditional Castile Pure Olive Bar Soap (Sodium Olivate, Glycerin -> Daily wash)
  'pure-castile-olive-soap': {
    factors: {
      ingredientConcernProfile: 3.5,  // Saponified natural olive oil soap base
      exposureCharacteristics: 6.0,   // Rinse-off body/hand wash
      frequencyOfUse: 10.0,           // Daily personal hygiene
      evidenceStrength: 12.0,         // Long historical and CIR cosmetic review
      concernAreas: 1.5               // Mild alkaline barrier disruption only on prolonged contact
    },
    rationale: 'Simple saponified vegetable oil formulation free of synthetic biocides, sulfates, or artificial fragrances with low toxicological concern.'
  },

  // 6. BabyPure Ultra-Sensitive Pediatric Wash (Coco-Glucoside, Glycerin, Tocopherol -> Daily pediatric)
  'baby-pure-cleansing-gel': {
    factors: {
      ingredientConcernProfile: 3.0,  // Pediatric-grade non-ionic surfactants
      exposureCharacteristics: 5.0,   // Gentle rinse-off wash
      frequencyOfUse: 9.0,            // Daily infant bath
      evidenceStrength: 14.0,         // Extensive pediatric dermatology and CIR data
      concernAreas: 1.0               // Hypoallergenic, non-sensitizing profile
    },
    rationale: 'Designed specifically for infant stratum corneum with hypoallergenic non-ionic glucosides and zero flagged sensitizers.'
  },

  // 7. MaxFresh Arctic Blast Whitening Toothpaste (SLS, Sodium Fluoride, Titanium Dioxide, Fragrance)
  'maxfresh-whitening-toothpaste': {
    factors: {
      ingredientConcernProfile: 21.0, // SLS (aphthous ulcer link) + Fluoride ingestion awareness + Fragrance
      exposureCharacteristics: 9.0,   // Oral mucosal contact with trace swallowing risk
      frequencyOfUse: 12.0,           // 2x daily regular oral hygiene
      evidenceStrength: 16.0,         // ADA, FDA dentifrice monographs, CIR SLS studies
      concernAreas: 5.5               // Oral mucosal desquamation, pediatric swallowing awareness
    },
    rationale: 'Conventional high-foaming dentifrice containing SLS and flavor aromatics in oral mucosal exposure with established remineralization efficacy alongside mucosal irritation considerations.'
  },

  // 8. BioEnamel Hydroxyapatite Remineralizing Toothpaste (Hydroxyapatite, Silica, Glycerin)
  'biomimetic-enamel-toothpaste': {
    factors: {
      ingredientConcernProfile: 3.5,  // Biomimetic hydroxyapatite, non-abrasive silica
      exposureCharacteristics: 7.0,   // Oral mucosal contact
      frequencyOfUse: 12.0,           // 2x daily oral hygiene
      evidenceStrength: 14.5,         // SCCS biocompatibility opinion, clinical dental trials
      concernAreas: 1.0               // Non-toxic upon swallowing, non-irritating to mucosa
    },
    rationale: 'SLS-free remineralizing dentifrice utilizing physiological bone/enamel mineral analog with biocompatible oral profile.'
  },

  // 9. SensiShield Gentle Remineralizing Toothpaste (Hydroxyapatite, Silica, Glycerin, Coco-Glucoside, Citrate)
  'sensi-shield-gentle-toothpaste': {
    factors: {
      ingredientConcernProfile: 3.5,  // Hydroxyapatite and mild surfactant
      exposureCharacteristics: 7.0,   // Oral mucosal contact
      frequencyOfUse: 12.0,           // 2x daily oral hygiene
      evidenceStrength: 14.0,         // SCCS and dental literature
      concernAreas: 1.0               // Biocompatible, gentle oral cleansing
    },
    rationale: 'Mild non-foaming remineralizing toothpaste formulated for sensitive dentin without mucosal irritants or artificial flavorings.'
  },

  // 10. FreshGlow Daily Foaming Facial Cleanser (SLS, Fragrance, Phenoxyethanol -> Daily face wash)
  'fresh-glow-daily-cleanser': {
    factors: {
      ingredientConcernProfile: 18.0, // Anionic surfactant + synthetic fragrance on facial skin
      exposureCharacteristics: 7.0,   // Facial rinse-off wash (sensitive periorbital zone)
      frequencyOfUse: 11.0,           // 1-2 times daily
      evidenceStrength: 15.0,         // CIR and SCCS facial dermal dossiers
      concernAreas: 4.5               // Facial barrier disruption, contact dermatitis
    },
    rationale: 'Foaming facial cleanser utilizing SLS and synthetic fragrance with potential for facial barrier dryness and sensitivity on delicate skin.'
  },

  // 11. Pure Botanics Ultra-Calm Facial Gel (Coco-Glucoside, Glycerin, Tocopherol, Citric Acid)
  'pure-botanics-gentle-cleanser': {
    factors: {
      ingredientConcernProfile: 3.0,  // Non-ionic glucoside gel with antioxidants
      exposureCharacteristics: 6.0,   // Facial rinse-off wash
      frequencyOfUse: 11.0,           // 1-2 times daily
      evidenceStrength: 13.5,         // CIR and dermatological testing dossiers
      concernAreas: 1.0               // Non-comedogenic, non-irritating
    },
    rationale: 'Ultra-gentle cleansing gel tailored for reactive facial skin with benign non-ionic surfactant base and zero fragrance allergens.'
  },

  // 12. HydraShield SPF 50 Mineral Defense (Zinc Oxide, Tocopherol, Glycerin -> Daily leave-on)
  'hydrashield-mineral-sunscreen': {
    factors: {
      ingredientConcernProfile: 4.5,  // Non-nano physical mineral filter and antioxidants
      exposureCharacteristics: 14.0,  // All-day leave-on topical application
      frequencyOfUse: 10.0,           // Daily sun protection
      evidenceStrength: 16.0,         // FDA GRASE designation for Zinc Oxide, SCCS evaluations
      concernAreas: 1.5               // Low transdermal absorption, physical barrier mechanism
    },
    rationale: 'Photostable mineral sunscreen providing broad-spectrum UV reflection with negligible transdermal penetration in leave-on use.'
  },

  // 13. LumiGlow Radiant Longwear Liquid Foundation (Methylparaben, Titanium Dioxide, Fragrance -> Leave-on)
  'lumiglow-liquid-foundation': {
    factors: {
      ingredientConcernProfile: 20.0, // Alkyl paraben preservative + Synthetic Fragrance in leave-on format
      exposureCharacteristics: 15.5,  // 8-12 hour daily leave-on facial coverage
      frequencyOfUse: 10.0,           // Daily cosmetic application
      evidenceStrength: 15.5,         // SCCS paraben opinions, IFRA fragrance standards
      concernAreas: 5.5               // Sensitization, endocrine screening for parabens in continuous contact
    },
    rationale: 'Continuous facial leave-on cosmetic containing paraben preservatives and synthetic fragrance with heightened dermal residence time.'
  },

  // 14. PureMineral Clean Breathable Foundation (Zinc Oxide, Mica, Tocopherol, Glycerin -> Leave-on)
  'puremineral-matte-foundation': {
    factors: {
      ingredientConcernProfile: 4.0,  // Inert mineral pigments and vitamin E
      exposureCharacteristics: 14.0,  // Daily leave-on facial makeup
      frequencyOfUse: 10.0,           // Daily application
      evidenceStrength: 14.0,         // CIR cosmetic ingredient reviews for zinc oxide and mica
      concernAreas: 1.5               // Non-comedogenic mineral foundation
    },
    rationale: 'Mineral-based complexion fluid formulated without synthetic preservatives or artificial fragrances with low toxicological impact.'
  },

  // 15. ChloroShield Hospital Grade Bleach Spray (Sodium Hypochlorite, BAK, Carbonate -> Inhalation/Surface)
  'chloroshield-bleach-cleaner': {
    factors: {
      ingredientConcernProfile: 29.5, // Concentrated sodium hypochlorite + Quaternary ammonium BAK
      exposureCharacteristics: 16.5,  // Household aerosolized spray, respiratory/mucosal inhalation hazard
      frequencyOfUse: 4.0,            // Weekly/bi-weekly sanitization
      evidenceStrength: 18.0,         // EPA RED dossiers, NIOSH chemical hazard guides
      concernAreas: 9.0               // Respiratory sensitization, mucosal corrosion, hazardous gas generation
    },
    rationale: 'Potent oxidizing disinfectant producing respiratory and ocular irritation in enclosed spray use; requires dedicated ventilation and personal protection.'
  },

  // 16. OxyPure Hydrogen Peroxide Multi-Surface Cleaner (Hydrogen Peroxide, Coco-Glucoside, Citric Acid)
  'oxyclean-multi-surface-spray': {
    factors: {
      ingredientConcernProfile: 6.5,  // Hydrogen peroxide (3%) breaking down into water and oxygen
      exposureCharacteristics: 11.0,  // Surface spray application
      frequencyOfUse: 5.0,            // Weekly surface cleaning
      evidenceStrength: 15.0,         // EPA Safer Choice and OECD screening dossiers
      concernAreas: 2.5               // Mild transient oxidation without toxic persistent residues
    },
    rationale: 'Chlorine-free oxidizing surface cleaner utilizing dilute hydrogen peroxide with biodegradable surfactants and safe physiological decomposition.'
  },

  // 17. PureClarity Streak-Free Glass Cleaner (Hydrogen Peroxide, Coco-Glucoside, Carbonate, Citric Acid)
  'pureclarity-glass-surface-cleaner': {
    factors: {
      ingredientConcernProfile: 7.0,  // Dilute peroxide and mild builder
      exposureCharacteristics: 11.0,  // Spray cleaner application
      frequencyOfUse: 5.0,            // Weekly glass cleaning
      evidenceStrength: 14.5,         // EPA and OECD environmental profiles
      concernAreas: 2.5               // Minimal residue, mild transient skin contact
    },
    rationale: 'Eco-compatible hard surface cleaner relying on oxygen oxidation and plant surfactants with low residual toxicity.'
  },

  // 18. SportProtect 48H Pro Antiperspirant Stick (Benzalkonium Chloride, Fragrance -> Axillary leave-on)
  'sportprotect-antiperspirant': {
    factors: {
      ingredientConcernProfile: 22.0, // Quat biocide BAK + Synthetic fragrance in occluded axillary skin
      exposureCharacteristics: 16.0,  // Occluded leave-on topical contact in axillary vault
      frequencyOfUse: 10.0,           // Daily personal care
      evidenceStrength: 15.0,         // EPA BAK assessments, SCCS fragrance reviews
      concernAreas: 6.0               // Respiratory/contact sensitization, microflora disruption
    },
    rationale: 'Contains quaternary ammonium antimicrobial and synthetic fragrance applied to occluded axillary skin, elevating contact dermatitis and sensitization risks.'
  },

  // 19. PureNature Mineral Magnesium Deodorant (Glycerin, Tocopherol, Citric Acid, Sodium Benzoate)
  'purenature-magnesium-deodorant': {
    factors: {
      ingredientConcernProfile: 4.5,  // Skin conditioning glycerin and mild benzoate preservation
      exposureCharacteristics: 13.0,  // Daily leave-on deodorant
      frequencyOfUse: 10.0,           // Daily personal care
      evidenceStrength: 14.0,         // CIR and USP monographs
      concernAreas: 1.5               // Low sensitization potential
    },
    rationale: 'Gentle mineral deodorant stick utilizing biocompatible humectants and organic acid salt preservation with low dermal reactivity.'
  },

  // 20. TurboWash Ultra Stain Laundry Detergent (LAS, Sodium Carbonate, Fragrance, SLS, Phenoxyethanol)
  'turbowash-laundry-detergent': {
    factors: {
      ingredientConcernProfile: 23.5, // Anionic LAS + SLS + Fragrance + Alkaline washing soda
      exposureCharacteristics: 8.5,   // Indirect fabric contact and hand immersion
      frequencyOfUse: 5.0,            // Weekly domestic wash (2-3 loads)
      evidenceStrength: 16.5,         // HERA European laundry risk assessment, EPA Safer Choice
      concernAreas: 6.5               // Aquatic persistence, occupational/domestic hand dermatitis
    },
    rationale: 'High-surfactant synthetic laundry formulation containing linear alkylbenzene sulfonates and synthetic fragrance with potential for fabric residue irritation and aquatic toxicity.'
  },

  // 21. EcoCare Hypoallergenic Plant Laundry Liquid (Coco-Glucoside, Sodium Citrate, Carbonate, Citric Acid)
  'ecocare-plant-laundry-liquid': {
    factors: {
      ingredientConcernProfile: 5.5,  // Plant glucosides, citrate builder, natural carbonate
      exposureCharacteristics: 7.0,   // Indirect fabric contact
      frequencyOfUse: 5.0,            // Weekly laundry
      evidenceStrength: 14.0,         // HERA and EPA Safer Choice criteria
      concernAreas: 2.0               // Readily biodegradable, non-sensitizing on textiles
    },
    rationale: 'Plant-derived laundry liquid using natural citrate builders and non-ionic surfactants for minimal textile residue and rapid environmental biodegradation.'
  },

  // 22. UltraPower Concentrated Laundry Detergent Pods (LAS, Carbonate, Fragrance, SLS, Phenoxyethanol)
  'ultrapower-concentrated-laundry-pods': {
    factors: {
      ingredientConcernProfile: 24.5, // Highly concentrated LAS/SLS + Fragrance + Carbonate
      exposureCharacteristics: 9.0,   // Concentrated pod handling / fabric wash
      frequencyOfUse: 5.0,            // Weekly laundry
      evidenceStrength: 16.5,         // HERA and poison control pod dossiers
      concernAreas: 7.0               // Concentrated chemical exposure, aquatic toxicity
    },
    rationale: 'High-potency unit dose detergent with concentrated surfactant loadings and fragrance fixatives, presenting heightened handling and aquatic impact factors.'
  },

  // 23. CitrusSpark Ultra Grease Dishwashing Liquid (LAS, SLS, Fragrance, Phenoxyethanol, Citric Acid)
  'citrus-spark-dish-liquid': {
    factors: {
      ingredientConcernProfile: 21.0, // LAS + SLS + Synthetic Fragrance
      exposureCharacteristics: 8.5,   // Repeated manual dish immersion (hand contact)
      frequencyOfUse: 11.0,           // Daily manual dishwashing (1-3 times/day)
      evidenceStrength: 16.0,         // HERA and CIR surfactant monographs
      concernAreas: 5.5               // Dermal barrier delipidation, irritant contact dermatitis
    },
    rationale: 'Conventional degreasing dish liquid formulated with high-foaming anionic surfactants and synthetic perfume with significant skin barrier stripping potential during un-gloved hand washing.'
  },

  // 24. EcoClean Pure Plant-Based Dishwashing Gel (Coco-Glucoside, Glycerin, Sodium Citrate, Benzoate)
  'ecoclean-plant-dish-gel': {
    factors: {
      ingredientConcernProfile: 4.0,  // Plant glucosides, skin-protecting glycerin, food-grade citrate
      exposureCharacteristics: 7.0,   // Manual dish immersion
      frequencyOfUse: 11.0,           // Daily dishwashing
      evidenceStrength: 14.0,         // CIR and EPA Safer Choice dossiers
      concernAreas: 1.5               // Mild on hand barrier, non-irritating
    },
    rationale: 'Gentle plant-based dish gel utilizing skin-conditioning glycerin and mild non-ionic surfactants to protect epidermal lipid barrier during daily utensil cleaning.'
  }
};

const updatedProducts = products.map(product => {
  const evalData = PRODUCT_FACTOR_EVALUATIONS[product.id];
  if (!evalData) {
    return {
      ...product,
      score: {
        status: 'not_scored',
        factors: null,
        maxPossiblePoints: TOTAL_MAX_POINTS,
        explanation: 'Validation requirements incomplete or missing primary factor evidence; quantitative score withheld under academic rubric.',
        total: null,
        displayedScore: null,
        band: 'Not yet scored',
        rationale: null
      }
    };
  }

  // Validate factors against methodology limits
  const factorValidation = validateFactors(evalData.factors);
  if (!factorValidation.valid) {
    throw new Error(`Invalid factors for product ${product.id}: ${factorValidation.errors.join('; ')}`);
  }

  const scoreResult = calculateScore(evalData.factors);

  return {
    ...product,
    score: {
      status: 'scored',
      factors: { ...evalData.factors },
      factorMax: { ...FACTOR_LIMITS },
      maxPossiblePoints: TOTAL_MAX_POINTS,
      total: scoreResult.totalPoints,
      displayedScore: scoreResult.displayedScore,
      band: scoreResult.band,
      badgeClass: scoreResult.badgeClass,
      explanation: `Computed across 5 weighted factors based on the project's educational scoring methodology (max ${TOTAL_MAX_POINTS} points).`,
      rationale: evalData.rationale
    }
  };
});

writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2), 'utf-8');
console.log(`✅ Successfully scored ${updatedProducts.length} products according to methodology rubric.`);
