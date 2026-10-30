import json

with open(r"C:\Users\ADITYA CHAUDHAREE\.gemini\antigravity\scratch\chemical-awareness\public\data\products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

print(f"{'#':<3} | {'Product':<60} | {'Score':<6} | {'Band':<28} | {'Status'}")
print("-" * 115)

for i, p in enumerate(products, 1):
    name = f"{p['brand']} - {p['name']}"
    if len(name) > 58:
        name = name[:55] + "..."
    sc = p.get('score', {})
    if sc and sc.get('status') == 'scored':
        score_val = f"{sc.get('displayedScore'):.1f}"
        band = sc.get('band', '')
        status = "Scored"
    else:
        score_val = "N/A"
        band = "Not yet scored"
        status = "not_scored"
    print(f"{i:<3} | {name:<60} | {score_val:<6} | {band:<28} | {status}")
