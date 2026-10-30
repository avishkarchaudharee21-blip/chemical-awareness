import json

with open('public/data/products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Total products: {len(products)}\n")

for i, p in enumerate(products, 1):
    pid = p.get('id')
    name = p.get('name')
    brand = p.get('brand')
    category = p.get('category')
    exposure = p.get('exposureType')
    v_status = p.get('verificationStatus')
    confidence = p.get('dataConfidence')
    ingredients = p.get('ingredients', [])
    sources = p.get('sources', [])
    usage = p.get('usage')
    frequency = p.get('frequency')
    score = p.get('score')
    
    # Audit checks
    has_identity = bool(pid and name and brand and category)
    has_ingredients = isinstance(ingredients, list) and len(ingredients) > 0
    all_ing_reviewed = has_ingredients and all(ing.get('flag') is not None for ing in ingredients)
    has_exposure = bool(exposure)
    has_usage_basis = bool(usage is not None or frequency is not None or p.get('verificationNote'))
    has_sources = isinstance(sources, list) and len(sources) > 0
    
    # Flagged ingredients have sources
    flagged_ings = [ing for ing in ingredients if ing.get('flag') is True]
    all_flags_sourced = all(isinstance(ing.get('sourceIds'), list) and len(ing.get('sourceIds')) > 0 for ing in flagged_ings)
    
    print(f"[{i}] {pid} | {brand} - {name} ({category})")
    print(f"    Exposure: {exposure}, Status: {v_status}, Confidence: {confidence}")
    print(f"    Ingredients ({len(ingredients)}): has_ingredients={has_ingredients}, all_reviewed={all_ing_reviewed}, flagged={len(flagged_ings)}")
    print(f"    Sources ({len(sources)}): has_sources={has_sources}, all_flags_sourced={all_flags_sourced}")
    print(f"    Usage/Frequency: usage={usage}, frequency={frequency}")
    print(f"    Score object: status={score.get('status') if isinstance(score, dict) else score}")
    print("-" * 60)
