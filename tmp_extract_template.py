import os, pypdf
p = r'd:\clg studies\projects\Faculty Forge\IAPRE06.7 Internal Examination Question Paper Template (R 2021) - All UG courses.pdf'
print('exists=', os.path.exists(p))
reader = pypdf.PdfReader(p)
print('pages=', len(reader.pages))
for i, page in enumerate(reader.pages[:10], 1):
    txt = page.extract_text() or ''
    print(f'--- PAGE {i} ---')
    print(txt[:6000])
    print()
