import zipfile
import xml.etree.ElementTree as ET

xlsx_path = r'C:\Users\ADITYA CHAUDHAREE\Downloads\chemical_awareness_database_v1.xlsx'
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}

with zipfile.ZipFile(xlsx_path) as z:
    shared_strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in tree.findall('m:si', NS):
            t_elems = si.findall('.//m:t', NS)
            shared_strings.append(''.join(t.text or '' for t in t_elems))
            
    print(f"Total shared strings: {len(shared_strings)}")
    for i, s in enumerate(shared_strings):
        print(f"{i}: {repr(s)}")

