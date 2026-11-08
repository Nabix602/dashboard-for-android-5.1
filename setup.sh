#!/usr/bin/env bash
# Dashboard for Android 5.5 - made by Esteban W
# Configuration et lancement depuis le terminal.
#   ./setup.sh           menu de configuration
#   ./setup.sh serve     lance le dashboard sur le réseau local (port 8000 par défaut)
cd "$(dirname "$0")"
PORT="${PORT:-8000}"

banner() {
  printf '\n'
  printf '  ╭──────────────────────────────────────────╮\n'
  printf '  │  Dashboard for Android 5.5               │\n'
  printf '  │  made by Esteban W                       │\n'
  printf '  ╰──────────────────────────────────────────╯\n\n'
}

need_python() {
  if ! command -v python3 >/dev/null 2>&1; then
    echo "Python 3 est requis. Installe-le puis relance ./setup.sh." >&2
    exit 1
  fi
}

set_lastfm() {
  echo "Spotify via Last.fm (laisse vide pour ne pas l'utiliser)"
  read -r -p "  Clé API Last.fm : " key
  read -r -p "  Pseudo Last.fm  : " user
  if ! python3 - "$key" "$user" <<'PY'
import re, sys
key, user = sys.argv[1], sys.argv[2]
p = 'script.js'
s = open(p, encoding='utf-8').read()
s, a = re.subn(r"lastfmApiKey: '[^']*'", "lastfmApiKey: '%s'" % key, s)
s, b = re.subn(r"lastfmUser: '[^']*'", "lastfmUser: '%s'" % user, s)
if a != 1 or b != 1:
    sys.exit('script.js : configuration introuvable')
open(p, 'w', encoding='utf-8').write(s)
PY
  then
    echo "  ✗ Spotify non enregistré"
  else
    echo "  ✓ Spotify enregistré"
  fi
}

set_city() {
  read -r -p "  Ville pour la météo (ex. Gazeran) : " city
  [ -z "$city" ] && return
  if ! python3 - "$city" <<'PY'
import json, re, sys, urllib.parse, urllib.request
city = sys.argv[1]
url = 'https://geocoding-api.open-meteo.com/v1/search?' + urllib.parse.urlencode(
    {'name': city, 'count': 1, 'language': 'fr', 'format': 'json'})
with urllib.request.urlopen(url, timeout=15) as r:
    data = json.load(r)
res = (data.get('results') or [None])[0]
if not res:
    sys.exit('Ville introuvable : ' + city)
lat, lon = res['latitude'], res['longitude']
p = 'weather.js'
s = open(p, encoding='utf-8').read()
s, a = re.subn(r"var LAT = [-0-9.]+;", "var LAT = %s;" % lat, s)
s, b = re.subn(r"var LON = [-0-9.]+;", "var LON = %s;" % lon, s)
if a != 1 or b != 1:
    sys.exit('weather.js : coordonnées introuvables')
open(p, 'w', encoding='utf-8').write(s)
print('  ✓ %s (%s, %s)' % (res.get('name'), lat, lon))
PY
  then
    echo "  ✗ Ville non enregistrée (vérifie le nom ou la connexion)"
  fi
}

set_photos() {
  read -r -p "  Dossier contenant les photos (ex. ~/Images) : " folder
  [ -z "$folder" ] && return
  if ! python3 - "$folder" <<'PY'
import os, shutil, sys
src = os.path.expanduser(sys.argv[1])
if not os.path.isdir(src):
    sys.exit('Dossier introuvable : ' + src)
exts = ('.jpg', '.jpeg', '.png', '.webp')
files = sorted(f for f in os.listdir(src) if f.lower().endswith(exts))[:12]
if not files:
    sys.exit('Aucune photo jpg, png ou webp dans ce dossier')
os.makedirs('photos', exist_ok=True)
names = []
for f in files:
    shutil.copy2(os.path.join(src, f), os.path.join('photos', f))
    names.append('photos/' + f)
head = open('photos.js', encoding='utf-8').read().split('var PHOTOS')[0]
body = 'var PHOTOS = [\n' + ',\n'.join("  '%s'" % n.replace("'", "\\'") for n in names) + '\n];\n'
open('photos.js', 'w', encoding='utf-8').write(head + body)
print('  ✓ %d photo(s) copiées dans photos/' % len(names))
PY
  then
    echo "  ✗ Photos non copiées"
  fi
}

serve() {
  need_python
  ip=$(hostname -I 2>/dev/null | awk '{print $1}')
  echo "Dashboard lancé."
  echo "  Sur cet ordinateur : http://localhost:$PORT"
  [ -n "$ip" ] && echo "  Sur la tablette   : http://$ip:$PORT (même Wi-Fi)"
  echo "  Arrêt : Ctrl+C"
  echo
  python3 -m http.server "$PORT"
}

menu() {
  banner
  while true; do
    echo "  1) Spotify (clé et pseudo Last.fm)"
    echo "  2) Ville pour la météo"
    echo "  3) Photos du diaporama (noir et blanc)"
    echo "  4) Tout configurer"
    echo "  5) Lancer le dashboard"
    echo "  q) Quitter"
    echo
    read -r -p "  Choix : " choice
    echo
    case "$choice" in
      1) set_lastfm ;;
      2) set_city ;;
      3) set_photos ;;
      4) set_lastfm; set_city; set_photos ;;
      5) serve ;;
      q|Q) exit 0 ;;
      *) echo "  Choix inconnu" ;;
    esac
    echo
  done
}

need_python
case "${1:-}" in
  serve) serve ;;
  *) menu ;;
esac
