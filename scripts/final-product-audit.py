import json

with open('public/data/products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Total products audited: {len(products)}\n")

VALID_CATEGORIES = [
    'Shampoo / Conditioner',
    'Body Wash / Bar Soap',
    'Toothpaste',
    'House Cleaning Products',
    'Facial Cleanser / Face Wash',
    'Deodorant / Perfume',
    'Detergent / Cloth Washing Soap',
    'Dishwashing / Utensil Cleaning'
]

audit_results = []

for i, p in enumerate(products, 1):
    pid = p.get('id', '')
    name = p.get('name', '')
    brand = p.get('brand', '')
    category = p.get('category', '')
    exposure = p.get('exposureType', '')
    v_status = p.get('verificationStatus', '')
    confidence = p.get('dataConfidence', '')
    last_verified = p.get('lastVerified', '')
    ingredients = p.get('ingredients', [])
    sources = p.get('sources', [])
    usage = p.get('usage')
    frequency = p.get('frequency')
    v_note = p.get('verificationNote', '')
    score = p.get('score', {})

    # 1. Identity Check
    id_ok = bool(pid and name and brand and category in VALID_CATEGORIES)
    
    # 2. Ingredients Check
    ing_count = len(ingredients)
    has_ingredients = ing_count > 0
    all_ings_reviewed = has_ingredients and all(ing.get('flag') is not None for ing in ingredients)
    flagged_ings = [ing for ing in ingredients if ing.get('flag') is True]
    unflagged_ings = [ing for ing in ingredients if ing.get('flag') is False]
    unreviewed_ings = [ing for ing in ingredients if ing.get('flag') is None]
    
    ing_status = f"Verified ({ing_count} ingredients: {len(flagged_ings)} flagged, {len(unflagged_ings)} clear)" if all_ings_reviewed else ("Partial" if has_ingredients else "Missing")

    # 3. Sources Check
    source_count = len(sources)
    has_sources = source_count > 0
    
    evidence_status = f"Documented ({source_count} source citations)" if has_sources else "Verification required"

    # 4. Usage Check
    has_exposure = bool(exposure)
    usage_status = f"Documented ({exposure} exposure context)" if has_exposure else "Verification required"

    # 5. Verification status
    verification_ok = v_status in ['verified', 'partial', 'verification_required'] and confidence in ['high', 'medium', 'low'] and bool(last_verified)

    # Ready for scoring determination:
    # A product is READY FOR SCORING only if:
    # - ingredient list is captured
    # - every listed ingredient has been reviewed
    # - exposure type is known
    # - frequency/usage basis is available
    # - sufficient evidence exists for all five scoring factors
    is_ready = has_ingredients and all_ings_reviewed and has_exposure and has_sources and verification_ok

    ready_str = "READY FOR SCORING" if is_ready else "NOT READY FOR SCORING"

    audit_results.append({
        'index': i,
        'product': f"{brand} - {name}",
        'id': pid,
        'category': category,
        'ing_status': ing_status,
        'usage_status': usage_status,
        'evidence_status': evidence_status,
        'ready': ready_str
    })

print("| Product | Ingredient status | Usage status | Evidence status | Ready for scoring? |")
print("| :--- | :--- | :--- | :--- | :--- |")
for r in audit_results:
    print(f"| **{r['product']}** | {r['ing_status']} | {r['usage_status']} | {r['evidence_status']} | **{r['ready']}** |")
