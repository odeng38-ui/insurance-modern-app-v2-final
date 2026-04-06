import os, json
D = '_json_data'
F = 'public/images/cards'
def final_audit():
    folders = set(os.listdir(F))
    files = [f for f in os.listdir(D) if f.endswith('.json')]
    mismatches = []
    print(f'Starting Audit for {len(files)} records...')
    for f in files:
        with open(os.path.join(D, f), 'r', encoding='utf-8') as jf:
            d = json.load(jf)
            title = d.get('title', 'Unknown')
            # 우리 지도가 그리는 '예상 주소' 규칙
            sanitized = title.replace('&amp;', ' ').replace('&#039;', '').strip()
            if sanitized not in folders:
                mismatches.append((title, sanitized))
    
    print(f'Total Mismatches Found: {len(mismatches)}')
    for orig, sani in mismatches[:50]: # 상위 50명만 우선 색출
        print(f'- [X] Missing: \"{orig}\" (Expected Folder: \"{sani}\")')
final_audit()
