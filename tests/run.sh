#!/bin/sh
# Extracts the DOM-free physics engine from docs/index.html and runs the equilibrium checks under Node.
set -e
cd "$(dirname "$0")/.."
tmp="$(mktemp -d)"
sed -n '/^<script>$/,/^<\/script>$/p' docs/index.html | sed '1d;$d' > "$tmp/engine.js"
node tests/engine-check.js "$tmp/engine.js"
rm -rf "$tmp"
