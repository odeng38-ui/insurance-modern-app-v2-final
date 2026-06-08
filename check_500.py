import urllib.request
import urllib.error
try:
    urllib.request.urlopen('https://insurance-modern-app-v2-final.vercel.app/api/disease?query=A')
except urllib.error.HTTPError as e:
    print(e.read().decode())
