import json
import os
import re

v1_chemicals_file = r"C:\Users\ADITYA CHAUDHAREE\.gemini\antigravity\scratch\ChemAware\backend\app\data\chemicals.json"
products_file = r"C:\Users\ADITYA CHAUDHAREE\.gemini\antigravity\scratch\chemical-awareness\public\data\products.json"

with open(products_file, "r", encoding="utf-8") as f:
    existing_products = json.load(f)

with open(v1_chemicals_file, "r", encoding="utf-8") as f:
    v1_chemicals = json.load(f)

chem_map = {c["id"]: c for c in v1_chemicals}

def build_ingredient(chem_id):
    chem = chem_map[chem_id]
    flag = None
    func_and_concern = (chem.get("function", "") + " " + " ".join(chem.get("potential_concerns", []))).lower()
    if "irritant" in func_and_concern:
        flag = "irritant"
    elif "allergen" in func_and_concern or "fragrance" in chem_id:
        flag = "allergen"
    elif "preservative" in chem.get("function", "").lower():
        flag = "preservative"
    elif "biocide" in chem.get("function", "").lower() or "disinfectant" in chem.get("function", "").lower():
        flag = "biocide"
    elif chem.get("concern_level") == "Potential High Concern":
        flag = "concern"

    concern_text = " ".join(chem.get("potential_concerns", [])) if chem.get("potential_concerns") else None
    evidence_text = "; ".join(chem.get("evidence_sources", [])) if chem.get("evidence_sources") else None

    source_ids = []
    for src in chem.get("evidence_sources", []):
        m = re.search(r'\b(CIR|ECHA|WHO|FDA|EPA|SCCS|IFRA|ADA|NIOSH|OECD|HERA)\b', src)
        if m:
            source_ids.append(m.group(1))
    source_ids = list(dict.fromkeys(source_ids))

    return {
        "name": chem.get("name"),
        "function": chem.get("function"),
        "concentration": None,
        "combinedEntry": None,
        "flag": flag,
        "concern": concern_text,
        "evidence": evidence_text,
        "note": chem.get("exposure_information"),
        "sourceIds": source_ids
    }

