import os, json
D = '_json_data'
F = 'public/images/cards'
def audit():
    folders = set(os.listdir(F))
    missing = []
    files = [f for f in os.listdir(D) if f.endswith('.json')]
    for f in files:
        with open(os.path.join(D, f), 'r', encoding='utf-8') as jf:
            d = json.load(jf)
            if d.get('category') in ['실손보험', '실손']: # 실손 부대만 집중 사열!
                title = d.get('title', '')
                # 우리 지도가 그리는 '예상 주소' 규칙
                sanitized = title.replace('&amp;', ' ').replace('&#039;', '').strip()
                if sanitized not in folders:
                    missing.append((title, sanitized))
    print(f'--- Sil-son Category Audit ---')
    print(f'Checked Force: {len(files)} records found in total.')
    print(f'Missing Members in Sil-son: {len(missing)}')
    for orig, sani in missing[:20]: # 상위 20명만 우선 사열
        print(f'- [X] Missing: \"{orig}\" (Expected Folder: \"{sani}\")')
audit()
