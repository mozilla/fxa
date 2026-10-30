#!/bin/bash -e

# Turns a webpack bundle from node-service.webpack.js into a runnable layout:
#   /app     bundle, its package.json, and only the npm packages it requires
#   /assets  non-code files of the package and libs, at their repo paths
#
# Usage, from the repo root: install-bundle.sh <package-dir> [extra-dir...]
# Extra dirs are copied whole into /assets, for build output that contains code
# the browser loads (e.g. content-server's dist).

PKG_DIR=$1
shift

# Install outside the monorepo so yarn treats /app as its own project. Starting
# from the monorepo lockfile keeps versions identical; yarn drops the entries
# the bundle doesn't use.
cp -r "dist/$PKG_DIR" /app
cp -r .yarnrc.yml .yarn yarn.lock /app/
(
  cd /app
  yarn install
  rm -rf .yarn .yarnrc.yml yarn.lock
)

# Workspace packages are copied as-is; their dependencies were installed above.
node -e '
  const pkgs = require("/app/package.json").fxaWorkspacePackages || {};
  for (const [name, dir] of Object.entries(pkgs)) console.log(name, dir);
' | while read -r name dir; do
  mkdir -p "/app/node_modules/$(dirname "$name")"
  cp -r "$dir" "/app/node_modules/$name"
  rm -rf "/app/node_modules/$name/node_modules"
done

mkdir /assets
find "$PKG_DIR" libs \
    \( -name node_modules -o -name dist -o -name test -o -name tests \) -prune \
    -o -type f ! -name '*.ts' ! -name '*.tsx' ! -name '*.js' ! -name '*.mjs' \
    ! -name '*.cjs' ! -name '*.map' ! -name '*.md' ! -name '*.scss' -print0 \
  | xargs -0 cp --parents -t /assets
for dir in "$@"; do
  cp -r --parents "$dir" /assets
done
