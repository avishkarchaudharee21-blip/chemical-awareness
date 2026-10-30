import json
import re

chemicals_path = r"C:\Users\ADITYA CHAUDHAREE\.gemini\antigravity\scratch\ChemAware\backend\app\data\chemicals.json"
products_path = r"C:\Users\ADITYA CHAUDHAREE\.gemini\antigravity\scratch\chemical-awareness\public\data\products.json"

with open(chemicals_path, "r", encoding="utf-8") as f:
    chemicals = json.load(f)

with open(products_path, "r", encoding="utf-8") as f:
    products = json.load(f)

# Build a lookup for chemicals by id and name
chem_by_id = {c["id"]: c for c in chemicals}
chem_by_name = {c["name"].lower(): c for c in chemicals}

# Identification of awareness concern (flag: true) vs reviewed no concern (flag: false)
# True = SLS, LAS, Synthetic Fragrance, Phenoxyethanol, Triclosan, Sodium Hypochlorite, Methylparaben, Benzalkonium Chloride, Sodium Carbonate (high alkalinity/powder), Sodium Fluoride (pediatric swallowing concern), Titanium Dioxide (in loose powder/inhalation context)
AWARENESS_FLAGGED_CHEM_IDS = {
    "sodium-lauryl-sulfate",
    "linear-alkylbenzene-sulfonate",
    "synthetic-fragrance",
    "phenoxyethanol",
    "triclosan",
    "sodium-hypochlorite",
    "methylparaben",
    "benzalkonium-chloride",
    "sodium-carbonate",
    "sodium-fluoride",
}

def find_chem_record(ing_name):
    clean = ing_name.lower().strip()
    if clean in chem_by_name:
        return chem_by_name[clean]
    for cid, c in chem_by_id.items():
        if clean in c["name"].lower() or c["name"].lower() in clean:
            return c
    return None

updated_products = []
flagged_ing_count = 0
reviewed_no_concern_count = 0
unverified_products = []

for p in products:
    updated_ingredients = []
    p_ings = p.get("ingredients", [])
    
    if not p_ings or len(p_ings) == 0:
        unverified_products.append(p["id"])
    
    for ing in p_ings:
        ing_name = ing.get("name", "")
        chem = find_chem_record(ing_name)
        
        if chem:
            cid = chem["id"]
            is_flagged = cid in AWARENESS_FLAGGED_CHEM_IDS
            if is_flagged:
                flagged_ing_count += 1
            else:
                reviewed_no_concern_count += 1
                
            concern_text = " ".join(chem.get("potential_concerns", [])) if chem.get("potential_concerns") else None
            evidence_text = "; ".join(chem.get("evidence_sources", [])) if chem.get("evidence_sources") else None
            
            source_ids = []
            for src in chem.get("evidence_sources", []):
                m = re.search(r'\b(CIR|ECHA|WHO|FDA|EPA|SCCS|IFRA|ADA|NIOSH|OECD|HERA)\b', src)
                if m:
                    source_ids.append(m.group(1))
            source_ids = list(dict.fromkeys(source_ids))
            
            updated_ingredients.append({
                "name": chem.get("name"),
                "function": chem.get("function"),
                "concentration": None,         # Do not invent concentration
                "combinedEntry": None,
                "flag": is_flagged,             # Boolean flag: true or false
                "concern": concern_text,
                "evidence": evidence_text,
                "note": chem.get("exposure_information"),
                "sourceIds": source_ids
            })
        else:
            # Not in standard chemicals database - mark flag as null (not yet reviewed)
            updated_ingredients.append({
                "name": ing_name,
                "function": ing.get("function") or None,
                "concentration": None,
                "combinedEntry": None,
                "flag": None,                  # null = not yet reviewed
                "concern": None,
                "evidence": None,
                "note": None,
                "sourceIds": []
            })
            
    p_copy = dict(p)
    p_copy["ingredients"] = updated_ingredients
    p_copy["score"] = None  # Do not score yet
    updated_products.append(p_copy)

with open(products_path, "w", encoding="utf-8") as f:
    json.dump(updated_products, f, indent=2)

print(f"Updated {len(updated_products)} products in {products_path}")
print(f"Total flagged ingredient occurrences: {flagged_ing_count}")
print(f"Total reviewed (no concern) ingredient occurrences: {reviewed_no_concern_count}")
print(f"Unverified products requiring manual verification: {len(unverified_products)}")
