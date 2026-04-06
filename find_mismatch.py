import os, json
D = '_json_data'
F = 'public/images/cards'
def find_mismatch():
    folders = os.listdir(F)
    files = [f for f in os.listdir(D) if f.endswith('.json')]
    report = []
    print(f'Starting Deep Audit for {len(files)} records...')
    for f in files:
        with open(os.path.join(D, f), 'r', encoding='utf-8') as jf:
            d = json.load(jf)
            title = d.get('title', 'Unknown')
            sanitized = title.replace('&amp;', ' ').replace('&#039;', '').strip()
            if sanitized not in folders:
                # 제목을 포함하는 폴더가 있는지 찾아봅니다 (예: '제목' -> '제목 이야기')
                matches = [fol for fol in folders if sanitized in fol]
                if matches:
                    report.append({'json': f, 'orig': title, 'found_folder': matches[0]})
                else:
                    report.append({'json': f, 'orig': title, 'found_folder': 'NONE (Totally Missing)'})
    
    print(f'Total Mismatches Found: {len(report)}')
    for r in report[:50]: # 상위 50명만 우선 리포트
        print(f'- JSON: {r["json"]} | Title: \"{r["orig"]}\" -> Real Folder: \"{r["found_folder"]}\"')
    
    with open('mismatch_report.json', 'w', encoding='utf-8') as rf:
        json.dump(report, rf, ensure_ascii=False, indent=2)
find_mismatch()
