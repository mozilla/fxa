#!/bin/bash -e

start=`date +%s`

DIR=$(dirname "$0")
COMMAND=$1
PROJECTS=$2
cd "$DIR/.."

echo -e "\nChecking Node version compatibility..."

REQUIRED_NODE_VERSION=$(cat .nvmrc 2>/dev/null | tr -d 'v' || echo "")
CURRENT_NODE_VERSION=$(node -v 2>/dev/null | tr -d 'v')

if [[ -z "$REQUIRED_NODE_VERSION" || -z "$CURRENT_NODE_VERSION" ]]; then
  echo "❌ Could not determine required or current Node version"
  exit 1
fi

if node -e "const s = require('semver'); console.log(s.satisfies('$CURRENT_NODE_VERSION', s.validRange('$REQUIRED_NODE_VERSION') || s.coerce('$REQUIRED_NODE_VERSION')))" | grep -q true; then
  echo "✅ Node version is compatible (v$CURRENT_NODE_VERSION)"
else
  echo "❌ Incompatible Node version: expected $REQUIRED_NODE_VERSION, got v$CURRENT_NODE_VERSION"
  echo "   To fix: run 'nvm use'"
  exit 1
fi

mkdir -p artifacts

if [ -z "$PROJECTS" ]; then
  echo "▶️  Starting full stack..."
  npx nx run-many -t $COMMAND --all --exclude=fxa-dev-launcher --verbose
else
  # Start only provided projects and dependencies
  # Note dependencies are automatically determined by Nx
  echo "▶️  Starting selected projects: $PROJECTS"
  OUTPUT=$(npx nx run-many -t $COMMAND --projects=$PROJECTS --exclude=fxa-dev-launcher --verbose)

  echo "$OUTPUT"

  if echo "$OUTPUT"  | grep -q "No projects were run"; then
    echo -e "\n❌ Nx did not find any matching projects for: $PROJECTS" >&2
    exit 1
  fi
fi

end=`date +%s`
runtime=$((end-start))

echo -e "\n###########################################################"
echo -e "#  ✅ Stack Started Successfully in ${runtime}s"
echo -e "###########################################################"
echo -e ""
echo -e "  📍 Services:"
echo -e "     Content Server       http://localhost:3030"
echo -e "     Admin Panel          http://localhost:8091"
echo -e "     123done (RP)         http://localhost:8080"
echo -e ""
echo -e "  💡 Run 'yarn ports' to see all service ports"
echo -e "###########################################################\n"
