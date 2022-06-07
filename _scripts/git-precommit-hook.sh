#!/bin/bash

# 1. Get the list of all modified and dependent packages.
# Cleans up yarn's output by removing everything before the package name, the first and the last line.
PACKAGES_MODIFIED=`yarn workspaces list --since=HEAD^ -R | cut -d/ -f2 | sed '1d' | sed '$d'`

# 2. If no packages were modified, return early; otherwise we'd build all packages.
if [[ $PACKAGES_MODIFIED == "" ]]; then
    echo "no modified packages found"
    exit 0
fi

echo "modified packages found"

# 3. Build all back-end TS packages in the list
ORIGINAL_IFS=$IFS
IFS=$'\n'
# We don't need to worry about front-end packages that use TS, since they must build successfully for CI to pass.
BACKEND_PACKAGES=( "fxa-auth-server" "fxa-event-broker" "fxa-graphql-api" "fxa-shared" "fxa-support-panel" "fxa-admin-server" )
INCLUDE_ARGS=''
for package_modified in $PACKAGES_MODIFIED; do
  if [[ " ${BACKEND_PACKAGES[@]} " =~ " ${package_modified} " ]]; then
      INCLUDE_ARGS="$INCLUDE_ARGS --include ${package_modified}"
  fi
done
IFS=$ORIGINAL_IFS
INCLUDE_ARGS=`echo "$INCLUDE_ARGS" | xargs` # trim whitespace at beginning of string
echo "compiling all modified and dependent backend TS packages..."
# We don't need to write files to disk, so use --noEmit here instead of --build for speed.
if ! `yarn workspaces foreach --verbose --topological-dev ${INCLUDE_ARGS} run compile > artifacts/compiling-affected-backend-packages.log`;
then
  echo -e "\n###########################################################\n"
  echo "# fxa couldn't build one or more packages. see artifacts/compiling-affected-backend-packages.log for details."
  echo -e "\n# If you see any unrelated TS errors, you could have a stale build of another package that changed recently. Try restarting fxa via 'yarn start'. See #12912."
  echo -e "\n###########################################################\n"
  exit 1
fi
