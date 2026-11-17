#!/usr/bin/env bash
# Bereitet die Rechnung im Browser vor: Pyodide (Python als WebAssembly), die
# Python-Pakete von OpenFisca und das Modell openfisca_ch_sg. Alles landet in
# frontend/static/pyodide/ und wird von der Website selbst ausgeliefert, ohne
# CDN. Nach jeder Änderung am Modell erneut ausführen.
#
#   bash tools/build_pyodide.sh            (braucht npm install im frontend/)
#   PYTHON=/pfad/zu/python bash tools/build_pyodide.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PYTHON="${PYTHON:-python3}"
SRC="$ROOT/frontend/node_modules/pyodide"
OUT="$ROOT/frontend/static/pyodide"
VERSION="$(node -p "require('$SRC/package.json').version")"
CDN="https://cdn.jsdelivr.net/pyodide/v$VERSION/full"

# Pakete aus der Pyodide-Distribution (für WebAssembly gebaut).
PYODIDE_PAKETE=(numpy pyyaml python-dateutil six tzdata sortedcontainers typing-extensions)
# Reine Python-Pakete von PyPI. numexpr und psutil gibt es nicht als
# WebAssembly; motor.py ersetzt sie durch Platzhalter.
PYPI_PAKETE=(openfisca-core==46.0.4 dpath==2.2.0 StrEnum==0.4.15 pendulum==3.3.0)

rm -rf "$OUT"
mkdir -p "$OUT/wheels"

# 1. Pyodide selbst
cp "$SRC"/{pyodide.mjs,pyodide.asm.mjs,pyodide.asm.wasm,python_stdlib.zip,pyodide-lock.json} "$OUT/"

# 2. Pakete aus der Pyodide-Distribution (Dateinamen aus pyodide-lock.json)
for paket in "${PYODIDE_PAKETE[@]}"; do
	datei="$(node -p "require('$SRC/pyodide-lock.json').packages['$paket'].file_name")"
	if [ -f "$SRC/$datei" ]; then
		cp "$SRC/$datei" "$OUT/"
	else
		curl -sSfL -o "$OUT/$datei" "$CDN/$datei"
	fi
done

# 3. Reine Python-Pakete von PyPI
"$PYTHON" -m pip download --quiet --no-deps --only-binary=:all: \
	--python-version 3.14 --platform any --dest "$OUT/wheels" "${PYPI_PAKETE[@]}"

# 4. Das Modell (ohne Tests) als Zip
(cd "$ROOT/openfisca-CH-SG" && "$PYTHON" - "$OUT/openfisca_ch_sg.zip" <<'PY'
import pathlib, sys, zipfile
with zipfile.ZipFile(sys.argv[1], "w", zipfile.ZIP_DEFLATED) as z:
    for p in sorted(pathlib.Path("openfisca_ch_sg").rglob("*")):
        if p.is_file() and "__pycache__" not in p.parts and "tests" not in p.parts:
            z.write(p)
PY
)

# 5. Verzeichnis für den Worker
node -e "
const fs = require('fs');
fs.writeFileSync('$OUT/manifest.json', JSON.stringify({
	pyodide: process.argv.slice(1),
	wheels: fs.readdirSync('$OUT/wheels').sort(),
	modell: 'openfisca_ch_sg.zip'
}, null, 1));
" "${PYODIDE_PAKETE[@]}"

echo "Pyodide $VERSION und Modell in $OUT ($(du -sh "$OUT" | cut -f1))"