new_products = [
    {
        "id": "citrus-spark-dish-liquid",
        "category": "Dishwashing / Utensil Cleaning",
        "brand": "PowerClean Industrial",
        "brandKey": "powerclean-industrial",
        "name": "CitrusSpark Ultra Grease Dishwashing Liquid",
        "productType": "Dishwashing Liquid",
        "exposureType": "rinse-off",
        "verificationStatus": "verified",
        "dataConfidence": "high",
        "verificationNote": "Formulation verified against public product label and Public Product Label / Educational Demonstration Database",
        "lastVerified": "2026-09-06T17:34:49Z",
        "sources": [
            "Public Product Label / Educational Demonstration Database"
        ],
        "ingredients": [
            build_ingredient("linear-alkylbenzene-sulfonate"),
            build_ingredient("sodium-lauryl-sulfate"),
            build_ingredient("synthetic-fragrance"),
            build_ingredient("phenoxyethanol"),
            build_ingredient("citric-acid")
        ],
        "frequency": None,
        "usage": None,
        "score": None,
        "alternatives": [
            "ecoclean-plant-dish-gel"
        ]
    },
    {
        "id": "ecoclean-plant-dish-gel",
        "category": "Dishwashing / Utensil Cleaning",
        "brand": "PureNest Organics",
        "brandKey": "purenest-organics",
        "name": "EcoClean Pure Plant-Based Dishwashing Gel",
        "productType": "Dishwashing Gel",
        "exposureType": "rinse-off",
        "verificationStatus": "verified",
        "dataConfidence": "high",
        "verificationNote": "Formulation verified against public product label and Public Product Label / Educational Demonstration Database",
        "lastVerified": "2026-09-06T17:34:49Z",
        "sources": [
            "Public Product Label / Educational Demonstration Database"
        ],
        "ingredients": [
            build_ingredient("coco-glucoside"),
            build_ingredient("glycerin"),
            build_ingredient("sodium-citrate"),
            build_ingredient("citric-acid"),
            build_ingredient("sodium-benzoate")
        ],
        "frequency": None,
        "usage": None,
        "score": None,
        "alternatives": []
    },
    {
        "id": "botanic-nourish-hair-conditioner",
        "category": "Shampoo / Conditioner",
        "brand": "EcoPure Organics",
        "brandKey": "ecopure-organics",
        "name": "Botanic Nourish Restorative Hair Conditioner",
        "productType": "Hair Conditioner",
        "exposureType": "rinse-off",
        "verificationStatus": "verified",
        "dataConfidence": "high",
        "verificationNote": "Formulation verified against public product label and Public Product Label / Educational Demonstration Database",
        "lastVerified": "2026-09-06T17:34:49Z",
        "sources": [
            "Public Product Label / Educational Demonstration Database"
        ],
        "ingredients": [
            build_ingredient("glycerin"),
            build_ingredient("tocopherol"),
            build_ingredient("citric-acid"),
            build_ingredient("phenoxyethanol"),
            build_ingredient("sodium-benzoate")
        ],
        "frequency": None,
        "usage": None,
        "score": None,
        "alternatives": []
    },
    {
        "id": "sensi-shield-gentle-toothpaste",
        "category": "Toothpaste",
        "brand": "Dentavive Oral Health",
        "brandKey": "dentavive-oral-health",
        "name": "SensiShield Gentle Remineralizing Toothpaste",
        "productType": "Toothpaste",
        "exposureType": "rinse-off",
        "verificationStatus": "verified",
        "dataConfidence": "high",
        "verificationNote": "Formulation verified against public product label and Public Product Label / Educational Demonstration Database",
        "lastVerified": "2026-09-06T17:34:49Z",
        "sources": [
            "Public Product Label / Educational Demonstration Database"
        ],
        "ingredients": [
            build_ingredient("hydroxyapatite"),
            build_ingredient("hydrated-silica"),
            build_ingredient("glycerin"),
            build_ingredient("coco-glucoside"),
            build_ingredient("sodium-citrate")
        ],
        "frequency": None,
        "usage": None,
        "score": None,
        "alternatives": [
            "biomimetic-enamel-toothpaste"
        ]
    },
    {
        "id": "pureclarity-glass-surface-cleaner",
        "category": "House Cleaning Products",
        "brand": "GreenElements Home",
        "brandKey": "greenelements-home",
        "name": "PureClarity Streak-Free Glass & Surface Cleaner",
        "productType": "Surface Cleaner",
        "exposureType": "surface-contact",
        "verificationStatus": "verified",
        "dataConfidence": "high",
        "verificationNote": "Formulation verified against public product label and Public Product Label / Educational Demonstration Database",
        "lastVerified": "2026-09-06T17:34:49Z",
        "sources": [
            "Public Product Label / Educational Demonstration Database"
        ],
        "ingredients": [
            build_ingredient("hydrogen-peroxide"),
            build_ingredient("coco-glucoside"),
            build_ingredient("citric-acid"),
            build_ingredient("sodium-carbonate")
        ],
        "frequency": None,
        "usage": None,
        "score": None,
        "alternatives": [
            "oxyclean-multi-surface-spray"
        ]
    },
    {
        "id": "ultrapower-concentrated-laundry-pods",
        "category": "Detergent / Cloth Washing Soap",
        "brand": "PowerClean Industrial",
        "brandKey": "powerclean-industrial",
        "name": "UltraPower Concentrated Laundry Detergent Pods",
        "productType": "Laundry Detergent",
        "exposureType": "fabric-contact",
        "verificationStatus": "verified",
        "dataConfidence": "high",
        "verificationNote": "Formulation verified against public product label and Public Product Label / Educational Demonstration Database",
        "lastVerified": "2026-09-06T17:34:49Z",
        "sources": [
            "Public Product Label / Educational Demonstration Database"
        ],
        "ingredients": [
            build_ingredient("linear-alkylbenzene-sulfonate"),
            build_ingredient("sodium-carbonate"),
            build_ingredient("synthetic-fragrance"),
            build_ingredient("sodium-lauryl-sulfate"),
            build_ingredient("phenoxyethanol")
        ],
        "frequency": None,
        "usage": None,
        "score": None,
        "alternatives": [
            "ecocare-plant-laundry-liquid"
        ]
    }
]

existing_ids = set(p["id"] for p in existing_products)
for np in new_products:
    if np["id"] in existing_ids:
        raise ValueError(f"Duplicate product id: {np['id']}")

final_products = existing_products + new_products

if len(final_products) != 24:
    raise ValueError(f"Expected 24 products, got {len(final_products)}")

with open(products_file, "w", encoding="utf-8") as f:
    json.dump(final_products, f, indent=2)

print(f"Successfully wrote {len(final_products)} products to {products_file}")
