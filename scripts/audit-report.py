import json
import sys

with open(r"C:\Users\ADITYA CHAUDHAREE\.gemini\antigravity\scratch\chemical-awareness\public\data\products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

print(f"Total products: {len(products)}")
print(f"Unique IDs: {len(set(p['id'] for p in products))}")
print("-" * 120)
print(f"{'Product':<50} | {'Category':<32} | {'Data Status':<35} | {'Missing Information'}")
print("-" * 120)

for p in products:
    name = f"{p['brand']} - {p['name']}"
    if len(name) > 48:
        name = name[:45] + "..."
    cat = p['category']
    v_status = p['verificationStatus']
    conf = p['dataConfidence']
    ing_count = len(p.get('ingredients', []))
    flagged = sum(1 for ing in p.get('ingredients', []) if ing.get('flag'))
    
    missing = []
    if p.get('score') is None:
        missing.append("Score")
    if p.get('usage') is None:
        missing.append("Usage guidance")
    if p.get('frequency') is None:
        missing.append("Frequency limits")
    for ing in p.get('ingredients', []):
        if ing.get('concentration') is None:
            if "Concentrations" not in missing:
                missing.append("Concentrations")
    if not p.get('alternatives') or len(p.get('alternatives', [])) == 0:
        missing.append("Verified alternatives")
    if not p.get('sources') or len(p.get('sources', [])) == 0:
        missing.append("Sources")
        
    status_desc = f"{v_status.capitalize()} ({conf.capitalize()} conf., {ing_count} ings)"
    missing_desc = ", ".join(missing) if missing else "None"
    
    print(f"{name:<50} | {cat:<32} | {status_desc:<35} | {missing_desc}")
