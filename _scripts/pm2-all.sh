#!/bin/bash -e

start=`date +%s`

DIR=$(dirname "$0")
COMMAND=$1
PROJECTS=$2
cd "$DIR/.."

echo -e "\nChecking Node version compatibility..."
"$DIR/check-node-version.sh"

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
