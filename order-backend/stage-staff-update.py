"""Stage only the three dashboard UI files into the existing test site."""
import json
import shutil
import tarfile
from datetime import datetime, timezone
from pathlib import Path

source = Path(__file__).resolve().parents[1] / 'order' / 'staff'
backend = Path.home() / 'stone-grill-orders-test' / 'order-backend'
config = json.loads((backend / 'firebase.json').read_text())
hosting = config.get('hosting', {})
if not isinstance(hosting, dict) or hosting.get('site') != 'stone-grill-orders-test':
    raise SystemExit('Stopped: expected the stone-grill-orders-test Hosting site.')
public = (backend / hosting['public']).resolve()
if not public.is_relative_to(backend.resolve()):
    raise SystemExit('Stopped: Hosting public directory must be inside the backend folder.')
target = public / 'order' / 'staff'
files = ['index.html', 'staff.js', 'staff.css']
for name in files:
    if not (source / name).is_file() or not (target / name).is_file():
        raise SystemExit('Stopped: missing source or existing dashboard file: ' + name)
backup = backend / ('staff-mobile-backup-' + datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S-%f') + '.tar.gz')
with tarfile.open(backup, 'w:gz') as archive:
    for name in files:
        archive.add(target / name, arcname=name)
for name in files:
    shutil.copy2(source / name, target / name)
print('Staff dashboard staged. Backup:', backup)
print('Nothing deployed. Customer checkout and profile files were preserved.')
