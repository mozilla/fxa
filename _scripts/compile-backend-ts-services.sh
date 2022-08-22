#!/bin/bash
if [ ! -d artifacts ]; then
  mkdir artifacts
fi

# 1. Get the list of all modified and dependent services.
echo "checking for modified services..."
# Cleans up yarn's output by removing everything before the package name, and the last line.
PACKAGES_MODIFIED=`yarn workspaces list --since=HEAD^ -R | cut -d/ -f2 | sed '$d'`

# 2. If no services were modified, return early; otherwise we'd try to compile everything.
if [[ $PACKAGES_MODIFIED == "" ]]; then
    echo "no modified services found"
    exit 0
fi
echo "modified services found"

# 3. Get a list of all modified and dependent backend TS services.
echo "checking for affected services..."
ORIGINAL_IFS=$IFS
IFS=$'\n'
# We don't need to worry about front-end services that use TS, since they must build successfully for CI to pass.
BACKEND_PACKAGES=( "fxa-admin-server" "fxa-auth-server" "fxa-event-broker" "fxa-graphql-api" "fxa-shared" "fxa-support-panel" )
INCLUDE_ARGS=''
AFFECTED_PACKAGES=''
for package_modified in $PACKAGES_MODIFIED; do
  if [[ " ${BACKEND_PACKAGES[@]} " =~ " ${package_modified} " ]]; then
      INCLUDE_ARGS="$INCLUDE_ARGS --include ${package_modified}"
      AFFECTED_PACKAGES="$AFFECTED_PACKAGES\n${package_modified}"
  fi
done
IFS=$ORIGINAL_IFS
if [[ $AFFECTED_PACKAGES == "" ]]; then
    echo "no affected services found"
    exit 0
fi
echo "affected services found:"
echo -e "$AFFECTED_PACKAGES" | sed '1d'

# 4. Compile all back-end TS services in the list
echo "compiling all modified and dependent backend TS services..."
echo -e "\nNote: if fxa-shared was modified and has any TS errors, the script will exit before compiling other services, since all other backend TS services depend on fxa-shared."
INCLUDE_ARGS=`echo "$INCLUDE_ARGS" | xargs` # trim whitespace at beginning of string
# We don't need to write files to disk, so `compile` uses `tsc --noEmit` here instead of `tsc --build` for speed.
if ! `yarn workspaces foreach --verbose --topological-dev --parallel ${INCLUDE_ARGS} run compile > artifacts/compiling-affected-backend-services.log`;
then
  echo -e "\n###########################################################\n"
  echo "# fxa couldn't compile one or more services. see artifacts/compiling-affected-backend-services.log for details."
  echo -e "\n###########################################################\n"
  exit 1
fi
