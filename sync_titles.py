import os, json
D = '_json_data'
def sync_titles():
    files = [f for f in os.listdir(D) if f.endswith('.json')]
    count = 0
    for f in files:
        path = os.path.join(D, f)
        with open(path, 'r', encoding='utf-8') as jf:
            d = json.load(jf)
        
        # 파일명 자체가 폴더명과 일치하는 '진짜 제목'입니다
        new_title = f.replace('.json', '').strip()
        
        if d.get('title') != new_title:
            d['title'] = new_title
            with open(path, 'w', encoding='utf-8') as jf:
                json.dump(d, jf, ensure_ascii=False, indent=2)
            count += 1
    print(f'Successfully synchronized {count} titles in JSON files.')
sync_titles()
