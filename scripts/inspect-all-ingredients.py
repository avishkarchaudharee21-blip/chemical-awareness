import json

with open(r"C:\Users\ADITYA CHAUDHAREE\.gemini\antigravity\scratch\chemical-awareness\public\data\products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

print(f"Total products: {len(products)}")
for i, p in enumerate(products, 1):
    print(f"[{i:2d}] {p['id']} ({p['brand']} - {p['name']})")
    print(f"     Category: {p['category']} | Status: {p['verificationStatus']}")
    print(f"     Ingredients ({len(p.get('ingredients', []))}):")
    for ing in p.get('ingredients', []):
        print(f"       - {ing['name']} | flag={ing.get('flag')} | func={bool(ing.get('function'))} | concern={bool(ing.get('concern'))} | evidence={bool(ing.get('evidence'))} | src={ing.get('sourceIds')}")
