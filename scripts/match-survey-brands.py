import json
import zipfile
import xml.etree.ElementTree as ET

# Load products.json
with open('public/data/products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Total products in catalog: {len(products)}")
for p in products:
    print(f"ID: {p['id']}, Category: {p['category']}, Brand: {p['brand']}, BrandKey: {p.get('brandKey')}")

# Load Survey_Brands from XLSX
xlsx_path = r'C:\Users\ADITYA CHAUDHAREE\Downloads\chemical_awareness_database_v1.xlsx'
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}

survey_brands_by_cat = {}

with zipfile.ZipFile(xlsx_path) as z:
    sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet5.xml'))
    rows = sheet_tree.findall('.//m:row', NS)
    for r in rows[1:]: # skip header
        cells = r.findall('m:c', NS)
        cat_val = None
        brand_val = None
        for c in cells:
            r_attr = c.attrib.get('r')
            is_elem = c.find('m:is', NS)
            val = None
            if is_elem is not None:
                t_elems = is_elem.findall('.//m:t', NS)
                val = ''.join(t.text or '' for t in t_elems)
            if r_attr.startswith('A'):
                cat_val = val
            elif r_attr.startswith('B'):
                brand_val = val
        if cat_val and brand_val:
            survey_brands_by_cat.setdefault(cat_val, []).append(brand_val)

print("\n--- SURVEY BRANDS BY CATEGORY ---")
for cat, brands in survey_brands_by_cat.items():
    print(f"\nCategory: {cat} ({len(brands)} brands)")
    for b in brands:
        # Match with product catalog
        matching_prods = [p for p in products if p['category'] == cat and (p.get('brandKey') == b.lower().replace(' ', '-').replace('&', 'and') or p['brand'].lower() == b.lower() or b.lower() in p['brand'].lower())]
        matched_ids = [p['id'] for p in matching_prods]
        print(f"  - {b} -> Matched Product IDs: {matched_ids}")
