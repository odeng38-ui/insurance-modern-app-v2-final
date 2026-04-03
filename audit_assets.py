import os, json, requests
from dotenv import load_dotenv
load_dotenv('.env.local')
U = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
S = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
def clean(t): 
    return t.replace('&amp;', ' ').replace('&#039;', '').replace('+', ' ').strip()
def audit():
    h = {'apikey': S, 'Authorization': f'Bearer {S}'}
    r = requests.get(f'{U}/rest/v1/insurance_cards?select=title', headers=h)
    db_titles = [x['title'] for x in r.json()]
    folders = os.listdir('public/images/cards')
    print(f'DB Count: {len(db_titles)}, Folder Count: {len(folders)}')
    mismatched = []
    for t in db_titles:
        c = clean(t)
        if c not in folders:
            mismatched.append(t)
    if mismatched:
        print(f'Mismatched Found ({len(mismatched)}):')
        for m in mismatched:
            print(f'- DB: \"{m}\" (Clean: \"{clean(m)}\")')
    else:
        print('All 100% Correct Match!')
audit()
