import zipfile
import xml.etree.ElementTree as ET
import glob
import os
import sys

# Set stdout to utf-8
sys.stdout.reconfigure(encoding='utf-8')

docx_files = glob.glob(r'C:\Users\ADITYA CHAUDHAREE\Downloads\*.docx')

for df in docx_files:
    if 'Project Report' in df:
        continue
    print(f"\n=================== DOCX: {os.path.basename(df)} ===================")
    try:
        with zipfile.ZipFile(df) as z:
            if 'word/document.xml' in z.namelist():
                tree = ET.fromstring(z.read('word/document.xml'))
                text = []
                for p in tree.findall('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                    p_text = ''.join(t.text or '' for t in p.findall('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'))
                    if p_text.strip():
                        text.append(p_text.strip())
                print('Total paragraphs:', len(text))
                
                # Check tables
                tables = tree.findall('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tbl')
                print('Total tables:', len(tables))
                for t_idx, tbl in enumerate(tables):
                    print(f"\n--- Table {t_idx+1} ---")
                    for r in tbl.findall('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tr'):
                        row_cells = []
                        for c in r.findall('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tc'):
                            cell_text = ''.join(t.text or '' for t in c.findall('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'))
                            row_cells.append(cell_text.strip())
                        print('  Row:', row_cells)
                
                print("\nAll text paragraphs:")
                for i, p in enumerate(text):
                    print(f"{i+1}: {p}")
    except Exception as e:
        print(f"Error reading {df}: {e}")
