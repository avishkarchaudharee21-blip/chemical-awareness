import json

with open('public/data/products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Loaded {len(products)} products.\n")

FACTOR_LIMITS = {
    "ingredientConcernProfile": 35,
    "exposureCharacteristics": 20,
    "frequencyOfUse": 15,
    "evidenceStrength": 20,
    "concernAreas": 10
}

def get_band(displayed_score):
    if displayed_score <= 3.9:
        return "Lower identified concern", "badge-low"
    elif displayed_score <= 6.9:
        return "Moderate identified concern", "badge-moderate"
    else:
        return "Higher identified concern", "badge-high"

for p in products:
    score = p.get('score', {})
    factors = score.get('factors', {})
    
    # Calculate total and displayedScore
    total = sum(factors.get(k, 0) for k in FACTOR_LIMITS)
    displayed_score = max(1.0, round((total / 10.0), 1))
    band_label, badge_class = get_band(displayed_score)
    
    # Build complete standardized score object
    refined_score = {
        "status": "scored",
        "methodologyVersion": "1.0",
        "factors": factors,
        "points": factors,
        "factorMax": FACTOR_LIMITS,
        "maxPossiblePoints": 100,
        "total": total,
        "displayedScore": displayed_score,
        "band": band_label,
        "badgeClass": badge_class,
        "why": f"Score of {displayed_score}/10.0 ({band_label}) determined by 5 evidence-based educational scoring factors totaling {total}/100 points.",
        "explanation": "Computed across 5 weighted factors based on the project's educational scoring methodology (max 100 points).",
        "rationale": score.get('rationale', 'Evaluated based on ingredient concern profile, exposure route, usage frequency, evidence strength, and distinct concern areas.')
    }
    
    p['score'] = refined_score

# Save back to public/data/products.json
with open('public/data/products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print("Successfully refined scores in public/data/products.json")
