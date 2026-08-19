#!/usr/bin/env bash
# Mechanical checks for docs/CONVENTIONS.md. Run from the repo root:
#   bash .claude/skills/convention-review/scripts/check-conventions.sh
#
# Each section is a grep-shaped rule from CONVENTIONS.md. A hit is a candidate finding, not an
# automatic violation — some rules (one-exported-type-per-file, most notably) have named
# exceptions that only a reader can judge, and the selector/custom-property checks can't tell a
# component selector from a directive's or a third-party custom property from ours. Empty output
# under a heading means clean. Uses plain GNU grep (-E, no -P) so it runs anywhere without
# depending on a particular ripgrep install being on PATH.

set -uo pipefail

SRC="src/app"
STYLES="src/styles"

echo "== Legacy Angular decorators (@Input/@Output/@ViewChild) — CONVENTIONS.md#signals--zoneless =="
grep -rnE '@Input\(|@Output\(|@ViewChild\(' --include='*.ts' "$SRC" || echo "  none"
echo

echo "== Component selectors not using the st- prefix — CONVENTIONS.md#naming =="
grep -rn "selector:" --include='*.ts' "$SRC" | grep -v -- "st-" || echo "  none"
echo

echo "== CSS custom properties not using the --st- prefix — CONVENTIONS.md#naming =="
grep -rnE --include='*.scss' -- '--[a-zA-Z][a-zA-Z0-9-]*[[:space:]]*:' "$STYLES" "$SRC" \
  | grep -v -- "--st-" || echo "  none"
echo

echo "== Relative imports crossing 2+ directory levels (prefer a path alias) — CONVENTIONS.md#path-aliases =="
grep -rnE "from ['\"](\.\./){2,}" --include='*.ts' "$SRC" || echo "  none"
echo

echo "== Files with more than one top-level export (check against the exceptions list) — CONVENTIONS.md#file-organization =="
found=0
while IFS= read -r -d '' f; do
  count=$(grep -cE '^export (class|interface|type|enum|const|function|abstract class)' "$f")
  if [ "$count" -gt 1 ]; then
    echo "  $f ($count exports)"
    found=1
  fi
done < <(find "$SRC" -name '*.ts' -print0)
if [ "$found" -eq 0 ]; then
  echo "  none"
fi
exit 0
