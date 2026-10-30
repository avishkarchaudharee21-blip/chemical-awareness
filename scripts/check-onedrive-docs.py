import zipfile
import xml.etree.ElementTree as ET
import glob
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

extra_docs = [
    r'C:\Users\ADITYA CHAUDHAREE\OneDrive\Desktop\exam\CHEMISTRY INVESTIGATORY (AVI) OG 2.docx',
    r'C:\Users\ADITYA CHAUDHAREE\OneDrive\Desktop\exam\CHEMISTRY INVESTIGATORY (AVI) OG.docx',
    r'C:\Users\ADITYA CHAUDHAREE\OneDrive\Desktop\exam\CHEMISTRY INVESTIGATORY PROJECT 2ND.docx',
    r'C:\Users\ADITYA CHAUDHAREE\OneDrive\Documents\CHEMISTRY INVESTIGATORY PROJECT 1ST.docx',
    r'C:\Users\ADITYA CHAUDHAREE\OneDrive\Documents\CHEMISTRY INVESTIGATORY PROJECT 2ND.docx'
]

for df in extra_docs:
    if not os.path.exists(df):
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
                full_text = '\n'.join(text)
                print('Topic / Title:', text[5:10] if len(text) > 10 else text)
                for kw in ['survey', 'respondent', 'shampoo', 'colgate', 'questionnaire']:
                    if kw in full_text.lower():
                        print(f"Keyword '{kw}' found in {os.path.basename(df)}")
    except Exception as e:
        print(f"Error reading {df}: {e}")
