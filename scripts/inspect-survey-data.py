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
            
    wb_tree = ET.fromstring(z.read('xl/workbook.xml'))
    sheets = wb_tree.findall('.//m:sheet', NS)
    for i, s in enumerate(sheets, 1):
        name = s.attrib['name']
        sheet_xml_name = f'xl/worksheets/sheet{i}.xml'
        print(f'\n=== SHEET {i}: {name} ===')
        sheet_tree = ET.fromstring(z.read(sheet_xml_name))
        rows = sheet_tree.findall('.//m:row', NS)
        for r in rows:
            row_data = []
            for c in r.findall('m:c', NS):
                t_attr = c.attrib.get('t')
                v_elem = c.find('m:v', NS)
                is_elem = c.find('m:is', NS)
                
                val = None
                if is_elem is not None:
                    t_elems = is_elem.findall('.//m:t', NS)
                    val = ''.join(t.text or '' for t in t_elems)
                elif v_elem is not None:
                    raw_val = v_elem.text
                    if t_attr == 's' and raw_val is not None:
                        val = shared_strings[int(raw_val)]
                    else:
                        val = raw_val
                row_data.append(val)
            if any(x is not None for x in row_data):
                print(f'Row {r.attrib.get("r")}: {row_data}')
